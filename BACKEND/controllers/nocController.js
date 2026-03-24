const NOC = require('../models/NOC');
const cloudinary = require('../config/cloudinary');
const { sendEmail } = require('../config/nodemailer');
const AuditLog = require('../models/AuditLog');

const createNocRequest = async (req, res) => {
  try {
    const { documentType, name, course, branch, year, session, reason, description } = req.body;
    
    // Upload ID Card Image
    let idCardUrl = '';
    if (req.file) {
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'noc_id_cards' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        uploadStream.end(req.file.buffer);
      });
      idCardUrl = await uploadPromise;
    } else {
      return res.status(400).json({ success: false, message: 'ID card upload is required' });
    }

    const newNoc = await NOC.create({
      studentId: req.student._id,
      documentType,
      name,
      course,
      branch,
      year,
      session,
      reason,
      description,
      idCardUrl,
      status: 'Pending_HOD'
    });

    // Email to student via nodemailer
    const emailHtml = `<h3>NOC Request Submitted</h3><p>Dear ${name}, your request for ${documentType} has been submitted successfully and is pending HOD approval.</p>`;
    await sendEmail(req.student.email, `NOC Request Submitted - ${documentType}`, emailHtml);

    res.status(201).json({ success: true, message: 'NOC request submitted', data: newNoc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getStudentNoc = async (req, res) => {
  try {
    const requests = await NOC.find({ studentId: req.student._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getHodNoc = async (req, res) => {
  try {
    // Only pending for HOD, or already acted by HOD
    const filter = req.query.status ? { status: req.query.status } : {};
    const requests = await NOC.find(filter).populate('studentId', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getAdminNoc = async (req, res) => {
  try {
    const { course, branch, year, status } = req.query;
    let filter = {};
    
    // Exact filtering depending on the tab the Admin is looking at
    if (status === 'Pending_Admin') {
      filter.status = 'Approved_HOD';
    } else if (status === 'Processed') {
      filter.status = { $in: ['Approved_Admin', 'Rejected_Admin'] };
    } else {
      filter.status = { $in: ['Approved_HOD', 'Approved_Admin', 'Rejected_Admin'] };
    }
    
    if (course) filter.course = course;
    if (branch) filter.branch = branch;
    if (year) filter.year = year;

    const requests = await NOC.find(filter).populate('studentId', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateHodAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body;

    if (!['Approved_HOD', 'Rejected_HOD'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    if (action === 'Rejected_HOD' && !remarks) {
      return res.status(400).json({ success: false, message: 'Remarks are required for rejection' });
    }

    const noc = await NOC.findById(id).populate('studentId');
    if (!noc) return res.status(404).json({ success: false, message: 'NOC not found' });

    noc.status = action;
    noc.hodRemarks = remarks || '';
    await noc.save();

    await AuditLog.create({
      actionType: action === 'Approved_HOD' ? 'NOC_APPROVAL' : 'NOC_REJECTION',
      performedBy: req.faculty._id, // Assuming HOD is faculty currently
      performedByModel: 'Faculty',
      targetEntity: noc._id,
      targetModel: 'NOC',
      details: `HOD ${action === 'Approved_HOD' ? 'approved' : 'rejected'} NOC`
    });

    if (action === 'Rejected_HOD') {
      const emailHtml = `<h3>NOC Request Rejected</h3><p>Dear ${noc.studentId.name}, your request for ${noc.documentType} was rejected. Reason: ${remarks}</p>`;
      await sendEmail(noc.studentId.email, `NOC Request Rejected - ${noc.documentType}`, emailHtml);
    }

    res.status(200).json({ success: true, message: `NOC updated to ${action}`, data: noc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateAdminAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason, collectionDate } = req.body;

    if (!['Approved_Admin', 'Rejected_Admin'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    if (action === 'Rejected_Admin' && !reason) {
      return res.status(400).json({ success: false, message: 'Reason is required for rejection' });
    }
    if (action === 'Approved_Admin' && !collectionDate) {
      return res.status(400).json({ success: false, message: 'Collection Date is required for approval' });
    }

    const noc = await NOC.findById(id).populate('studentId');
    if (!noc) return res.status(404).json({ success: false, message: 'NOC not found' });
    if (noc.status !== 'Approved_HOD') {
      return res.status(400).json({ success: false, message: 'NOC must be approved by HOD first' });
    }

    noc.status = action;
    if (action === 'Approved_Admin') {
      noc.collectionDate = new Date(collectionDate);
    } else {
      noc.adminRemarks = reason;
    }
    await noc.save();

    await AuditLog.create({
      actionType: action === 'Approved_Admin' ? 'NOC_APPROVAL' : 'NOC_REJECTION',
      performedBy: req.admin._id,
      performedByModel: 'Admin',
      targetEntity: noc._id,
      targetModel: 'NOC',
      details: `Admin ${action === 'Approved_Admin' ? 'approved' : 'rejected'} NOC`
    });

    if (action === 'Approved_Admin') {
      const cDateString = noc.collectionDate.toDateString();
      const emailHtml = `<h3>NOC Request Approved</h3><p>Dear ${noc.studentId.name}, your ${noc.documentType} has been finally approved. Collect your document from admin office on ${cDateString}.</p>`;
      await sendEmail(noc.studentId.email, `NOC Request Approved - ${noc.documentType}`, emailHtml);
    } else {
      const emailHtml = `<h3>NOC Request Rejected</h3><p>Dear ${noc.studentId.name}, your ${noc.documentType} was rejected by Admin. Reason: ${reason}</p>`;
      await sendEmail(noc.studentId.email, `NOC Request Rejected - ${noc.documentType}`, emailHtml);
    }

    res.status(200).json({ success: true, message: `NOC updated to ${action}`, data: noc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  createNocRequest,
  getStudentNoc,
  getHodNoc,
  getAdminNoc,
  updateHodAction,
  updateAdminAction
};

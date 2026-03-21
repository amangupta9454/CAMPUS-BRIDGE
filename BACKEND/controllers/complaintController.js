const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');
const { sendEmail } = require('../config/nodemailer');
const { complaintSubmittedTemplate, complaintWithdrawnTemplate } = require('../utils/emailTemplates');

const generateComplaintId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `HIET/COMP/${currentYear}/`;
  
  const lastComplaint = await Complaint.findOne({ 
    complaintId: { $regex: `^${prefix}` } 
  }).sort({ complaintId: -1 });

  let newNumber = 1;
  if (lastComplaint && lastComplaint.complaintId) {
    const lastNumStr = lastComplaint.complaintId.split(prefix)[1];
    if (lastNumStr) {
      newNumber = parseInt(lastNumStr, 10) + 1;
    }
  }

  const paddedNumber = newNumber.toString().padStart(3, '0');
  return `${prefix}${paddedNumber}`;
};

const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, remark } = req.body;
    
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'complaints' },
            (error, result) => {
              if (error) return reject(error);
              resolve(result.secure_url);
            }
          );
          uploadStream.end(file.buffer);
        });
      });
      imageUrls = await Promise.all(uploadPromises);
    }

    const complaintId = await generateComplaintId();

    const newComplaint = await Complaint.create({
      complaintId,
      student: req.student._id,
      title,
      description,
      category,
      priority,
      remark,
      images: imageUrls,
      history: [{
        status: 'Pending',
        message: 'Complaint registered successfully',
        updatedBy: 'System'
      }]
    });

    await Notification.create({
      user: req.student._id,
      userModel: 'Student',
      complaintId: newComplaint._id,
      title: 'Complaint Submitted',
      message: `Your complaint ${complaintId} has been successfully registered.`,
      type: 'success'
    });

    const emailHtml = complaintSubmittedTemplate(req.student.name, complaintId, title, priority, description);
    await sendEmail(req.student.email, `Complaint Registered: ${complaintId} - CampusBridge`, emailHtml);

    res.status(201).json({ success: true, message: 'Complaint registered successfully', complaint: newComplaint });

  } catch (error) {
    console.error('Error in createComplaint:', error.message);
    res.status(500).json({ success: false, message: 'Server error processing complaint' });
  }
};

const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ student: req.student._id })
      .populate('assignedFaculty', 'name department designation profileImage')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, student: req.student._id })
      .populate('assignedFaculty', 'name department designation profileImage');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    res.status(200).json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const withdrawComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ _id: req.params.id, student: req.student._id });
    
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (['Resolved', 'Rejected', 'Withdrawn'].includes(complaint.status)) {
      return res.status(400).json({ success: false, message: 'Cannot withdraw this complaint' });
    }

    complaint.status = 'Withdrawn';
    complaint.history.push({
      status: 'Withdrawn',
      message: 'Complaint withdrawn by the student',
      updatedBy: 'System'
    });

    await complaint.save();

    await Notification.create({
      user: req.student._id,
      userModel: 'Student',
      complaintId: complaint._id,
      title: 'Complaint Withdrawn',
      message: `You have successfully withdrawn complaint ${complaint.complaintId}.`,
      type: 'info'
    });

    if (req.student.email) {
      const emailHtml = complaintWithdrawnTemplate(req.student.name, complaint.complaintId);
      await sendEmail(req.student.email, `Complaint Withdrawn: ${complaint.complaintId}`, emailHtml);
    }

    res.status(200).json({ success: true, message: 'Complaint withdrawn successfully', complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const complaint = await Complaint.findOne({ _id: req.params.id, student: req.student._id });
    
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    
    const allowedStatuses = ['Resolved', 'Rejected', 'Withdrawn'];
    if (!allowedStatuses.includes(complaint.status)) {
      return res.status(400).json({ success: false, message: 'Feedback can only be provided for closed complaints' });
    }

    complaint.studentFeedback = {
      rating,
      comment,
      createdAt: Date.now()
    };

    await complaint.save();

    if (complaint.assignedFaculty) {
      await Notification.create({
        user: complaint.assignedFaculty,
        userModel: 'Faculty',
        complaintId: complaint._id,
        title: 'New Feedback Received',
        message: `A student provided a ${rating}-star feedback on complaint ${complaint.complaintId}.`,
        type: 'success'
      });
    }

    res.status(200).json({ success: true, message: 'Feedback submitted successfully', complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error submitting feedback' });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  withdrawComplaint,
  submitFeedback
};

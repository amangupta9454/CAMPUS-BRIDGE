const LostFound = require('../models/LostFound');
const Notification = require('../models/Notification');
const cloudinary = require('../config/cloudinary');
const { sendEmail } = require('../config/nodemailer');

// ─── Helper: upload buffer to Cloudinary ────────────────────────────────────
const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });

// ─── POST /api/lostfound/report ─────────────────────────────────────────────
const reportItem = async (req, res) => {
  try {
    const { itemName, foundLocation } = req.body;

    if (!itemName || !foundLocation) {
      return res.status(400).json({ success: false, message: 'Item name and found location are required' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Item photo is required' });
    }

    // Determine reporter type from which middleware attached the user
    const isStudent = !!req.student;
    const reporter = isStudent ? req.student : req.faculty;
    const foundBy = isStudent ? 'Student' : 'Faculty';
    const reporterModel = foundBy;

    // Upload image to Cloudinary
    const itemImage = await uploadToCloudinary(req.file.buffer, 'lostfound/items');

    const item = await LostFound.create({
      itemName,
      itemImage,
      foundLocation,
      foundBy,
      reporterModel,
      reporter: reporter._id,
      status: 'Pending'
    });

    // Notification to reporter
    await Notification.create({
      user: reporter._id,
      userModel: reporterModel,
      title: 'Lost & Found: Item Reported',
      message: `Your report for "${itemName}" found at "${foundLocation}" has been submitted.`,
      type: 'success'
    });

    // Email to reporter
    const emailHtml = `
      <div style="font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;">
        <h2 style="color:#6366f1;">Item Reported – CampusBridge Lost & Found</h2>
        <p>Hi ${reporter.name},</p>
        <p>Thank you for reporting a found item. Here are the details:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px;color:#64748b;font-size:13px;"><strong>Item:</strong></td><td style="padding:8px;font-size:13px;">${itemName}</td></tr>
          <tr style="background:#f8fafc;"><td style="padding:8px;color:#64748b;font-size:13px;"><strong>Location:</strong></td><td style="padding:8px;font-size:13px;">${foundLocation}</td></tr>
          <tr><td style="padding:8px;color:#64748b;font-size:13px;"><strong>Status:</strong></td><td style="padding:8px;font-size:13px;">Pending</td></tr>
        </table>
        <p>The admin team has been notified and will arrange for the item to be returned to the rightful owner.</p>
        <p style="color:#94a3b8;font-size:11px;margin-top:24px;">CampusBridge Resolution Engine</p>
      </div>`;

    await sendEmail(reporter.email, `Item Reported: ${itemName} – CampusBridge Lost & Found`, emailHtml);

    res.status(201).json({ success: true, message: 'Item reported successfully', item });
  } catch (err) {
    console.error('reportItem error:', err.message);
    res.status(500).json({ success: false, message: 'Server error reporting item' });
  }
};

// ─── GET /api/lostfound/all ─────────────────────────────────────────────────
const getAllItems = async (req, res) => {
  try {
    const { search = '', status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) query.itemName = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      LostFound.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        // Populate reporter name only (don't expose full profile)
        .populate('reporter', 'name'),
      LostFound.countDocuments(query)
    ]);

    res.json({ success: true, items, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('getAllItems error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PUT /api/lostfound/return/:id ─────────────────────────────────────────
const markReturned = async (req, res) => {
  try {
    const { receiverName, receiverEmail, receiverMobile } = req.body;

    if (!receiverName || !receiverEmail || !receiverMobile) {
      return res.status(400).json({ success: false, message: 'Receiver name, email, and mobile are required' });
    }
    if (!/^\d{10}$/.test(receiverMobile)) {
      return res.status(400).json({ success: false, message: 'Mobile must be exactly 10 digits' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Receiver photo is required' });
    }

    const item = await LostFound.findById(req.params.id).populate('reporter', 'name email');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.status === 'Returned') {
      return res.status(400).json({ success: false, message: 'Item already marked as returned' });
    }

    // Upload receiver photo
    const receiverPhoto = await uploadToCloudinary(req.file.buffer, 'lostfound/receivers');

    item.status = 'Returned';
    item.returnedDetails = {
      receiverName,
      receiverEmail,
      receiverMobile,
      receiverPhoto,
      returnedAt: new Date()
    };
    await item.save();

    // Notify original reporter
    if (item.reporter?._id) {
      await Notification.create({
        user: item.reporter._id,
        userModel: item.reporterModel,
        title: 'Lost & Found: Item Returned',
        message: `The item "${item.itemName}" you reported has been successfully returned to ${receiverName}.`,
        type: 'success'
      });

      // Email to reporter
      const emailHtml = `
        <div style="font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;">
          <h2 style="color:#10b981;">Item Returned – CampusBridge Lost & Found</h2>
          <p>Hi ${item.reporter.name},</p>
          <p>The item you reported has been <strong>successfully returned</strong> to its owner.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">
            <tr><td style="padding:8px;color:#64748b;font-size:13px;"><strong>Item:</strong></td><td style="padding:8px;font-size:13px;">${item.itemName}</td></tr>
            <tr style="background:#f8fafc;"><td style="padding:8px;color:#64748b;font-size:13px;"><strong>Location Found:</strong></td><td style="padding:8px;font-size:13px;">${item.foundLocation}</td></tr>
            <tr><td style="padding:8px;color:#64748b;font-size:13px;"><strong>Receiver Name:</strong></td><td style="padding:8px;font-size:13px;">${receiverName}</td></tr>
            <tr style="background:#f8fafc;"><td style="padding:8px;color:#64748b;font-size:13px;"><strong>Receiver Email:</strong></td><td style="padding:8px;font-size:13px;">${receiverEmail}</td></tr>
            <tr><td style="padding:8px;color:#64748b;font-size:13px;"><strong>Returned On:</strong></td><td style="padding:8px;font-size:13px;">${new Date().toLocaleString()}</td></tr>
          </table>
          <p>Thank you for your civic responsibility!</p>
          <p style="color:#94a3b8;font-size:11px;margin-top:24px;">CampusBridge Resolution Engine</p>
        </div>`;

      await sendEmail(item.reporter.email, `Item Returned: ${item.itemName} – CampusBridge`, emailHtml);
    }

    res.json({ success: true, message: 'Item marked as returned', item });
  } catch (err) {
    console.error('markReturned error:', err.message);
    res.status(500).json({ success: false, message: 'Server error marking item returned' });
  }
};

module.exports = { reportItem, getAllItems, markReturned };

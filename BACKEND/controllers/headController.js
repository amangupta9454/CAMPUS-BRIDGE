const Head = require('../models/Head');
const Faculty = require('../models/Faculty');
const Complaint = require('../models/Complaint');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const { sendEmail } = require('../config/nodemailer');
const generateAlphanumericOTP = require('../utils/generateOTP');
const Notification = require('../models/Notification');
const { verifyAccountTemplate, forgotPasswordTemplate, resetSuccessTemplate } = require('../utils/emailTemplates');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const generateHeadId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `HIET/TECH/COMPLAINT/${currentYear}/H`;
  
  const lastHead = await Head.findOne({ 
    headId: { $regex: `^${prefix}` } 
  }).sort({ headId: -1 });

  let newNumber = 1;
  if (lastHead && lastHead.headId) {
    const lastNumStr = lastHead.headId.split('/H')[1];
    if (lastNumStr) {
      newNumber = parseInt(lastNumStr, 10) + 1;
    }
  }

  const paddedNumber = newNumber.toString().padStart(3, '0');
  return `${prefix}${paddedNumber}`;
};

const registerHead = async (req, res) => {
  try {
    const { name, email, mobile, department, password } = req.body;

    let exists = await Head.findOne({ email });
    if (exists) {
      if (!exists.isVerified) {
         return res.status(400).json({ success: false, message: 'Head exists but unverified. Please verify your OTP.' });
      }
      return res.status(400).json({ success: false, message: 'Head already registered with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profileImageUrl = '';
    if (req.file) {
      profileImageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'head' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        uploadStream.end(req.file.buffer);
      });
    }

    const otp = generateAlphanumericOTP(6);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await Head.create({
      name, email, mobile, department,
      password: hashedPassword,
      profileImage: profileImageUrl,
      otp, otpExpiry,
      isVerified: false
    });

    const emailHtml = verifyAccountTemplate(name, otp);
    await sendEmail(email, 'Verify your account - CampusBridge Head', emailHtml);

    res.status(201).json({ success: true, message: 'Registration successful. Check your email for OTP.' });
  } catch (error) {
    console.error('Error in registerHead:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const head = await Head.findOne({ email });
    if (!head) return res.status(404).json({ success: false, message: 'Head not found' });
    if (head.isVerified) return res.status(400).json({ success: false, message: 'Already verified' });
    
    if (!head.otp || head.otp.toUpperCase() !== otp.toUpperCase()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    if (head.otpExpiry < Date.now()) return res.status(400).json({ success: false, message: 'OTP expired' });

    head.isVerified = true;
    head.otp = undefined;
    head.otpExpiry = undefined;
    head.headId = await generateHeadId();
    await head.save();

    res.status(200).json({ success: true, message: 'Verified successfully', headId: head.headId });
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
};

const loginHead = async (req, res) => {
  try {
    const { email, password } = req.body;
    const head = await Head.findOne({ email });
    if (!head) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!head.isVerified) return res.status(401).json({ success: false, message: 'Account not verified' });

    const isMatch = await bcrypt.compare(password, head.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.status(200).json({
      success: true,
      token: generateToken(head._id),
      head: {
        id: head._id, name: head.name, email: head.email, 
        profileImage: head.profileImage, department: head.department, 
        headId: head.headId
      }
    });
  } catch (error) {
    console.error('Error in loginHead:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const head = await Head.findOne({ email });
    if (!head) return res.status(404).json({ success: false, message: 'Email does not exist' });

    const otp = generateAlphanumericOTP(6);
    head.otp = otp;
    head.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await head.save();

    const emailHtml = forgotPasswordTemplate(head.name, otp);
    await sendEmail(email, 'Password Reset OTP - CampusBridge Head', emailHtml);

    res.status(200).json({ success: true, message: 'OTP sent' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const head = await Head.findOne({ email });
    if (!head) return res.status(404).json({ success: false, message: 'Not found' });
    if (!head.otp || head.otp.toUpperCase() !== otp.toUpperCase()) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (head.otpExpiry < Date.now()) return res.status(400).json({ success: false, message: 'OTP expired' });

    const salt = await bcrypt.genSalt(10);
    head.password = await bcrypt.hash(newPassword, salt);
    head.otp = undefined;
    head.otpExpiry = undefined;
    await head.save();

    const emailHtml = resetSuccessTemplate(head.name);
    await sendEmail(email, 'Password Reset Successful - CampusBridge', emailHtml);

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getHeadComplaints = async (req, res) => {
  try {
    // Head sees all complaints or filter by department if needed. 
    // Usually HODs see all in their department or global depending on scale.
    // Existing HOD dashboard fetched: Complaint.find({}) basically because `isHead` was globally true in getFacultyComplaints filter {}.
    const complaints = await Complaint.find({})
      .select('-student') 
      .populate('assignedFaculty', 'name designation')
      .sort({ createdAt: -1 });

    const stats = {
      total: complaints.length,
      highPriority: complaints.filter(c => c.priority === 'High').length,
      pending: complaints.filter(c => c.status === 'Pending').length,
      resolved: complaints.filter(c => c.status === 'Resolved').length,
    };

    res.status(200).json({ success: true, stats, complaints });
  } catch (error) {
    console.error('Error in getHeadComplaints:', error);
    res.status(500).json({ success: false, message: 'Server error fetching complaints' });
  }
};

const getFacultyListForHead = async (req, res) => {
  try {
    const cols = await Faculty.find({}).select('name email department designation facultyId');
    res.status(200).json({ success: true, faculty: cols });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching faculty' });
  }
};

const assignComplaintToFaculty = async (req, res) => {
  try {
    const { facultyId } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) return res.status(404).json({ success: false, message: 'Target faculty not found' });

    complaint.assignedFaculty = facultyId;
    if (complaint.status === 'Pending') complaint.status = 'In Progress';
    
    complaint.history.push({
      status: complaint.status,
      message: `Assigned to ${faculty.name} by Head ${req.head.name}`,
      updatedBy: req.head.name
    });

    await complaint.save();

    await Notification.create({
      user: facultyId,
      userModel: 'Faculty',
      complaintId: complaint._id,
      title: 'New Assignment',
      message: `Head assigned you complaint ${complaint.complaintId}.`,
      type: 'info'
    });

    res.status(200).json({ success: true, message: 'Complaint assigned successfully', complaint });
  } catch (error) {
    console.error('Error in assignComplaint:', error);
    res.status(500).json({ success: false, message: 'Server error assigning complaint' });
  }
};

module.exports = {
  registerHead, verifyOTP, loginHead, forgotPassword, resetPassword, getHeadComplaints, assignComplaintToFaculty, getFacultyListForHead
};

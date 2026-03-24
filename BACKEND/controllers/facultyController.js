const Faculty = require('../models/Faculty');
const Complaint = require('../models/Complaint');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const { sendEmail } = require('../config/nodemailer');
const generateAlphanumericOTP = require('../utils/generateOTP');
const Notification = require('../models/Notification');
const { verifyAccountTemplate, forgotPasswordTemplate, resetSuccessTemplate, statusUpdatedTemplate } = require('../utils/emailTemplates');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const generateFacultyId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `HIET/TECH/COMPLAINT/${currentYear}/A`;
  
  const lastFaculty = await Faculty.findOne({ 
    facultyId: { $regex: `^${prefix}` } 
  }).sort({ facultyId: -1 });

  let newNumber = 1;
  if (lastFaculty && lastFaculty.facultyId) {
    const lastNumStr = lastFaculty.facultyId.split('/A')[1];
    if (lastNumStr) {
      newNumber = parseInt(lastNumStr, 10) + 1;
    }
  }

  const paddedNumber = newNumber.toString().padStart(3, '0');
  return `${prefix}${paddedNumber}`;
};

// @desc    Register a faculty
// @route   POST /api/faculty/register
const registerFaculty = async (req, res) => {
  try {
    const { name, email, mobile, department, designation, password } = req.body;

    let exists = await Faculty.findOne({ email });
    if (exists) {
      if (!exists.isVerified) {
         return res.status(400).json({ success: false, message: 'Faculty exists but unverified. Please verify your OTP.' });
      }
      return res.status(400).json({ success: false, message: 'Faculty already registered with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profileImageUrl = '';
    if (req.file) {
      profileImageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'faculty' },
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

    await Faculty.create({
      name, email, mobile, department, designation,
      password: hashedPassword,
      profileImage: profileImageUrl,
      otp, otpExpiry,
      isVerified: false
    });

    const emailHtml = verifyAccountTemplate(name, otp);
    await sendEmail(email, 'Verify your account - CampusBridge Faculty', emailHtml);

    res.status(201).json({ success: true, message: 'Registration successful. Check your email for OTP.' });
  } catch (error) {
    console.error('Error in registerFaculty:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Verify OTP
// @route   POST /api/faculty/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const faculty = await Faculty.findOne({ email });
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });
    if (faculty.isVerified) return res.status(400).json({ success: false, message: 'Already verified' });
    
    if (!faculty.otp || faculty.otp.toUpperCase() !== otp.toUpperCase()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    if (faculty.otpExpiry < Date.now()) return res.status(400).json({ success: false, message: 'OTP expired' });

    faculty.isVerified = true;
    faculty.otp = undefined;
    faculty.otpExpiry = undefined;
    faculty.facultyId = await generateFacultyId();
    await faculty.save();

    res.status(200).json({ success: true, message: 'Verified successfully', facultyId: faculty.facultyId });
  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
};

// @desc    Login faculty
// @route   POST /api/faculty/login
const loginFaculty = async (req, res) => {
  try {
    const { email, password } = req.body;
    const faculty = await Faculty.findOne({ email });
    if (!faculty) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!faculty.isVerified) return res.status(401).json({ success: false, message: 'Account not verified' });

    const isMatch = await bcrypt.compare(password, faculty.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.status(200).json({
      success: true,
      token: generateToken(faculty._id),
      faculty: {
        id: faculty._id, name: faculty.name, email: faculty.email, 
        profileImage: faculty.profileImage, department: faculty.department, 
        designation: faculty.designation, facultyId: faculty.facultyId
      }
    });
  } catch (error) {
    console.error('Error in loginFaculty:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/faculty/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const faculty = await Faculty.findOne({ email });
    if (!faculty) return res.status(404).json({ success: false, message: 'Email does not exist' });

    const otp = generateAlphanumericOTP(6);
    faculty.otp = otp;
    faculty.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await faculty.save();

    const emailHtml = forgotPasswordTemplate(faculty.name, otp);
    await sendEmail(email, 'Password Reset OTP - CampusBridge Faculty', emailHtml);

    res.status(200).json({ success: true, message: 'OTP sent' });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reset Password
// @route   POST /api/faculty/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const faculty = await Faculty.findOne({ email });
    if (!faculty) return res.status(404).json({ success: false, message: 'Not found' });
    if (!faculty.otp || faculty.otp.toUpperCase() !== otp.toUpperCase()) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (faculty.otpExpiry < Date.now()) return res.status(400).json({ success: false, message: 'OTP expired' });

    const salt = await bcrypt.genSalt(10);
    faculty.password = await bcrypt.hash(newPassword, salt);
    faculty.otp = undefined;
    faculty.otpExpiry = undefined;
    await faculty.save();

    const emailHtml = resetSuccessTemplate(faculty.name);
    await sendEmail(email, 'Password Reset Successful - CampusBridge', emailHtml);

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get Faculty Dashboard Data (Complaints visible to them)
// @route   GET /api/faculty/complaints
const getFacultyComplaints = async (req, res) => {
  try {
    let filter = {};
    const isHead = req.faculty.designation === 'HOD' || (req.faculty.designation && req.faculty.designation.toLowerCase().includes('head'));
    if (!isHead) {
      filter.assignedFaculty = req.faculty._id;
    }

    const complaints = await Complaint.find(filter)
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
    console.error('Error in getFacultyComplaints:', error);
    res.status(500).json({ success: false, message: 'Server error fetching complaints' });
  }
};

// @desc    Update Complaint Status
// @route   POST /api/faculty/update-complaint/:id
const updateComplaint = async (req, res) => {
  try {
    const { status, reason } = req.body; // reason used for Delayed or Rejected
    const complaintId = req.params.id;

    if (['Delayed', 'Rejected'].includes(status) && (!reason || reason.trim() === '')) {
      return res.status(400).json({ success: false, message: `Reason is required when marking as ${status}` });
    }

    const complaint = await Complaint.findById(complaintId).populate('student', 'email name');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    // HODs can bypass, but normal faculty must be the assignee
    const isHead = req.faculty.designation === 'HOD' || (req.faculty.designation && req.faculty.designation.toLowerCase().includes('head'));
    if (!isHead) {
      if (!complaint.assignedFaculty || complaint.assignedFaculty.toString() !== req.faculty._id.toString()) {
         return res.status(403).json({ success: false, message: 'You are not assigned to resolve this complaint' });
      }
    }

    complaint.status = status;
    if (status === 'Delayed') complaint.delayReason = reason;
    if (status === 'Rejected') complaint.rejectReason = reason;
    
    // Assign faculty to this complaint if not assigned
    if (!complaint.assignedFaculty) {
      complaint.assignedFaculty = req.faculty._id;
    }

    complaint.history.push({
      status,
      message: status === 'Delayed' || status === 'Rejected' ? reason : `Complaint marked as ${status}`,
      updatedBy: req.faculty.name || 'Faculty Member'
    });

    await complaint.save();

    await Notification.create({
      user: complaint.student._id,
      userModel: 'Student',
      complaintId: complaint._id,
      title: `Status Updated to ${status}`,
      message: reason ? `Reason: ${reason}` : `Your complaint is now ${status}`,
      type: status === 'Resolved' ? 'success' : status === 'Rejected' ? 'error' : status === 'Delayed' ? 'warning' : 'info'
    });

    // Trigger email to student
    if (complaint.student && complaint.student.email) {
      const emailHtml = statusUpdatedTemplate(complaint.student.name, complaint.complaintId || 'Updated', status, reason);
      await sendEmail(complaint.student.email, `Complaint Update: ${status}`, emailHtml);
    }

    res.status(200).json({ success: true, message: 'Complaint updated successfully', complaint });
  } catch (error) {
    console.error('Error in updateComplaint:', error);
    res.status(500).json({ success: false, message: 'Server error updating complaint' });
  }
};

// @desc    Get List of Faculty for HOD Assignment
// @route   GET /api/faculty/colleagues
const getFacultyListForHOD = async (req, res) => {
  try {
    const isHead = req.faculty.designation === 'HOD' || (req.faculty.designation && req.faculty.designation.toLowerCase().includes('head'));
    if (!isHead) return res.status(403).json({ success: false, message: 'HOD privileges required' });
    const cols = await Faculty.find({ _id: { $ne: req.faculty._id } }).select('name email department designation facultyId');
    res.status(200).json({ success: true, faculty: cols });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching faculty' });
  }
};

// @desc    Assign Complaint to Faculty (HOD ONLY)
// @route   PUT /api/faculty/assign-complaint/:id
const assignComplaintToFaculty = async (req, res) => {
  try {
    const isHead = req.faculty.designation === 'HOD' || (req.faculty.designation && req.faculty.designation.toLowerCase().includes('head'));
    if (!isHead) return res.status(403).json({ success: false, message: 'HOD privileges required' });
    
    const { facultyId } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) return res.status(404).json({ success: false, message: 'Target faculty not found' });

    complaint.assignedFaculty = facultyId;
    if (complaint.status === 'Pending') complaint.status = 'In Progress';
    
    complaint.history.push({
      status: complaint.status,
      message: `Assigned to ${faculty.name} by HOD ${req.faculty.name}`,
      updatedBy: req.faculty.name
    });

    await complaint.save();

    await Notification.create({
      user: facultyId,
      userModel: 'Faculty',
      complaintId: complaint._id,
      title: 'New Assignment',
      message: `HOD assigned you complaint ${complaint.complaintId}.`,
      type: 'info'
    });

    res.status(200).json({ success: true, message: 'Complaint assigned successfully', complaint });
  } catch (error) {
    console.error('Error in assignComplaint:', error);
    res.status(500).json({ success: false, message: 'Server error assigning complaint' });
  }
};

const submitFacultyFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    
    const allowedStatuses = ['Resolved', 'Rejected', 'Withdrawn'];
    if (!allowedStatuses.includes(complaint.status)) {
      return res.status(400).json({ success: false, message: 'Feedback can only be provided for closed complaints' });
    }

    complaint.facultyFeedback = {
      rating,
      comment,
      createdAt: Date.now()
    };

    await complaint.save();

    await Notification.create({
      user: complaint.student,
      userModel: 'Student',
      complaintId: complaint._id,
      title: 'Faculty Evaluation Received',
      message: `Faculty provided feedback regarding complaint ${complaint.complaintId}.`,
      type: 'info'
    });

    res.status(200).json({ success: true, message: 'Faculty evaluation submitted', complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error parsing evaluation' });
  }
};

module.exports = {
  registerFaculty, verifyOTP, loginFaculty, forgotPassword, resetPassword, getFacultyComplaints, updateComplaint, assignComplaintToFaculty, submitFacultyFeedback, getFacultyListForHOD
};

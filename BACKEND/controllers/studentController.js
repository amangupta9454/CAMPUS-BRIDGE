const Student = require('../models/Student');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary');
const { sendEmail } = require('../config/nodemailer');
const generateAlphanumericOTP = require('../utils/generateOTP');
const { verifyAccountTemplate, forgotPasswordTemplate, resetSuccessTemplate } = require('../utils/emailTemplates');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const generateStudentId = async () => {
  const currentYear = new Date().getFullYear();
  const prefix = `HIET/STUDENT/COMPLAINT/${currentYear}/S`;
  
  const lastStudent = await Student.findOne({ 
    studentId: { $regex: `^${prefix}` } 
  }).sort({ studentId: -1 });

  let newNumber = 1;
  if (lastStudent && lastStudent.studentId) {
    const lastNumStr = lastStudent.studentId.split('/S')[1];
    if (lastNumStr) {
      newNumber = parseInt(lastNumStr, 10) + 1;
    }
  }

  const paddedNumber = newNumber.toString().padStart(3, '0');
  return `${prefix}${paddedNumber}`;
};

// @desc    Register a student
// @route   POST /api/student/register
// @access  Public
const registerStudent = async (req, res) => {
  try {
    const { name, email, mobile, course, branch, year, password } = req.body;

    let studentExists = await Student.findOne({ email });
    if (studentExists) {
      if (!studentExists.isVerified) {
         return res.status(400).json({ success: false, message: 'Student exists but unverified. Please verify your OTP.' });
      }
      return res.status(400).json({ success: false, message: 'Student already registered with this email' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let profileImageUrl = '';
    if (req.file) {
      profileImageUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'students' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        uploadStream.end(req.file.buffer);
      });
    }

    // Generate strict 6 char alphanumeric OTP
    const otp = generateAlphanumericOTP(6);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const student = await Student.create({
      name, email, mobile, course, branch, year,
      password: hashedPassword,
      profileImage: profileImageUrl,
      otp, otpExpiry,
      isVerified: false
    });

    const emailHtml = verifyAccountTemplate(name, otp);
    await sendEmail(email, 'Verify your account - CampusBridge', emailHtml);

    res.status(201).json({ success: true, message: 'Registration successful! Please check your email for the OTP.' });

  } catch (error) {
    console.error('Error in registerStudent:', error.message);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
};

// @desc    Verify OTP
// @route   POST /api/student/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    if (student.isVerified) return res.status(400).json({ success: false, message: 'Student is already verified' });
    
    // Case-insensitive match for alphanumeric OTP
    if (!student.otp || student.otp.toUpperCase() !== otp.toUpperCase()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    if (student.otpExpiry < Date.now()) return res.status(400).json({ success: false, message: 'OTP has expired' });

    student.isVerified = true;
    student.otp = undefined;
    student.otpExpiry = undefined;
    student.studentId = await generateStudentId();
    await student.save();

    res.status(200).json({ success: true, message: `Account verified successfully. ID: ${student.studentId}`, studentId: student.studentId });
  } catch (error) {
    console.error('Error in verifyOTP:', error.message);
    res.status(500).json({ success: false, message: 'Server error during OTP verification' });
  }
};

// @desc    Login student
// @route   POST /api/student/login
// @access  Public
const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!student.isVerified) return res.status(401).json({ success: false, message: 'Account not verified. Please verify your OTP.' });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.status(200).json({
      success: true,
      token: generateToken(student._id),
      student: {
        id: student._id, name: student.name, email: student.email, profileImage: student.profileImage, course: student.course, branch: student.branch, year: student.year, studentId: student.studentId
      }
    });
  } catch (error) {
    console.error('Error in loginStudent:', error.message);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/student/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ success: false, message: 'User with this email does not exist' });

    const otp = generateAlphanumericOTP(6);
    student.otp = otp;
    student.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await student.save();

    const emailHtml = forgotPasswordTemplate(student.name, otp);
    await sendEmail(email, 'Password Reset OTP - CampusBridge', emailHtml);

    res.status(200).json({ success: true, message: 'OTP sent to email for password reset' });
  } catch (error) {
    console.error('Error in forgotPassword:', error.message);
    res.status(500).json({ success: false, message: 'Server error during forgot password' });
  }
};

// @desc    Reset Password
// @route   POST /api/student/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const student = await Student.findOne({ email });
    if (!student) return res.status(404).json({ success: false, message: 'User not found' });
    if (!student.otp || student.otp.toUpperCase() !== otp.toUpperCase()) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (student.otpExpiry < Date.now()) return res.status(400).json({ success: false, message: 'OTP has expired' });

    const salt = await bcrypt.genSalt(10);
    student.password = await bcrypt.hash(newPassword, salt);
    student.otp = undefined;
    student.otpExpiry = undefined;
    await student.save();

    const emailHtml = resetSuccessTemplate(student.name);
    await sendEmail(email, 'Password Reset Successful - CampusBridge', emailHtml);

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in resetPassword:', error.message);
    res.status(500).json({ success: false, message: 'Server error during password reset' });
  }
};

// @desc    Get Student Dashboard Data
// @route   GET /api/student/dashboard
// @access  Private (Student)
const getDashboardData = async (req, res) => {
  try {
    const studentId = req.student._id;
    const complaints = await Complaint.find({ student: studentId }).sort({ createdAt: -1 });
    
    const stats = {
      total: complaints.length,
      pending: complaints.filter(c => c.status === 'Pending').length,
      resolved: complaints.filter(c => c.status === 'Resolved').length,
    };

    res.status(200).json({
      success: true,
      stats,
      recentComplaints: complaints.slice(0, 5) // Send top 5 recent
    });

  } catch (error) {
    console.error('Error in getDashboardData:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard data' });
  }
};

// @desc    Get Student Notifications
// @route   GET /api/student/notifications
// @access  Private (Student)
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.student._id, userModel: 'Student' })
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  registerStudent, verifyOTP, loginStudent, forgotPassword, resetPassword, getDashboardData, getMyNotifications
};

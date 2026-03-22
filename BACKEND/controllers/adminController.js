const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const { sendEmail } = require('../config/nodemailer');

// Helper: generate JWT for admin
const generateAdminToken = (id) => {
  return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/login
// ─────────────────────────────────────────────────────────────────────────────
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required' });

    const admin = await Admin.findOne({ email });
    if (!admin)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateAdminToken(admin._id);

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role }
    });
  } catch (err) {
    console.error('Admin login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats
// ─────────────────────────────────────────────────────────────────────────────
const getDashboardStats = async (req, res) => {
  try {
    const [totalStudents, totalFaculty, complaints] = await Promise.all([
      Student.countDocuments(),
      Faculty.countDocuments(),
      Complaint.find().lean()
    ]);

    const totalComplaints = complaints.length;
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const delayed = complaints.filter(c => c.status === 'Delayed').length;
    const rejected = complaints.filter(c => c.status === 'Rejected').length;
    const escalatedCount = complaints.filter(c => c.escalatedToAdmin === true).length;

    // Resolution rate
    const resolutionRate = totalComplaints > 0 ? ((resolved / totalComplaints) * 100).toFixed(1) : 0;

    // Average resolution time (in hours) for resolved complaints
    let avgResolutionHrs = null;
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved' && c.updatedAt && c.createdAt);
    if (resolvedComplaints.length > 0) {
      const totalMs = resolvedComplaints.reduce((sum, c) => {
        return sum + (new Date(c.updatedAt) - new Date(c.createdAt));
      }, 0);
      avgResolutionHrs = (totalMs / resolvedComplaints.length / 3600000).toFixed(1);
    }

    // SLA monitoring
    const now = new Date();
    const slaRules = { High: 24, Medium: 72, Low: 168, Critical: 12 };
    const overdue = [];
    const nearingDeadline = [];

    for (const c of complaints) {
      if (['Resolved', 'Rejected', 'Withdrawn'].includes(c.status)) continue;
      const slaHours = slaRules[c.priority] || 72;
      const deadline = c.slaDeadline ? new Date(c.slaDeadline) : new Date(c.createdAt);
      if (!c.slaDeadline) deadline.setHours(deadline.getHours() + slaHours);
      const diffHrs = (deadline - now) / 3600000;

      if (diffHrs < 0) overdue.push(c.complaintId);
      else if (diffHrs < 6) nearingDeadline.push(c.complaintId);
    }

    // Complaints by category
    const categoryMap = {};
    complaints.forEach(c => { categoryMap[c.category] = (categoryMap[c.category] || 0) + 1; });
    const byCategory = Object.entries(categoryMap).map(([name, count]) => ({ name, count }));

    // By priority
    const byPriority = [
      { name: 'Critical', count: complaints.filter(c => c.priority === 'Critical').length },
      { name: 'High', count: complaints.filter(c => c.priority === 'High').length },
      { name: 'Medium', count: complaints.filter(c => c.priority === 'Medium').length },
      { name: 'Low', count: complaints.filter(c => c.priority === 'Low').length },
    ];

    res.json({
      success: true,
      stats: {
        totalStudents, totalFaculty,
        totalComplaints, pending, inProgress, resolved, delayed, rejected, escalatedCount,
        resolutionRate, avgResolutionHrs,
        overdueCount: overdue.length, nearingDeadlineCount: nearingDeadline.length,
        byCategory, byPriority
      }
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/students
// ─────────────────────────────────────────────────────────────────────────────
const getStudents = async (req, res) => {
  try {
    const { search = '', course, branch, year, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }
    if (course) query.course = course;
    if (branch) query.branch = branch;
    if (year) query.year = year;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [students, total] = await Promise.all([
      Student.find(query).select('-password -otp -otpExpiry').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Student.countDocuments(query)
    ]);

    res.json({ success: true, students, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/faculty
// ─────────────────────────────────────────────────────────────────────────────
const getFacultyList = async (req, res) => {
  try {
    const { search = '', department, designation, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { facultyId: { $regex: search, $options: 'i' } }
      ];
    }
    if (department) query.department = department;
    if (designation) query.designation = designation;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [faculty, total] = await Promise.all([
      Faculty.find(query).select('-password -otp -otpExpiry').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Faculty.countDocuments(query)
    ]);

    res.json({ success: true, faculty, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/complaints
// ─────────────────────────────────────────────────────────────────────────────
const getAllComplaints = async (req, res) => {
  try {
    const { search = '', status, priority, category, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .populate('student', 'name email mobile course branch year studentId')  // Admin sees full student details
        .populate('assignedFaculty', 'name email department designation facultyId mobile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Complaint.countDocuments(query)
    ]);

    // SLA calculation
    const now = new Date();
    const slaRules = { High: 24, Medium: 72, Low: 168, Critical: 12 };
    const CLOSED = ['Resolved', 'Rejected', 'Withdrawn'];

    const enriched = complaints.map(c => {
      const obj = c.toObject();
      if (!CLOSED.includes(c.status)) {
        const slaHours = slaRules[c.priority] || 72;
        const deadline = c.slaDeadline ? new Date(c.slaDeadline) : new Date(c.createdAt);
        if (!c.slaDeadline) deadline.setHours(deadline.getHours() + slaHours);
        obj.slaDeadline = deadline;
        obj.deadline = deadline;
        obj.slaRemaining = deadline - now; // ms remaining for live timer
        obj.slaStatus = deadline < now ? 'overdue' : (deadline - now) / 3600000 < 6 ? 'nearing' : 'ok';
      } else {
        obj.slaStatus = 'closed';
        obj.slaRemaining = null;
      }
      // Lock flag: admin cannot modify closed complaints
      obj.isLocked = CLOSED.includes(c.status);
      return obj;
    });

    res.json({ success: true, complaints: enriched, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('getAllComplaints err:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/complaint/update/:id
// ─────────────────────────────────────────────────────────────────────────────
const updateComplaint = async (req, res) => {
  try {
    const { status, reason, message } = req.body;
    const complaint = await Complaint.findById(req.params.id).populate('student', 'name email');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const prevStatus = complaint.status;
    complaint.status = status;
    if (status === 'Delayed') complaint.delayReason = reason || '';
    if (status === 'Rejected') complaint.rejectReason = reason || '';

    complaint.history.push({
      status,
      reason: reason || '',
      message: message || `Status changed from ${prevStatus} to ${status} by Admin`,
      updatedBy: 'Admin'
    });

    await complaint.save();

    // Notify student
    if (complaint.student) {
      await Notification.create({
        user: complaint.student._id,
        userModel: 'Student',
        complaintId: complaint._id,
        title: `Complaint ${status}`,
        message: `Admin updated your complaint ${complaint.complaintId} to '${status}'.${reason ? ` Reason: ${reason}` : ''}`,
        type: status === 'Resolved' ? 'success' : status === 'Rejected' ? 'error' : 'info'
      });

      // Email student
      try {
        await sendEmail(
          complaint.student.email,
          `Complaint Update: ${complaint.complaintId} — ${status}`,
          `<div style="font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:auto;">
            <h2 style="color:#4F46E5;">Complaint Update - CampusBridge</h2>
            <p>Hi ${complaint.student.name},</p>
            <p>Your complaint <strong>${complaint.complaintId}</strong> has been updated to <strong>${status}</strong> by the Admin.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p style="color:#666;font-size:12px;margin-top:30px;">CampusBridge Resolution Engine</p>
          </div>`
        );
      } catch (_) {}
    }

    res.json({ success: true, message: 'Complaint updated by admin', complaint });
  } catch (err) {
    console.error('updateComplaint admin err:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/complaint/assign/:id
// ─────────────────────────────────────────────────────────────────────────────
const assignComplaint = async (req, res) => {
  try {
    const { facultyId } = req.body;
    const complaint = await Complaint.findById(req.params.id).populate('student', 'name email');
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

    const prevFaculty = complaint.assignedFaculty;
    complaint.assignedFaculty = facultyId;
    if (complaint.status === 'Pending') complaint.status = 'In Progress';

    // SLA deadline
    const slaRules = { High: 24, Medium: 72, Low: 168, Critical: 12 };
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + (slaRules[complaint.priority] || 72));
    complaint.deadline = deadline;
    complaint.slaDeadline = deadline;

    complaint.history.push({
      status: complaint.status,
      message: `Complaint ${prevFaculty ? 'reassigned' : 'assigned'} to ${faculty.name} (${faculty.department}) by Admin`,
      updatedBy: 'Admin'
    });

    await complaint.save();

    // Notify assigned faculty
    await Notification.create({
      user: facultyId,
      userModel: 'Faculty',
      complaintId: complaint._id,
      title: 'Complaint Assigned',
      message: `Admin assigned you complaint ${complaint.complaintId}: "${complaint.title}"`,
      type: 'info'
    });

    // Email faculty
    try {
      await sendEmail(
        faculty.email,
        `New Complaint Assigned: ${complaint.complaintId}`,
        `<div style="font-family:Arial,sans-serif;padding:20px;max-width:600px;margin:auto;">
          <h2 style="color:#4F46E5;">Complaint Assigned - CampusBridge</h2>
          <p>Hi ${faculty.name},</p>
          <p>You have been assigned complaint <strong>${complaint.complaintId}</strong>: <em>${complaint.title}</em></p>
          <p><strong>Priority:</strong> ${complaint.priority} | <strong>Deadline:</strong> ${deadline.toLocaleString()}</p>
          <p style="color:#666;font-size:12px;margin-top:30px;">CampusBridge Resolution Engine</p>
        </div>`
      );
    } catch (_) {}

    res.json({ success: true, message: 'Complaint assigned successfully', complaint });
  } catch (err) {
    console.error('assignComplaint admin err:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/notifications
// ─────────────────────────────────────────────────────────────────────────────
const getAdminNotifications = async (req, res) => {
  try {
    // Surface: new complaints, overdue items
    const recentComplaints = await Complaint.find({ status: 'Pending' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('complaintId title priority createdAt');

    const now = new Date();
    const slaRules = { High: 24, Medium: 72, Low: 168 };
    const overdue = await Complaint.find({ status: { $in: ['Pending', 'In Progress', 'Delayed'] } })
      .select('complaintId title priority createdAt status');

    const overdueList = overdue.filter(c => {
      const deadline = new Date(c.createdAt);
      deadline.setHours(deadline.getHours() + (slaRules[c.priority] || 72));
      return deadline < now;
    });

    res.json({ success: true, pending: recentComplaints, overdue: overdueList });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/escalated
// ─────────────────────────────────────────────────────────────────────────────
const getEscalatedComplaints = async (req, res) => {
  try {
    const escalated = await Complaint.find({ escalatedToAdmin: true })
      .populate('student', 'name email mobile course branch year studentId')
      .populate('assignedFaculty', 'name email department designation facultyId')
      .sort({ escalatedAt: -1 });

    res.json({ success: true, complaints: escalated, total: escalated.length });
  } catch (err) {
    console.error('getEscalatedComplaints err:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  loginAdmin,
  getDashboardStats,
  getStudents,
  getFacultyList,
  getAllComplaints,
  updateComplaint,
  assignComplaint,
  getAdminNotifications,
  getEscalatedComplaints
};

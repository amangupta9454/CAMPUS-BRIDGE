const Admin = require('../models/Admin');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const Complaint = require('../models/Complaint');
const NOC = require('../models/NOC');
const AuditLog = require('../models/AuditLog');

const getDashboardAnalytics = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const totalComplaints = await Complaint.countDocuments();
    const totalNocRequests = await NOC.countDocuments();

    // Recharts Data Arrays
    const complaints = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const complaintTrends = complaints.map(c => ({ name: c._id, value: c.count }));

    const nocs = await NOC.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const nocApprovalRate = nocs.map(n => ({ name: n._id, value: n.count }));

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalFaculty,
        totalComplaints,
        totalNocRequests,
        complaintTrends,
        nocApprovalRate
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving analytics' });
  }
};

const getUsers = async (req, res) => {
  try {
    const faculty = await Faculty.find().select('-password');
    const students = await Student.find().select('-password');
    const admins = await Admin.find().select('-password');
    res.status(200).json({ success: true, data: { faculty, students, admins } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving users' });
  }
};

const updateRole = async (req, res) => {
  try {
    const { userId, userType, targetRole } = req.body; // userType: 'Faculty', targetRole: 'HOD' or 'Admin'

    if (userType === 'Faculty') {
      const faculty = await Faculty.findById(userId);
      if (!faculty) return res.status(404).json({ success: false, message: 'Faculty not found' });

      if (targetRole === 'Admin') {
        // Create an admin document
        await Admin.create({
          name: faculty.name,
          email: faculty.email,
          password: faculty.password, // hashed already
          role: 'admin'
        });
        
        await AuditLog.create({
          actionType: 'ROLE_CHANGE',
          performedBy: req.admin._id,
          performedByModel: 'Admin', // If superadmin logs in as Admin model with role superadmin
          targetEntity: faculty._id,
          targetModel: 'Faculty',
          details: `Promoted faculty ${faculty.name} to Admin`
        });
      } else if (targetRole === 'HOD') {
        faculty.designation = 'HOD';
        await faculty.save();
        
        await AuditLog.create({
          actionType: 'ROLE_CHANGE',
          performedBy: req.admin._id,
          performedByModel: 'Admin',
          targetEntity: faculty._id,
          targetModel: 'Faculty',
          details: `Assigned HOD role to ${faculty.name}`
        });
      }
      return res.status(200).json({ success: true, message: `Role updated to ${targetRole}` });
    }

    res.status(400).json({ success: false, message: 'Invalid userType or targetRole' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating role' });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).populate('performedBy', 'name email');
    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error retrieving logs' });
  }
};

module.exports = {
  getDashboardAnalytics,
  getUsers,
  updateRole,
  getAuditLogs
};

const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/adminAuth');
const {
  loginAdmin,
  getDashboardStats,
  getStudents,
  getFacultyList,
  getAllComplaints,
  updateComplaint,
  assignComplaint,
  getAdminNotifications
} = require('../controllers/adminController');

// Public
router.post('/login', loginAdmin);

// Protected (admin only)
router.get('/stats', protectAdmin, getDashboardStats);
router.get('/students', protectAdmin, getStudents);
router.get('/faculty', protectAdmin, getFacultyList);
router.get('/complaints', protectAdmin, getAllComplaints);
router.get('/notifications', protectAdmin, getAdminNotifications);
router.put('/complaint/update/:id', protectAdmin, updateComplaint);
router.put('/complaint/assign/:id', protectAdmin, assignComplaint);

module.exports = router;

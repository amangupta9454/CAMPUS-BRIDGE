const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, protectFaculty } = require('../middleware/auth');
const { protectAdmin } = require('../middleware/adminAuth');
const {
  createNocRequest,
  getStudentNoc,
  getHodNoc,
  getAdminNoc,
  updateHodAction,
  updateAdminAction
} = require('../controllers/nocController');

// Student Routes
router.post('/create', protect, upload.single('idCard'), createNocRequest);
router.get('/student', protect, getStudentNoc);

// HOD Routes (Using Faculty auth since HOD is a faculty with HOD designation ideally)
router.get('/hod', protectFaculty, getHodNoc);
router.put('/hod-action/:id', protectFaculty, updateHodAction);

// Admin Routes
router.get('/admin', protectAdmin, getAdminNoc);
router.put('/admin-action/:id', protectAdmin, updateAdminAction);

module.exports = router;

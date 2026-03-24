const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protectFaculty } = require('../middleware/auth');
const {
  registerFaculty,
  verifyOTP,
  loginFaculty,
  forgotPassword,
  resetPassword,
  getFacultyComplaints,
  updateComplaint,
  assignComplaintToFaculty,
  submitFacultyFeedback,
  getFacultyListForHOD
} = require('../controllers/facultyController');

router.post('/register', upload.single('profileImage'), registerFaculty);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginFaculty);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/complaints', protectFaculty, getFacultyComplaints);
router.get('/colleagues', protectFaculty, getFacultyListForHOD);
router.post('/update-complaint/:id', protectFaculty, updateComplaint);
router.put('/assign-complaint/:id', protectFaculty, assignComplaintToFaculty);
router.put('/feedback/:id', protectFaculty, submitFacultyFeedback);

module.exports = router;

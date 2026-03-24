const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protectHead } = require('../middleware/auth');
const {
  registerHead,
  verifyOTP,
  loginHead,
  forgotPassword,
  resetPassword,
  getHeadComplaints,
  assignComplaintToFaculty,
  getFacultyListForHead
} = require('../controllers/headController');

router.post('/register', upload.single('profileImage'), registerHead);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginHead);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/complaints', protectHead, getHeadComplaints);
router.get('/colleagues', protectHead, getFacultyListForHead);
router.put('/assign-complaint/:id', protectHead, assignComplaintToFaculty);

module.exports = router;

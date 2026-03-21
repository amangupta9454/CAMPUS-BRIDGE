const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const {registerStudent,verifyOTP,loginStudent,forgotPassword,resetPassword,getDashboardData,getMyNotifications} = require('../controllers/studentController');

router.post('/register', upload.single('profileImage'), registerStudent);
router.post('/verify-otp', verifyOTP);
router.post('/login', loginStudent);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/dashboard', protect, getDashboardData);
router.get('/notifications', protect, getMyNotifications);

module.exports = router;

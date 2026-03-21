const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');
const { createComplaint, getMyComplaints, getComplaintById, withdrawComplaint, submitFeedback } = require('../controllers/complaintController');

router.post('/create', protect, upload.array('images', 3), createComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/:id', protect, getComplaintById);
router.put('/withdraw/:id', protect, withdrawComplaint);
router.put('/feedback/:id', protect, submitFeedback);

module.exports = router;

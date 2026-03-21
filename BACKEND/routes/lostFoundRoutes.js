const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, protectFaculty } = require('../middleware/auth');
const { protectAdmin } = require('../middleware/adminAuth');
const { reportItem, getAllItems, markReturned } = require('../controllers/lostFoundController');

// Flexible middleware: accepts Student, Faculty, OR Admin JWT
const protectAny = async (req, res, next) => {
  const jwt = require('jsonwebtoken');
  const Student = require('../models/Student');
  const Faculty = require('../models/Faculty');
  const Admin   = require('../models/Admin');

  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Admin role
    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id).select('-password');
      if (admin) { req.admin = admin; return next(); }
    }

    // Student
    const student = await Student.findById(decoded.id).select('-password');
    if (student) { req.student = student; return next(); }

    // Faculty
    const faculty = await Faculty.findById(decoded.id).select('-password');
    if (faculty) { req.faculty = faculty; return next(); }

    return res.status(401).json({ success: false, message: 'User not found' });
  } catch {
    return res.status(401).json({ success: false, message: 'Token failed' });
  }
};

// Routes
router.post('/report', protectAny, upload.single('itemImage'), reportItem);
router.get('/all', protectAny, getAllItems);
router.put('/return/:id', protectAny, upload.single('receiverPhoto'), markReturned);

module.exports = router;

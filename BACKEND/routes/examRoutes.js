const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, protectFaculty } = require('../middleware/auth');
const { createTimetable, getTimetable } = require('../controllers/examController');
const { uploadInternalMarks, getStudentInternalMarks } = require('../controllers/internalMarksController');
const { uploadExamResult, getStudentExamResult } = require('../controllers/resultController');

// Timetable
router.post('/timetable', protectFaculty, createTimetable);
router.get('/timetable', getTimetable); // Can be accessed without auth or add protect

// Internal Marks
router.post('/internal/upload', protectFaculty, upload.single('excel'), uploadInternalMarks);
router.get('/internal/:studentId', protect, getStudentInternalMarks); // Students can fetch their own

// Results
router.post('/result/upload', protectFaculty, upload.single('excel'), uploadExamResult);
router.get('/result/:studentId', protect, getStudentExamResult);

module.exports = router;

const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  subjectName: {
    type: String,
    required: true
  },
  subjectId: {
    type: String,
    required: true
  },
  totalMarks: {
    type: Number,
    required: true
  },
  obtainedMarks: {
    type: Number,
    required: true
  },
  facultyName: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ExamResult', examResultSchema);

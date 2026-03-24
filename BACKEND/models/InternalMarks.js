const mongoose = require('mongoose');

const internalMarksSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    ref: 'Student' // referencing studentId field or _id depending on how it's stored. Storing as String for easy lookup with enrollment number if applicable.
  },
  subjectName: {
    type: String,
    required: true
  },
  subjectId: {
    type: String,
    required: true
  },
  totalInternalMarks: {
    type: Number,
    required: true
  },
  obtainedInternalMarks: {
    type: Number,
    required: true
  },
  totalExternalMarks: {
    type: Number,
    required: true
  },
  obtainedExternalMarks: {
    type: Number,
    required: true
  },
  totalLabMarks: {
    type: Number,
    required: true
  },
  obtainedLabMarks: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('InternalMarks', internalMarksSchema);

const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  subjectId: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    enum: ['Mid', 'End', 'Practical'],
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);

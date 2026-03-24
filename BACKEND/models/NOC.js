const mongoose = require('mongoose');

const nocSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  documentType: {
    type: String,
    enum: ['NOC', 'No Dues', 'Other'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  session: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  idCardUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending_HOD', 'Approved_HOD', 'Rejected_HOD', 'Approved_Admin', 'Rejected_Admin'],
    default: 'Pending_HOD'
  },
  hodRemarks: {
    type: String,
    default: ''
  },
  adminRemarks: {
    type: String,
    default: ''
  },
  collectionDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('NOC', nocSchema);

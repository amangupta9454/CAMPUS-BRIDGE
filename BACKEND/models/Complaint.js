const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  status: { type: String, required: true },
  reason: { type: String },
  message: { type: String },
  updatedBy: { type: mongoose.Schema.Types.Mixed }, // Can be 'System' or Faculty ID
  timestamp: { type: Date, default: Date.now }
});

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, required: true, unique: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'Other' },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Delayed', 'Rejected', 'Objection', 'Withdrawn'], default: 'Pending' },
  assignedFaculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  deadline: { type: Date },
  delayReason: { type: String },
  rejectReason: { type: String },
  images: [{ type: String }], // Array of Cloudinary URLs
  remark: { type: String }, // Optional student note
  history: [historySchema],
  studentFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  },
  facultyFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);

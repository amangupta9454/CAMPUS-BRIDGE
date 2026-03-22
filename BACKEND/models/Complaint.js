const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  status: { type: String, required: true },
  reason: { type: String },
  message: { type: String },
  updatedBy: { type: mongoose.Schema.Types.Mixed }, // Can be 'System' or Faculty ID
  timestamp: { type: Date, default: Date.now }
});

const SLA_HOURS = { High: 24, Medium: 72, Low: 168, Critical: 12 };

const complaintSchema = new mongoose.Schema({
  complaintId: { type: String, required: true, unique: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'Other' },
  priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Delayed', 'Rejected', 'Objection', 'Withdrawn'], default: 'Pending' },
  assignedFaculty: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  deadline: { type: Date },
  slaDeadline: { type: Date }, // Computed SLA deadline for live timer
  escalatedToAdmin: { type: Boolean, default: false },
  escalatedAt: { type: Date },
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

// Auto-compute slaDeadline before saving if not set
complaintSchema.pre('save', function (next) {
  if (!this.slaDeadline && this.priority) {
    const hours = SLA_HOURS[this.priority] || 72;
    this.slaDeadline = new Date(this.createdAt || Date.now());
    this.slaDeadline.setHours(this.slaDeadline.getHours() + hours);
  }
  next();
});

module.exports = mongoose.model('Complaint', complaintSchema);

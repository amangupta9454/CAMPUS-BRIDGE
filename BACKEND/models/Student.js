const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  course: { type: String, required: true },
  branch: { type: String, required: true },
  year: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: { type: String }, // Cloudinary URL
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  studentId: { type: String, unique: true, sparse: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);

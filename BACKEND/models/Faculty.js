const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: { type: String }, // Cloudinary URL
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  facultyId: { type: String, unique: true, sparse: true }, // Not generated until verified
}, {
  timestamps: true
});

module.exports = mongoose.model('Faculty', facultySchema);

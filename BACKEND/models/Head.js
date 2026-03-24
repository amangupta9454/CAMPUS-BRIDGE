const mongoose = require('mongoose');

const headSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  department: { type: String, required: true },
  password: { type: String, required: true },
  profileImage: { type: String }, // Cloudinary URL
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  headId: { type: String, unique: true, sparse: true }, 
  role: { type: String, default: 'Head' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Head', headSchema);

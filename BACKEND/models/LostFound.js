const mongoose = require('mongoose');

const lostFoundSchema = new mongoose.Schema({
  itemName: { type: String, required: true, trim: true },
  itemImage: { type: String, required: true }, // Cloudinary URL
  foundLocation: { type: String, required: true, trim: true },
  foundBy: { type: String, enum: ['Student', 'Faculty'], required: true },
  reporterModel: { type: String, enum: ['Student', 'Faculty'], required: true },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'reporterModel',
    required: true
  },
  status: { type: String, enum: ['Pending', 'Returned'], default: 'Pending' },
  returnedDetails: {
    receiverName: { type: String },
    receiverEmail: { type: String },
    receiverMobile: { type: String },
    receiverPhoto: { type: String }, // Cloudinary URL
    returnedAt: { type: Date }
  }
}, { timestamps: true });

module.exports = mongoose.model('LostFound', lostFoundSchema);

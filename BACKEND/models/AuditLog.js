const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actionType: {
    type: String,
    required: true,
    enum: ['NOC_APPROVAL', 'NOC_REJECTION', 'ROLE_CHANGE', 'SYSTEM_OVERRIDE']
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'performedByModel'
  },
  performedByModel: {
    type: String,
    required: true,
    enum: ['Admin', 'SuperAdmin', 'Faculty']
  },
  targetEntity: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetModel: {
    type: String,
    required: true,
    enum: ['NOC', 'Faculty', 'Student']
  },
  details: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);

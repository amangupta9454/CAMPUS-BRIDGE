const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/adminAuth');
const {
  getDashboardAnalytics,
  getUsers,
  updateRole,
  getAuditLogs
} = require('../controllers/superAdminController');

// Super admin verify middleware (checks for SuperAdmin role)
const superAdminAuth = async (req, res, next) => {
  protectAdmin(req, res, () => {
    if (req.admin && req.admin.role === 'SuperAdmin') {
      next();
    } else {
      res.status(403).json({ success: false, message: 'SuperAdmin access required' });
    }
  });
};

router.get('/dashboard', protectAdmin, getDashboardAnalytics); // Admin/Director can also see dashboard
router.get('/users', superAdminAuth, getUsers);
router.put('/role-update', superAdminAuth, updateRole);
router.get('/logs', superAdminAuth, getAuditLogs);

module.exports = router;

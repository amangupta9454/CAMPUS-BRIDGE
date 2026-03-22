const cron = require('node-cron');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const Admin = require('../models/Admin');
const { sendEmail } = require('../config/nodemailer');
const { escalationAlertTemplate } = require('../utils/emailTemplates');

const SLA_HOURS = { High: 24, Medium: 72, Low: 168, Critical: 12 };
const CLOSED_STATUSES = ['Resolved', 'Rejected', 'Withdrawn'];

/**
 * Runs every 15 minutes.
 * Finds open complaints past their SLA deadline that haven't been escalated yet.
 * Marks them as Critical priority, escalatedToAdmin = true
 * Sends notification + email to admin.
 */
const startSLAEscalationJob = () => {
  cron.schedule('*/15 * * * *', async () => {
    console.log(`[SLA-CRON] Escalation check running at ${new Date().toISOString()}`);
    try {
      const now = new Date();

      // Find overdue, non-closed, non-escalated complaints
      const overdueComplaints = await Complaint.find({
        status: { $nin: CLOSED_STATUSES },
        escalatedToAdmin: { $ne: true },
        slaDeadline: { $lt: now }
      }).populate('student', 'name email');

      if (overdueComplaints.length === 0) {
        console.log('[SLA-CRON] No overdue complaints found.');
        return;
      }

      console.log(`[SLA-CRON] Found ${overdueComplaints.length} overdue complaint(s). Escalating...`);

      // Get admin email for notifications
      const admin = await Admin.findOne({});
      const adminEmail = admin?.email || process.env.ADMIN_EMAIL;

      for (const complaint of overdueComplaints) {
        const prevPriority = complaint.priority;

        // Mark as Critical and escalated
        complaint.priority = 'Critical';
        complaint.escalatedToAdmin = true;
        complaint.escalatedAt = now;

        complaint.history.push({
          status: complaint.status,
          message: `⚠️ Auto-escalated to Admin — SLA breached (was ${prevPriority} priority, deadline: ${complaint.slaDeadline?.toLocaleString()})`,
          updatedBy: 'System'
        });

        await complaint.save();

        // Create notification for admin
        if (admin) {
          await Notification.create({
            user: admin._id,
            userModel: 'Admin',
            complaintId: complaint._id,
            title: '🚨 SLA Breach — Auto-Escalated',
            message: `Complaint ${complaint.complaintId} "${complaint.title}" has breached SLA. Priority upgraded to Critical.`,
            type: 'error'
          });
        }

        // Send escalation email to admin
        if (adminEmail) {
          try {
            const studentName = complaint.student?.name || 'Unknown Student';
            const emailHtml = escalationAlertTemplate(
              complaint.complaintId,
              complaint.title,
              prevPriority,
              studentName,
              complaint.slaDeadline
            );
            await sendEmail(
              adminEmail,
              `🚨 SLA BREACH: ${complaint.complaintId} — Auto-Escalated to Critical`,
              emailHtml
            );
          } catch (emailErr) {
            console.error('[SLA-CRON] Email send failed:', emailErr.message);
          }
        }

        // Also notify the student
        if (complaint.student) {
          await Notification.create({
            user: complaint.student._id,
            userModel: 'Student',
            complaintId: complaint._id,
            title: 'Complaint Escalated',
            message: `Your complaint ${complaint.complaintId} has been auto-escalated due to SLA breach. Admin has been notified for urgent action.`,
            type: 'warning'
          });
        }

        console.log(`[SLA-CRON] Escalated: ${complaint.complaintId}`);
      }

      console.log(`[SLA-CRON] Escalation complete. ${overdueComplaints.length} complaint(s) escalated.`);
    } catch (error) {
      console.error('[SLA-CRON] Error during escalation check:', error.message);
    }
  });

  console.log('[SLA-CRON] ✅ SLA Escalation Job scheduled (every 15 minutes)');
};

module.exports = startSLAEscalationJob;

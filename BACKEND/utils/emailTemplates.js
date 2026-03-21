const verifyAccountTemplate = (name, otp) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color: #4F46E5;">Welcome to CampusBridge!</h2>
    <p>Hi ${name},</p>
    <p>Thank you for registering. Please use the following OTP to verify your account:</p>
    <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
      <h1 style="color: #4F46E5; letter-spacing: 5px; margin: 0;">${otp}</h1>
    </div>
    <p>This OTP will expire in 10 minutes.</p>
    <p style="color: #666; font-size: 12px; margin-top: 30px;">If you did not request this, please ignore this email.</p>
  </div>
`;

const forgotPasswordTemplate = (name, otp) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color: #4F46E5;">Password Reset - CampusBridge</h2>
    <p>Hi ${name},</p>
    <p>You have requested a password reset. Please use the following OTP:</p>
    <div style="background-color: #f3f4f6; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
      <h1 style="color: #4F46E5; letter-spacing: 5px; margin: 0;">${otp}</h1>
    </div>
    <p>This OTP will expire in 10 minutes.</p>
    <p style="color: #666; font-size: 12px; margin-top: 30px;">If you did not request this, please secure your account immediately.</p>
  </div>
`;

const resetSuccessTemplate = (name) => `
  <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color: #10B981;">Password Reset Successful</h2>
    <p>Hi ${name},</p>
    <p>Your password has been successfully reset. You can now login with your new password.</p>
    <p style="color: #666; font-size: 12px; margin-top: 30px;">If you did not perform this action, please contact support immediately.</p>
  </div>
`;

const complaintSubmittedTemplate = (name, complaintId, title, priority, desc) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Complaint Registered</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${name},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                Your complaint has been successfully registered in the CampusBridge system.
            </p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #4f46e5; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Complaint ID:</strong> ${complaintId}</p>
                <p style="margin: 0 0 10px 0;"><strong>Title:</strong> ${title}</p>
                <p style="margin: 0 0 10px 0;"><strong>Priority:</strong> ${priority}</p>
                <p style="margin: 0; color: #64748b; font-size: 14px;">"${desc}"</p>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                Our faculty will review it shortly. You can track the status in your student dashboard.
            </p>
        </div>
        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} CampusBridge. All rights reserved.</p>
        </div>
    </div>
  `;
};

const statusUpdatedTemplate = (name, complaintId, newStatus, reason) => {
  const statusColors = {
    'Resolved': '#10b981',
    'Delayed': '#f59e0b',
    'Rejected': '#ef4444',
    'In Progress': '#0ea5e9'
  };
  const color = statusColors[newStatus] || '#4f46e5';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: ${color}; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Complaint Status Update</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${name},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                There has been an update regarding your complaint <strong>${complaintId}</strong>.
            </p>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid ${color}; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>New Status:</strong> <span style="color: ${color}; font-weight: bold;">${newStatus}</span></p>
                ${reason ? `<p style="margin: 0; border-top: 1px solid #e2e8f0; padding-top: 10px;"><strong>Message from Faculty:</strong><br><span style="color: #64748b; font-size: 14px;">"${reason}"</span></p>` : ''}
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                Login to your student dashboard to track detailed timelines.
            </p>
        </div>
    </div>
  `;
};

const complaintWithdrawnTemplate = (name, complaintId) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #64748b; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Complaint Withdrawn</h1>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${name},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                This is a confirmation that your complaint <strong>${complaintId}</strong> has been successfully withdrawn from the CampusBridge system at your request.
            </p>
            <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                No further action will be taken by the faculty regarding this specific issue. If this was a mistake, or if the issue persists, you are welcome to file a new complaint at any time.
            </p>
        </div>
    </div>
  `;
};

module.exports = {
  verifyAccountTemplate,
  forgotPasswordTemplate,
  resetSuccessTemplate,
  complaintSubmittedTemplate,
  statusUpdatedTemplate,
  complaintWithdrawnTemplate
};

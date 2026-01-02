const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter with Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Gmail App Password
    },
  });
};

// Send feedback email to admin
const sendFeedbackEmail = async (feedbackData) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || 'drishtisingla868@gmail.com',
      subject: `New Feedback: ${feedbackData.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">New Feedback Received</h2>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Title:</strong> ${feedbackData.title}</p>
            <p><strong>Type:</strong> ${feedbackData.concernType}</p>
            <p><strong>Priority:</strong> ${feedbackData.priority}</p>
            <p><strong>From:</strong> ${feedbackData.username} (${feedbackData.email})</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background: #ffffff; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3 style="margin-top: 0;">Feedback Details:</h3>
            <p style="line-height: 1.6;">${feedbackData.description}</p>
          </div>

          ${feedbackData.imageUrls && feedbackData.imageUrls.length > 0 ? `
            <div style="margin: 20px 0;">
              <h3>Attached Screenshots:</h3>
              ${feedbackData.imageUrls.map(url => `
                <img src="${url}" alt="Screenshot" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" />
              `).join('')}
            </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>This is an automated email from Recyconnect. Please do not reply directly to this email.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Feedback email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending feedback email:', error);
    return { success: false, error: error.message };
  }
};

// Send concern email to admin
const sendConcernEmail = async (concernData) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || 'drishtisingla868@gmail.com',
      subject: `New Concern: ${concernData.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">New Concern Reported</h2>
          
          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Title:</strong> ${concernData.title}</p>
            <p><strong>Type:</strong> ${concernData.concernType}</p>
            <p><strong>Priority:</strong> <span style="color: ${concernData.priority === 'high' ? '#dc2626' : concernData.priority === 'medium' ? '#f59e0b' : '#10b981'};">${concernData.priority.toUpperCase()}</span></p>
            <p><strong>From:</strong> ${concernData.username} (${concernData.email})</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background: #ffffff; padding: 20px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <h3 style="margin-top: 0;">Concern Details:</h3>
            <p style="line-height: 1.6;">${concernData.description}</p>
          </div>

          ${concernData.imageUrls && concernData.imageUrls.length > 0 ? `
            <div style="margin: 20px 0;">
              <h3>Attached Images:</h3>
              ${concernData.imageUrls.map(url => `
                <img src="${url}" alt="Concern Image" style="max-width: 100%; height: auto; border-radius: 8px; margin: 10px 0;" />
              `).join('')}
            </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
            <p>This is an automated email from Recyconnect. Please review and respond to this concern.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Concern email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending concern email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendFeedbackEmail,
  sendConcernEmail,
};

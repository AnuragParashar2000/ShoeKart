const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `ShopKart <${process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(message, (error, info) => {
    if (error) {
      console.log("Email not sent: " + error.message);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

// Password reset email template
const sendPasswordResetEmail = async (email, otp, resetLink) => {
  const message = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset - ShopKart</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .otp-box { background: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; font-size: 24px; font-weight: bold; letter-spacing: 5px; }
        .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello!</h2>
          <p>We received a request to reset your password for your ShopKart account.</p>
          
          <h3>Option 1: Use OTP Code</h3>
          <p>Enter this 6-digit code in the password reset form:</p>
          <div class="otp-box">${otp}</div>
          
          <h3>Option 2: Use Reset Link</h3>
          <p>Click the button below to reset your password:</p>
          <a href="${resetLink}" class="button">Reset Password</a>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This OTP and link will expire in 10 minutes</li>
              <li>You can only use this code once</li>
              <li>If you didn't request this, please ignore this email</li>
              <li>For security, never share this code with anyone</li>
            </ul>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px;">${resetLink}</p>
        </div>
        <div class="footer">
          <p>This email was sent from ShopKart. If you have any questions, please contact our support team.</p>
          <p>© 2024 ShopKart. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    email,
    subject: "Password Reset - ShopKart",
    message
  });
};

module.exports = { sendEmail, sendPasswordResetEmail };

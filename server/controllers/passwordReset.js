const user = require("../models/user");
const OTP = require("../models/otp");
const { sendPasswordResetEmail } = require("../utils/sendEmail");
const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const crypto = require("crypto");

// Request password reset
const requestPasswordReset = asyncErrorHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  // Check if user exists
  const existingUser = await user.findOne({ email: email.toLowerCase() });
  if (!existingUser) {
    return res.status(404).json({
      success: false,
      message: "No account found with this email address"
    });
  }

  try {
    // Generate OTP
    const otpDoc = await OTP.createOTP(email.toLowerCase(), 'password_reset');
    
    // Generate reset token for link
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    // Store reset token in user document (temporary)
    existingUser.resetPasswordToken = resetToken;
    existingUser.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await existingUser.save();

    // Send email with OTP and reset link
    await sendPasswordResetEmail(email, otpDoc.otp, resetLink);

    res.status(200).json({
      success: true,
      message: "Password reset instructions sent to your email",
      data: {
        email: email,
        expiresIn: "10 minutes"
      }
    });

  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send password reset email. Please try again."
    });
  }
});

// Verify OTP
const verifyOTP = asyncErrorHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required"
    });
  }

  try {
    // Find the OTP document
    const otpDoc = await OTP.findOne({ 
      email: email.toLowerCase(), 
      type: 'password_reset' 
    });

    if (!otpDoc) {
      return res.status(404).json({
        success: false,
        message: "No password reset request found for this email"
      });
    }

    // Verify the OTP
    otpDoc.verifyOTP(otp);

    // Generate a temporary token for password reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Update user with reset token
    const userDoc = await user.findOne({ email: email.toLowerCase() });
    userDoc.resetPasswordToken = resetToken;
    userDoc.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await userDoc.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: {
        resetToken,
        expiresIn: "10 minutes"
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Reset password with token
const resetPassword = asyncErrorHandler(async (req, res) => {
  const { token, email, newPassword } = req.body;

  if (!token || !email || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Token, email, and new password are required"
    });
  }

  try {
    // Find user with valid reset token
    const userDoc = await user.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!userDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }

    // Update password
    userDoc.password = newPassword;
    userDoc.resetPasswordToken = undefined;
    userDoc.resetPasswordExpires = undefined;
    await userDoc.save();

    // Delete any remaining OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase(), type: 'password_reset' });

    res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password."
    });

  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reset password. Please try again."
    });
  }
});

// Resend OTP
const resendOTP = asyncErrorHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  try {
    // Check if user exists
    const existingUser = await user.findOne({ email: email.toLowerCase() });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address"
      });
    }

    // Generate new OTP
    const otpDoc = await OTP.createOTP(email.toLowerCase(), 'password_reset');
    
    // Generate new reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    // Update user with new reset token
    existingUser.resetPasswordToken = resetToken;
    existingUser.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    await existingUser.save();

    // Send new email
    await sendPasswordResetEmail(email, otpDoc.otp, resetLink);

    res.status(200).json({
      success: true,
      message: "New password reset instructions sent to your email",
      data: {
        email: email,
        expiresIn: "10 minutes"
      }
    });

  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend password reset email. Please try again."
    });
  }
});

module.exports = {
  requestPasswordReset,
  verifyOTP,
  resetPassword,
  resendOTP
};

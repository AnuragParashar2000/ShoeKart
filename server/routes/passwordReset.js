const express = require("express");
const router = express.Router();
const {
  requestPasswordReset,
  verifyOTP,
  resetPassword,
  resendOTP
} = require("../controllers/passwordReset");

// Request password reset (send OTP and reset link)
router.route("/request").post(requestPasswordReset);

// Verify OTP
router.route("/verify-otp").post(verifyOTP);

// Reset password with token
router.route("/reset").post(resetPassword);

// Resend OTP
router.route("/resend-otp").post(resendOTP);

module.exports = router;

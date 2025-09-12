const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  type: {
    type: String,
    enum: ['password_reset', 'email_verification'],
    default: 'password_reset'
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  }
}, {
  timestamps: true
});

// Index for faster queries
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired OTPs

// Static method to generate OTP
otpSchema.statics.generateOTP = function() {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Static method to create OTP
otpSchema.statics.createOTP = async function(email, type = 'password_reset') {
  // Delete any existing OTPs for this email and type
  await this.deleteMany({ email, type });
  
  const otp = this.generateOTP();
  const otpDoc = new this({
    email,
    otp,
    type
  });
  
  return await otpDoc.save();
};

// Method to verify OTP
otpSchema.methods.verifyOTP = function(inputOTP) {
  if (this.isUsed) {
    throw new Error('OTP has already been used');
  }
  
  if (this.attempts >= 3) {
    throw new Error('Too many failed attempts. Please request a new OTP');
  }
  
  if (this.expiresAt < new Date()) {
    throw new Error('OTP has expired');
  }
  
  if (this.otp !== inputOTP) {
    this.attempts += 1;
    this.save();
    throw new Error('Invalid OTP');
  }
  
  this.isUsed = true;
  this.save();
  return true;
};

module.exports = mongoose.model("OTP", otpSchema);

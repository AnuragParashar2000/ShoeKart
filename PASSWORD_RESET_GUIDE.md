# 🔐 Password Reset System - Complete Guide

## 📋 Overview

The ShopKart application now includes a comprehensive password reset system that provides users with multiple secure options to reset their passwords when they forget them.

## 🚀 Features

### **Dual Reset Options**
- **OTP (One-Time Password)**: 6-digit code sent via email
- **Reset Link**: Direct link to reset password page
- **Both options expire in 10 minutes for security**

### **Security Features**
- ✅ **Rate Limiting**: Maximum 3 OTP attempts per request
- ✅ **Time-based Expiration**: 10-minute expiry for all reset tokens
- ✅ **One-time Use**: OTPs and tokens can only be used once
- ✅ **Email Validation**: Verifies user exists before sending reset
- ✅ **Password Strength**: Enforces minimum 8-character passwords
- ✅ **Secure Tokens**: Cryptographically secure random tokens

## 🔧 How It Works

### **Step 1: Request Password Reset**
1. User clicks "Forgot password?" on login page
2. User enters their email address
3. System verifies email exists in database
4. System generates:
   - 6-digit OTP code
   - Secure reset token
   - Reset link with token
5. Email sent with both OTP and reset link

### **Step 2: Verify Identity**
**Option A: OTP Verification**
1. User enters 6-digit OTP from email
2. System validates OTP and marks as used
3. User proceeds to password reset form

**Option B: Reset Link**
1. User clicks reset link in email
2. System validates token and redirects to reset form
3. User can directly set new password

### **Step 3: Reset Password**
1. User enters new password (minimum 8 characters)
2. User confirms new password
3. System validates password strength
4. Password updated in database
5. All reset tokens and OTPs invalidated
6. User redirected to login page

## 📁 File Structure

### **Backend Files**
```
server/
├── models/
│   ├── otp.js                    # OTP model with validation
│   └── user.js                   # Updated with reset fields
├── controllers/
│   └── passwordReset.js          # Password reset logic
├── routes/
│   └── passwordReset.js          # API routes
├── utils/
│   └── sendEmail.js              # Enhanced email service
└── index.js                      # Updated with new routes
```

### **Frontend Files**
```
client/src/
├── pages/
│   ├── ForgotPassword.jsx        # Request reset page
│   ├── ResetPassword.jsx         # Reset password page
│   ├── ForgotPassword.css        # Styling
│   └── ResetPassword.css         # Styling
├── App.jsx                       # Updated with new routes
└── styles/
    └── auth.css                  # Updated with link styles
```

## 🔌 API Endpoints

### **Request Password Reset**
```http
POST /api/v1/password-reset/request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset instructions sent to your email",
  "data": {
    "email": "user@example.com",
    "expiresIn": "10 minutes"
  }
}
```

### **Verify OTP**
```http
POST /api/v1/password-reset/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "resetToken": "secure_token_here",
    "expiresIn": "10 minutes"
  }
}
```

### **Reset Password**
```http
POST /api/v1/password-reset/reset
Content-Type: application/json

{
  "token": "secure_token_here",
  "email": "user@example.com",
  "newPassword": "newSecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password."
}
```

### **Resend OTP**
```http
POST /api/v1/password-reset/resend-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## ⚙️ Environment Variables

### **Required for Email Service**
```env
# Email Service Configuration
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
CLIENT_URL=http://localhost:5173
```

### **Gmail Setup Instructions**
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `SMTP_PASSWORD`

## 🎨 User Interface

### **Forgot Password Page**
- Clean, modern design with gradient background
- Email input with validation
- Success state with instructions
- Links back to login page

### **Reset Password Page**
- Two-step process: OTP verification → Password reset
- OTP input with monospace font for better readability
- Password strength indicators
- Resend OTP functionality
- Responsive design for mobile devices

### **Email Template**
- Professional HTML email design
- Clear instructions for both OTP and reset link
- Security warnings and expiration notices
- Mobile-responsive layout

## 🔒 Security Considerations

### **Implemented Security Measures**
1. **Token Expiration**: All tokens expire in 10 minutes
2. **Rate Limiting**: Maximum 3 OTP attempts per request
3. **One-time Use**: Tokens and OTPs are invalidated after use
4. **Secure Generation**: Cryptographically secure random tokens
5. **Email Validation**: Verifies user exists before sending reset
6. **Password Strength**: Enforces minimum password requirements

### **Best Practices**
- Never log sensitive information (OTPs, tokens)
- Use HTTPS in production
- Regularly rotate email service credentials
- Monitor for suspicious reset attempts
- Implement CAPTCHA for high-volume requests (future enhancement)

## 🧪 Testing

### **Test Scenarios**
1. **Valid Email**: Should send reset email successfully
2. **Invalid Email**: Should return appropriate error message
3. **Valid OTP**: Should verify and proceed to password reset
4. **Invalid OTP**: Should show error and increment attempts
5. **Expired OTP**: Should show expiration error
6. **Used OTP**: Should show already used error
7. **Valid Password Reset**: Should update password successfully
8. **Invalid Token**: Should show token error
9. **Resend OTP**: Should send new OTP and invalidate old one

### **Manual Testing Steps**
1. Go to login page
2. Click "Forgot password?"
3. Enter valid email address
4. Check email for OTP and reset link
5. Test both OTP and reset link methods
6. Verify password reset works
7. Test with invalid inputs
8. Verify security measures (expiration, attempts)

## 🚀 Deployment

### **Production Considerations**
1. **Email Service**: Use production email service (SendGrid, AWS SES)
2. **Environment Variables**: Set production email credentials
3. **HTTPS**: Ensure all communication is encrypted
4. **Rate Limiting**: Implement additional rate limiting if needed
5. **Monitoring**: Set up alerts for failed reset attempts

### **Email Service Options**
- **Gmail**: Good for development and small applications
- **SendGrid**: Professional email service with analytics
- **AWS SES**: Scalable email service for large applications
- **Mailgun**: Developer-friendly email API

## 📊 Monitoring & Analytics

### **Key Metrics to Track**
- Password reset request volume
- OTP verification success rate
- Password reset completion rate
- Failed attempt patterns
- Email delivery rates

### **Logging**
- Log all password reset attempts (without sensitive data)
- Monitor for suspicious patterns
- Track email delivery failures
- Monitor token expiration rates

## 🔄 Future Enhancements

### **Potential Improvements**
1. **SMS OTP**: Add SMS as alternative to email
2. **Security Questions**: Additional verification method
3. **Account Lockout**: Temporary lockout after multiple failures
4. **Audit Trail**: Detailed logging of reset activities
5. **Multi-language**: Support for multiple languages
6. **CAPTCHA**: Prevent automated attacks
7. **Biometric**: Fingerprint/face recognition for mobile

---

## ✅ **Your Password Reset System is Ready!**

The password reset system is now fully implemented and ready for use. Users can securely reset their passwords using either OTP codes or reset links sent to their email addresses.

**Next Steps:**
1. Configure your email service credentials
2. Test the complete flow
3. Deploy to production
4. Monitor usage and performance

**Need Help?** The system includes comprehensive error handling and user-friendly messages to guide users through the process.

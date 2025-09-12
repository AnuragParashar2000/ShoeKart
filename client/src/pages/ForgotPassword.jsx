import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Axios from '../Axios';
import { toast } from 'react-toastify';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await Axios.post('/password-reset/request', {
        email: email.toLowerCase()
      });

      if (response.data.success) {
        setEmailSent(true);
        toast.success('Password reset instructions sent to your email!');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      toast.error('Please enter the OTP code');
      return;
    }

    setIsVerifyingOTP(true);
    
    try {
      const response = await Axios.post('/password-reset/verify-otp', {
        email: email.toLowerCase(),
        otp: otp
      });

      if (response.data.success) {
        setResetToken(response.data.data.resetToken);
        setOtpVerified(true);
        toast.success('OTP verified successfully!');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to verify OTP';
      toast.error(message);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;
    
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await Axios.post('/password-reset/reset', {
        token: resetToken,
        email: email.toLowerCase(),
        newPassword: newPassword
      });

      if (response.data.success) {
        toast.success('Password reset successfully! You can now login with your new password.');
        // Reset all states
        setEmailSent(false);
        setOtpVerified(false);
        setOtp('');
        setResetToken('');
        setEmail('');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (otpVerified) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="success-icon">🔐</div>
          <h2>Set New Password</h2>
          <p>Enter your new password below.</p>
          
          <form onSubmit={handlePasswordReset} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                placeholder="Enter new password"
                required
                disabled={isLoading}
              />
              <small>Password must be at least 8 characters long</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm new password"
                required
                disabled={isLoading}
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>

          <div className="forgot-password-footer">
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    );
  }

  if (emailSent) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="success-icon">📧</div>
          <h2>Check Your Email</h2>
          <p>We've sent password reset instructions to:</p>
          <p className="email-address">{email}</p>
          
          <div className="instructions">
            <h3>Enter the OTP Code</h3>
            <p>Enter the 6-digit code from your email:</p>
          </div>

          <form onSubmit={handleOTPSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="otp">6-Digit OTP Code</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength="6"
                pattern="[0-9]{6}"
                required
                disabled={isVerifyingOTP}
                className="otp-input"
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={isVerifyingOTP}
            >
              {isVerifyingOTP ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div className="instructions">
            <h3>Alternative Options</h3>
            <ul>
              <li>Check your email for the reset link</li>
              <li>Click the reset link to skip OTP verification</li>
              <li>The code expires in 10 minutes</li>
            </ul>
          </div>

          <div className="actions">
            <button 
              onClick={() => setEmailSent(false)}
              className="btn-secondary"
            >
              Try Different Email
            </button>
            <Link to="/login" className="btn-primary">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1>Forgot Password?</h1>
          <p>No worries! Enter your email address and we'll send you instructions to reset your password.</p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Reset Instructions'}
          </button>
        </form>

        <div className="forgot-password-footer">
          <p>Remember your password? <Link to="/login">Back to Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

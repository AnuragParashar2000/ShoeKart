import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Axios from '../Axios';
import { toast } from 'react-toastify';
import './ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [step, setStep] = useState(1); // 1: OTP verification, 2: Password reset
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (token && email) {
      setResetToken(token);
      setFormData(prev => ({ ...prev, email: decodeURIComponent(email) }));
      setStep(2); // Skip OTP if coming from email link
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.otp) {
      toast.error('Please enter both email and OTP');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await Axios.post('/password-reset/verify-otp', {
        email: formData.email.toLowerCase(),
        otp: formData.otp
      });

      if (response.data.success) {
        setResetToken(response.data.data.resetToken);
        setStep(2);
        toast.success('OTP verified successfully!');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to verify OTP';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.newPassword || !formData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await Axios.post('/password-reset/reset', {
        token: resetToken,
        email: formData.email.toLowerCase(),
        newPassword: formData.newPassword
      });

      if (response.data.success) {
        toast.success('Password reset successfully! You can now login with your new password.');
        navigate('/login');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address first');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await Axios.post('/password-reset/resend-otp', {
        email: formData.email.toLowerCase()
      });

      if (response.data.success) {
        toast.success('New OTP sent to your email!');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <h1>Verify OTP</h1>
            <p>Enter the 6-digit code sent to your email address.</p>
          </div>

          <form onSubmit={handleOTPSubmit} className="reset-password-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="otp">6-Digit OTP Code</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="Enter 6-digit code"
                maxLength="6"
                pattern="[0-9]{6}"
                required
                disabled={isLoading}
                className="otp-input"
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div className="resend-section">
            <p>Didn't receive the code?</p>
            <button 
              onClick={handleResendOTP}
              className="btn-link"
              disabled={isLoading}
            >
              Resend OTP
            </button>
          </div>

          <div className="reset-password-footer">
            <Link to="/forgot-password">Back to Forgot Password</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <h1>Reset Password</h1>
          <p>Enter your new password below.</p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="reset-password-form">
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
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
              value={formData.confirmPassword}
              onChange={handleInputChange}
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

        <div className="reset-password-footer">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
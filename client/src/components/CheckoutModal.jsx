import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Axios from '../Axios';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, cartData, totalPrice, appliedCoupon, couponCode, couponDiscount }) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    cardType: ''
  });
  const [billingAddress, setBillingAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Card type detection
  const detectCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6(?:011|5)/.test(number)) return 'discover';
    if (/^3[0689]/.test(number)) return 'diners';
    if (/^(?:2131|1800|35\d{3})/.test(number)) return 'jcb';
    
    return 'unknown';
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Validate card number (Luhn algorithm)
  const validateCardNumber = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.length < 13 || number.length > 19) return false;
    
    let sum = 0;
    let isEven = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  // Handle card number change
  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    const cardType = detectCardType(formatted);
    
    setCardData({
      ...cardData,
      cardNumber: formatted,
      cardType: cardType
    });
  };

  // Handle expiry date change
  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setCardData({
      ...cardData,
      expiryDate: formatted
    });
  };

  // Handle CVV change
  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardData({
      ...cardData,
      cvv: value
    });
  };

  // Get card icon
  const getCardIcon = (cardType) => {
    const icons = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      diners: '💳',
      jcb: '💳',
      unknown: '💳'
    };
    return icons[cardType] || icons.unknown;
  };

  // Get card name
  const getCardName = (cardType) => {
    const names = {
      visa: 'Visa',
      mastercard: 'Mastercard',
      amex: 'American Express',
      discover: 'Discover',
      diners: 'Diners Club',
      jcb: 'JCB',
      unknown: 'Card'
    };
    return names[cardType] || names.unknown;
  };

  // Validate form
  const validateForm = () => {
    if (selectedPaymentMethod === 'card') {
      if (!cardData.cardNumber || !cardData.expiryDate || !cardData.cvv || !cardData.cardholderName) {
        toast.error('Please fill all card details');
        return false;
      }
      
      if (!validateCardNumber(cardData.cardNumber)) {
        toast.error('Invalid card number');
        return false;
      }
      
      if (cardData.cardNumber.replace(/\s/g, '').length !== 16) {
        toast.error('Card number must be 16 digits');
        return false;
      }
      
      const [month, year] = cardData.expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        toast.error('Invalid expiry month');
        return false;
      }
      
      if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        toast.error('Card has expired');
        return false;
      }
      
      if (cardData.cvv.length < 3) {
        toast.error('Invalid CVV');
        return false;
      }
    }
    
    if (!billingAddress.fullName || !billingAddress.email || !billingAddress.phone || 
        !billingAddress.address || !billingAddress.city || !billingAddress.state || 
        !billingAddress.pincode) {
      toast.error('Please fill all billing address details');
      return false;
    }
    
    return true;
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!validateForm()) return;
    
    setIsProcessing(true);
    
    try {
      const checkoutData = {
        paymentMethod: selectedPaymentMethod,
        cardData: selectedPaymentMethod === 'card' ? cardData : null,
        billingAddress,
        coupon: appliedCoupon ? couponCode.toUpperCase() : "",
        cartItems: cartData?.items || []
      };
      
      const response = await Axios.post(
        "/api/v1/payment/create-checkout-session",
        checkoutData,
        { headers: { Authorization: localStorage.getItem("jwt") } }
      );
      
      if (response.data.url) {
        window.location.href = response.data.url;
      } else if (response.data.success) {
        toast.success('Order placed successfully!');
        onClose();
        window.location.href = '/checkout-success';
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-modal">
        <div className="checkout-modal-header">
          <h2>Checkout</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="checkout-modal-content">
          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cartData?.items?.map((item, index) => (
                <div key={index} className="summary-item">
                  <div className="item-info">
                    <span className="item-name">{item.productId?.brand} {item.productId?.name}</span>
                    <span className="item-details">Size: {item.size} | Qty: {item.qty}</span>
                  </div>
                  <span className="item-price">₹{(item.productId?.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-total">
              <span>Total: ₹{totalPrice?.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="payment-methods">
            <h3>Payment Method</h3>
            <div className="payment-options">
              <label className={`payment-option ${selectedPaymentMethod === 'card' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={selectedPaymentMethod === 'card'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <span className="payment-option-content">
                  <span className="payment-icon">💳</span>
                  <span>Credit/Debit Card</span>
                </span>
              </label>
              
              <label className={`payment-option ${selectedPaymentMethod === 'cod' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={selectedPaymentMethod === 'cod'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <span className="payment-option-content">
                  <span className="payment-icon">💰</span>
                  <span>Pay on Delivery</span>
                </span>
              </label>
              
              <label className={`payment-option ${selectedPaymentMethod === 'upi' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={selectedPaymentMethod === 'upi'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                />
                <span className="payment-option-content">
                  <span className="payment-icon">📱</span>
                  <span>UPI Payment</span>
                </span>
              </label>
            </div>
          </div>

          {/* Card Details */}
          {selectedPaymentMethod === 'card' && (
            <div className="card-details">
              <h3>Card Details</h3>
              <div className="form-group">
                <label>Card Number</label>
                <div className="card-input-container">
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardData.cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength="19"
                    className="card-input"
                  />
                  {cardData.cardType && (
                    <span className="card-type">
                      {getCardIcon(cardData.cardType)} {getCardName(cardData.cardType)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardData.expiryDate}
                    onChange={handleExpiryChange}
                    maxLength="5"
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={cardData.cvv}
                    onChange={handleCvvChange}
                    maxLength="4"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={cardData.cardholderName}
                  onChange={(e) => setCardData({...cardData, cardholderName: e.target.value})}
                />
              </div>
            </div>
          )}

          {/* Billing Address */}
          <div className="billing-address">
            <h3>Billing Address</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={billingAddress.fullName}
                  onChange={(e) => setBillingAddress({...billingAddress, fullName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={billingAddress.email}
                  onChange={(e) => setBillingAddress({...billingAddress, email: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={billingAddress.phone}
                  onChange={(e) => setBillingAddress({...billingAddress, phone: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  value={billingAddress.pincode}
                  onChange={(e) => setBillingAddress({...billingAddress, pincode: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Address</label>
              <textarea
                value={billingAddress.address}
                onChange={(e) => setBillingAddress({...billingAddress, address: e.target.value})}
                rows="3"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  value={billingAddress.city}
                  onChange={(e) => setBillingAddress({...billingAddress, city: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  value={billingAddress.state}
                  onChange={(e) => setBillingAddress({...billingAddress, state: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="checkout-modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="checkout-btn" 
            onClick={handleCheckout}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : `Pay ₹${totalPrice?.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;

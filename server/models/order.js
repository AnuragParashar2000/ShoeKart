const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    paymentIntentId: { type: String, required: false }, // Made optional for COD
    paymentMethod: { 
      type: String, 
      enum: ['card', 'cod', 'upi', 'stripe'], 
      required: true 
    },
    products: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, default: 1 },
        size: { type: Number, required: true },
        isReviewed: { type: Boolean, default: false },
      },
    ],
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    shipping: { type: Object, required: true },
    billingAddress: { type: Object, required: true },
    cardDetails: { type: Object, required: false }, // For card payments
    delivery_status: { 
      type: String, 
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: "pending" 
    },
    payment_status: { 
      type: String, 
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: "pending" 
    },
    cancellation: {
      isCancelled: { type: Boolean, default: false },
      cancelledAt: { type: Date },
      cancelledBy: { 
        type: String, 
        enum: ['user', 'admin', 'system'],
        default: 'user'
      },
      cancellationReason: { type: String }
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

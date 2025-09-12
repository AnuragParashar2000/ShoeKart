const express = require("express");
const { checkout } = require("../controllers/payments");
const { verifyToken } = require("../middleware/auth");
const order = require("../models/order");
const router = express.Router();

router.route("/create-checkout-session").post(checkout);

// Get user orders
router.route("/orders").get(verifyToken, async (req, res) => {
  try {
    const orders = await order.find({ userId: req.tokenId })
      .populate('products.productId', 'name brand image price')
      .sort({ createdAt: -1 });
    
    // Transform orders to match frontend expectations
    const transformedOrders = orders.map(order => ({
      _id: order._id,
      id: order._id,
      totalPrice: order.total,
      delivered: order.delivery_status,
      createdAt: order.createdAt,
      items: order.products.map(product => ({
        id: product.productId._id,
        name: product.productId.name,
        image: product.productId.image,
        qty: product.quantity,
        size: product.size,
        color: product.productId.brand || 'N/A',
        isReviewed: product.isReviewed || false,
        slug: product.productId.name?.toLowerCase().replace(/\s+/g, '-') || 'product'
      })),
      cancellation: order.cancellation
    }));
    
    res.json({
      success: true,
      orders: transformedOrders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});

// Cancel order
router.route("/:orderId/cancel").put(verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const orderObj = await order.findOne({ 
      _id: orderId, 
      userId: req.tokenId 
    });
    
    if (!orderObj) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order can be cancelled
    if (orderObj.delivery_status === 'shipped' || orderObj.delivery_status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order that has already been shipped or delivered'
      });
    }
    
    if (orderObj.cancellation.isCancelled) {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }
    
    // Update order status
    orderObj.delivery_status = 'cancelled';
    orderObj.cancellation = {
      isCancelled: true,
      cancelledAt: new Date(),
      cancelledBy: 'user',
      cancellationReason: reason || 'Cancelled by user'
    };
    
    await orderObj.save();
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: orderObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order'
    });
  }
});

module.exports = router;

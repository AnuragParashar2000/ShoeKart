require("dotenv").config();
const asyncErrorHandler = require("../middleware/asyncErrorHandler");
const Stripe = require("stripe");
const order = require("../models/order");
const user = require("../models/user");
const product = require("../models/product");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const checkout = asyncErrorHandler(async (req, res) => {
  const id = req.tokenId;
  const email = req.tokenEmail;
  const { 
    paymentMethod, 
    cardData, 
    billingAddress, 
    coupon, 
    cartItems 
  } = req.body;

  const cartObj = await user
    .findById(id)
    .populate({
      path: "cart.items.productId",
      select: "name price image brand sizeQuantity",
    })
    .select("cart name");

  const formattedCart = cartObj.cart.items.map((item) => {
    const sizeQty = item.productId.sizeQuantity.filter(
      (size) => size.size === item.size
    )[0].quantity;
    return {
      productId: item.productId._id,
      name: `${item.productId.brand} ${item.productId.name}`,
      image: item.productId.image,
      qty: item.qty > sizeQty ? sizeQty : item.qty,
      size: item.size,
      price: item.productId.price,
    };
  });

  // Handle different payment methods
  if (paymentMethod === 'cod') {
    // Handle Cash on Delivery
    return handleCODOrder(req, res, formattedCart, billingAddress, coupon);
  } else if (paymentMethod === 'card') {
    // Handle direct card payment (simulated)
    return handleCardPayment(req, res, formattedCart, cardData, billingAddress, coupon);
  } else if (paymentMethod === 'upi') {
    // Handle UPI payment (simulated)
    return handleUPIPayment(req, res, formattedCart, billingAddress, coupon);
  }

  // Default to Stripe for 'stripe' method or legacy support
  let customer;

  const existingCustomer = await stripe.customers.list({ email: email });
  if (existingCustomer.data.length > 0) {
    customer = existingCustomer.data[0];
  } else {
    customer = await stripe.customers.create({
      name: cartObj.name,
      email: email,
      metadata: { userId: id },
    });
  }

  const line_items = formattedCart.map((item) => {
    return {
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
          images: [item.image],
          description: `size: ${item.size}`,
          metadata: {
            productId: item.productId.toString(),
            size: item.size.toString(),
          },
        },
        unit_amount: item.price * 100,
      },
      quantity: item.qty,
    };
  });

  const session = await stripe.checkout.sessions.create({
    line_items,
    phone_number_collection: { enabled: true },
    billing_address_collection: "required",
    shipping_address_collection: {},
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 0, currency: "inr" },
          display_name: "Free shipping",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 5 },
            maximum: { unit: "business_day", value: 7 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: { amount: 30000, currency: "inr" },
          display_name: "Next day air",
          delivery_estimate: {
            minimum: { unit: "business_day", value: 1 },
            maximum: { unit: "business_day", value: 1 },
          },
        },
      },
    ],
    mode: "payment",
    metadata: {
      cart: JSON.stringify(
        formattedCart.map((item) => {
          return {
            productId: item.productId,
            qty: item.qty,
            size: item.size,
          };
        })
      ),
    },
    customer: customer.id,
    discounts: coupon !== "" ? [{ coupon }] : [],
    success_url: `${process.env.CLIENT_URL}/checkout-success`,
    cancel_url: `${process.env.CLIENT_URL}/cart`,
  });
  res.json({ url: session.url });
});

const createOrder = async (customer, data) => {
  try {
    const products = JSON.parse(data.metadata.cart);

    await order.create({
      userId: customer.metadata.userId,
      paymentIntentId: data.payment_intent,
      products,
      subtotal: data.amount_subtotal / 100,
      total: data.amount_total / 100,
      shipping: data.customer_details,
      payment_status: data.payment_status,
    });

    const userObj = await user.findById(customer.metadata.userId);
    userObj.cart.items = [];
    userObj.cart.totalPrice = 0;
    await userObj.save();

    for (const item of products) {
      const productObj = await product.findById(item.productId);
      productObj.sizeQuantity = productObj.sizeQuantity.filter((size) => {
        if (size.size === item.size) {
          size.quantity -= item.quantity;
        }
        return size.quantity > 0;
      });
      await productObj.save();
    }
    console.log("Order created successfully");
  } catch (err) {
    console.log(err);
  }
};

const webhook = asyncErrorHandler((request, response) => {
  let data;
  let eventType;
  let endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (endpointSecret) {
    // Retrieve the event by verifying the signature using the raw body and secret.
    let event;
    const sig = request.headers["stripe-signature"];
    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`, err);
      return response.sendStatus(400);
    }
    data = event.data.object;
    eventType = event.type;
  } else {
    // Webhook signing is recommended, but if the secret is not configured in `config.js`,
    // retrieve the event data directly from the request body.
    data = request.body.data.object;
    eventType = request.body.type;
  }
  switch (eventType) {
    case "checkout.session.completed":
      stripe.customers
        .retrieve(data.customer)
        .then(async (customer) => {
          createOrder(customer, data);
        })
        .catch((error) => {
          console.log("Error: ", error);
        });
      break;
    default:
      // console.log(`Unhandled event type ${eventType}`);
      break;
  }
  response.status(200).send();
});

// Handle Cash on Delivery
const handleCODOrder = async (req, res, formattedCart, billingAddress, coupon) => {
  try {
    const id = req.tokenId;
    const userObj = await user.findById(id);
    
    // Calculate total
    const subtotal = formattedCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const total = subtotal; // No additional charges for COD
    
    // Create order
    const newOrder = await order.create({
      userId: id,
      paymentMethod: 'cod',
      products: formattedCart.map(item => ({
        productId: item.productId,
        quantity: item.qty,
        size: item.size
      })),
      subtotal,
      total,
      shipping: billingAddress,
      billingAddress,
      payment_status: 'pending'
    });
    
    // Clear cart
    userObj.cart.items = [];
    userObj.cart.totalPrice = 0;
    await userObj.save();
    
    // Update product quantities
    for (const item of formattedCart) {
      const productObj = await product.findById(item.productId);
      productObj.sizeQuantity = productObj.sizeQuantity.map(size => {
        if (size.size === item.size) {
          size.quantity -= item.qty;
        }
        return size;
      }).filter(size => size.quantity > 0);
      await productObj.save();
    }
    
    res.json({
      success: true,
      message: 'Order placed successfully! Payment will be collected on delivery.',
      orderId: newOrder._id
    });
  } catch (error) {
    console.error('COD Order Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to place order. Please try again.'
    });
  }
};

// Handle Card Payment (Simulated)
const handleCardPayment = async (req, res, formattedCart, cardData, billingAddress, coupon) => {
  try {
    const id = req.tokenId;
    const userObj = await user.findById(id);
    
    // Simulate card validation
    if (!cardData || !cardData.cardNumber || !cardData.cvv) {
      return res.status(400).json({
        success: false,
        message: 'Invalid card details'
      });
    }
    
    // Calculate total
    const subtotal = formattedCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const total = subtotal;
    
    // Simulate payment processing
    const paymentSuccess = Math.random() > 0.1; // 90% success rate for demo
    
    if (!paymentSuccess) {
      return res.status(400).json({
        success: false,
        message: 'Payment failed. Please try again or use a different card.'
      });
    }
    
    // Create order
    const newOrder = await order.create({
      userId: id,
      paymentMethod: 'card',
      products: formattedCart.map(item => ({
        productId: item.productId,
        quantity: item.qty,
        size: item.size
      })),
      subtotal,
      total,
      shipping: billingAddress,
      billingAddress,
      cardDetails: {
        cardType: cardData.cardType,
        lastFour: cardData.cardNumber.slice(-4),
        cardholderName: cardData.cardholderName
      },
      payment_status: 'paid'
    });
    
    // Clear cart
    userObj.cart.items = [];
    userObj.cart.totalPrice = 0;
    await userObj.save();
    
    // Update product quantities
    for (const item of formattedCart) {
      const productObj = await product.findById(item.productId);
      productObj.sizeQuantity = productObj.sizeQuantity.map(size => {
        if (size.size === item.size) {
          size.quantity -= item.qty;
        }
        return size;
      }).filter(size => size.quantity > 0);
      await productObj.save();
    }
    
    res.json({
      success: true,
      message: 'Payment successful! Order placed successfully.',
      orderId: newOrder._id
    });
  } catch (error) {
    console.error('Card Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed. Please try again.'
    });
  }
};

// Handle UPI Payment (Simulated)
const handleUPIPayment = async (req, res, formattedCart, billingAddress, coupon) => {
  try {
    const id = req.tokenId;
    const userObj = await user.findById(id);
    
    // Calculate total
    const subtotal = formattedCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const total = subtotal;
    
    // Simulate UPI payment processing
    const paymentSuccess = Math.random() > 0.05; // 95% success rate for demo
    
    if (!paymentSuccess) {
      return res.status(400).json({
        success: false,
        message: 'UPI payment failed. Please try again.'
      });
    }
    
    // Create order
    const newOrder = await order.create({
      userId: id,
      paymentMethod: 'upi',
      products: formattedCart.map(item => ({
        productId: item.productId,
        quantity: item.qty,
        size: item.size
      })),
      subtotal,
      total,
      shipping: billingAddress,
      billingAddress,
      payment_status: 'paid'
    });
    
    // Clear cart
    userObj.cart.items = [];
    userObj.cart.totalPrice = 0;
    await userObj.save();
    
    // Update product quantities
    for (const item of formattedCart) {
      const productObj = await product.findById(item.productId);
      productObj.sizeQuantity = productObj.sizeQuantity.map(size => {
        if (size.size === item.size) {
          size.quantity -= item.qty;
        }
        return size;
      }).filter(size => size.quantity > 0);
      await productObj.save();
    }
    
    res.json({
      success: true,
      message: 'UPI payment successful! Order placed successfully.',
      orderId: newOrder._id
    });
  } catch (error) {
    console.error('UPI Payment Error:', error);
    res.status(500).json({
      success: false,
      message: 'UPI payment processing failed. Please try again.'
    });
  }
};

module.exports = { checkout, webhook };

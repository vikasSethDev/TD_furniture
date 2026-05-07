const Order   = require('../models/Order');
const Product  = require('../models/Product');
const { createRazorpayOrder, verifyPaymentSignature } = require('../services/razorpay.service');
const { sendOrderConfirmation } = require('../services/email.service');

// POST /api/order/create-razorpay-order
const createRazorpayOrderHandler = async (req, res) => {
  try {
    const { amount, receipt } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    let razorpayOrder;
    try {
      razorpayOrder = await createRazorpayOrder(amount, receipt || `receipt_${Date.now()}`);
    } catch (err) {
      // Return mock order if Razorpay not configured (development)
      console.warn('⚠️  Razorpay not configured, using mock order');
      razorpayOrder = {
        id: `mock_order_${Date.now()}`,
        amount: Math.round(amount * 100),
        currency: 'INR'
      };
    }

    res.json({
      success: true,
      data: {
        orderId:  razorpayOrder.id,
        amount:   razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId:    process.env.RAZORPAY_KEY_ID || 'rzp_test_demo'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/order — save order after payment
const createOrder = async (req, res) => {
  try {
    const {
      customerName, email, phone, address, items,
      subtotal, shippingCost, totalAmount,
      razorpayOrderId, razorpayPaymentId, razorpaySignature,
      notes
    } = req.body;

    // Verify Razorpay signature (skip for mock/dev)
    if (razorpayOrderId && !razorpayOrderId.startsWith('mock_') &&
        razorpayPaymentId && razorpaySignature) {
      const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Payment verification failed' });
      }
    }

    // Build items array with product validation
    const orderItems = [];
    for (const item of items) {
      orderItems.push({
        productId: item.productId,
        name:      item.name,
        price:     item.price,
        quantity:  item.quantity,
        image:     item.image || ''
      });
    }

    const order = await Order.create({
      customerName, email, phone, address,
      items: orderItems,
      subtotal:     subtotal || totalAmount,
      shippingCost: shippingCost || 0,
      totalAmount,
      paymentStatus: razorpayPaymentId ? 'paid' : 'pending',
      razorpayOrderId:   razorpayOrderId   || null,
      razorpayPaymentId: razorpayPaymentId || null,
      razorpaySignature: razorpaySignature || null,
      orderStatus: 'Pending',
      notes: notes || ''
    });

    // Send confirmation emails (non-blocking)
    sendOrderConfirmation(order).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderId:     order._id,
        orderNumber: `ML-${order._id.toString().slice(-6).toUpperCase()}`,
        totalAmount: order.totalAmount,
        status:      order.orderStatus
      }
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/order/:id — track order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createRazorpayOrderHandler, createOrder, getOrderById };

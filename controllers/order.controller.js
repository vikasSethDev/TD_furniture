const Order   = require('../models/Order');
const { createRazorpayOrder, verifyPaymentSignature } = require('../services/razorpay.service');
const { sendOrderConfirmation } = require('../services/email.service');

// POST /api/order/create-razorpay-order
const createRazorpayOrderHandler = async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid amount' });

    let razorpayOrder;
    try {
      razorpayOrder = await createRazorpayOrder(amount, receipt || `receipt_${Date.now()}`);
    } catch (err) {
      console.warn('⚠️  Razorpay not configured, using mock order');
      razorpayOrder = { id: `mock_order_${Date.now()}`, amount: Math.round(amount * 100), currency: 'INR' };
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

// POST /api/order
const createOrder = async (req, res) => {
  try {
    const {
      customerName, email, phone, address, items,
      subtotal, shippingCost, totalAmount,
      razorpayOrderId, razorpayPaymentId, razorpaySignature, notes
    } = req.body;

    if (razorpayOrderId && !razorpayOrderId.startsWith('mock_') && razorpayPaymentId && razorpaySignature) {
      const isValid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
      if (!isValid) return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const order = await Order.create({
      customerName, email, phone, address,
      items: items.map(i => ({
        productId: i.productId, name: i.name,
        price: i.price, quantity: i.quantity, image: i.image || ''
      })),
      subtotal: subtotal || totalAmount,
      shippingCost: shippingCost || 0,
      totalAmount,
      paymentStatus:     razorpayPaymentId ? 'paid' : 'pending',
      razorpayOrderId:   razorpayOrderId   || null,
      razorpayPaymentId: razorpayPaymentId || null,
      razorpaySignature: razorpaySignature || null,
      orderStatus: 'Pending',
      notes: notes || ''
    });

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

// GET /api/order/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).lean();
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({
      success: true,
      data: { ...order, orderNumber: `ML-${order._id.toString().slice(-6).toUpperCase()}` }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/orders/track/:email  — customer order tracking
const getOrdersByEmail = async (req, res) => {
  try {
    const email = req.params.email?.toLowerCase().trim();
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const orders = await Order.find({ email })
      .sort({ createdAt: -1 })
      .select('_id customerName totalAmount orderStatus paymentStatus createdAt items shippingCost subtotal address phone')
      .lean();

    res.json({
      success: true,
      count: orders.length,
      data: orders.map(o => ({
        ...o,
        orderNumber: `ML-${o._id.toString().slice(-6).toUpperCase()}`
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createRazorpayOrderHandler, createOrder, getOrderById, getOrdersByEmail };

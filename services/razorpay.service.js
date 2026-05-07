const Razorpay = require('razorpay');
const crypto   = require('crypto');

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials not configured');
  }
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

const createRazorpayOrder = async (amount, receipt) => {
  const razorpay = getRazorpayInstance();
  return razorpay.orders.create({
    amount:   Math.round(amount * 100),  // paise
    currency: 'INR',
    receipt,
    notes: { source: 'maison-luxe' }
  });
};

const verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  return expectedSignature === razorpaySignature;
};

module.exports = { createRazorpayOrder, verifyPaymentSignature };

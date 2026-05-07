const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image:    { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    // Customer Info
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true
    },
    address: {
      street:  { type: String, required: true },
      city:    { type: String, required: true },
      state:   { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' }
    },

    // Order Items
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: arr => arr.length > 0,
        message: 'Order must have at least one item'
      }
    },

    // Financials
    subtotal:     { type: Number, required: true },
    shippingCost: { type: Number, default: 0 },
    totalAmount:  { type: Number, required: true },

    // Payment
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    razorpayOrderId:   { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },

    // Order Status
    orderStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'],
      default: 'Pending'
    },

    // Notes
    notes: { type: String, default: '' }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Generate readable order number
orderSchema.virtual('orderNumber').get(function () {
  return `ML-${this._id.toString().slice(-6).toUpperCase()}`;
});

orderSchema.index({ email: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ razorpayOrderId: 1 });

module.exports = mongoose.model('Order', orderSchema);

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    originalPrice: {
      type: Number,
      default: null
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Seating', 'Tables', 'Bedroom', 'Lighting', 'Storage', 'Outdoor', 'Decor'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    material: {
      type: String,
      trim: true
    },
    images: {
      type: [String],
      required: [true, 'At least one image is required'],
      validate: {
        validator: arr => arr.length > 0,
        message: 'At least one image is required'
      }
    },
    inStock: {
      type: Boolean,
      default: true
    },
    badge: {
      type: String,
      enum: ['New', 'Sale', 'Bestseller', 'Limited', null],
      default: null
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviews: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);

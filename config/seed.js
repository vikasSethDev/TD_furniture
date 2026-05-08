require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('../models/Product');
const Admin   = require('../models/Admin');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/maison_luxe';

const products = [
  {
    name: 'Meridian Lounge Chair',
    price: 2890,
    originalPrice: 3400,
    category: 'Seating',
    description: 'Crafted from full-grain Italian leather with a solid walnut frame. Hand-stitched by master artisans in Florence, this timeless heirloom is designed to age beautifully over decades of use.',
    material: 'Italian Leather & Walnut',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'
    ],
    inStock: true,
    badge: 'Sale',
    rating: 4.9,
    reviews: 84
  },
  {
    name: 'Sorrento Dining Table',
    price: 4750,
    category: 'Tables',
    description: 'A statement piece anchoring any dining space. Features a bookmatched Calacatta marble top resting on hand-forged brass legs, finished with a warm antique patina.',
    material: 'Calacatta Marble & Brass',
    images: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80',
      'https://images.unsplash.com/photo-1449247613801-ab06418e2861?w=800&q=80'
    ],
    inStock: true,
    badge: 'New',
    rating: 4.8,
    reviews: 42
  },
  {
    name: 'Venezia Sofa',
    price: 6200,
    category: 'Seating',
    description: 'Deeply cushioned and generously proportioned — the Venezia is an invitation to unwind. Upholstered in sustainably-sourced Belgian velvet over a solid white oak base.',
    material: 'Belgian Velvet & White Oak',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80'
    ],
    inStock: true,
    badge: 'Bestseller',
    rating: 5.0,
    reviews: 127
  },
  {
    name: 'Kyoto Floor Lamp',
    price: 890,
    category: 'Lighting',
    description: 'Where Japanese minimalism meets Western luxury. A sculptural marble base supports a hand-spun brass stem, crowned with a linen shade that diffuses light beautifully.',
    material: 'Brass & Marble',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a35549b3e?w=800&q=80'
    ],
    inStock: true,
    rating: 4.7,
    reviews: 56
  },
  {
    name: 'Amalfi Accent Table',
    price: 1450,
    category: 'Tables',
    description: 'Sculpted from natural travertine stone with a polished gold base. The organic veining makes every piece one-of-a-kind — a small sculpture for your living space.',
    material: 'Travertine & Gold',
    images: [
      'https://images.unsplash.com/photo-1449247613801-ab06418e2861?w=800&q=80',
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80'
    ],
    inStock: true,
    badge: 'Limited',
    rating: 4.9,
    reviews: 21
  },
  {
    name: 'Capri Bed Frame',
    price: 5400,
    category: 'Bedroom',
    description: 'A sanctuary unto itself. The Capri\'s floating headboard in channelled linen sits above a solid walnut base, creating a grounded, serene focal point for any bedroom.',
    material: 'Walnut & Linen',
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80'
    ],
    inStock: true,
    rating: 4.8,
    reviews: 63
  },
  {
    name: 'Milano Coffee Table',
    price: 2200,
    category: 'Tables',
    description: 'Tempered smoked glass floats above a polished chrome frame in this architecturally-inspired piece that reflects light like a modern sculpture.',
    material: 'Smoked Glass & Chrome',
    images: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
      'https://images.unsplash.com/photo-1449247613801-ab06418e2861?w=800&q=80'
    ],
    inStock: true,
    rating: 4.5,
    reviews: 49
  },
  {
    name: 'Nordic Bookshelf',
    price: 3100,
    category: 'Storage',
    description: 'A quiet study in proportion and grain. Crafted from smoked oak with open shelving designed to display art, books and objects with gallery-like precision.',
    material: 'Smoked Oak',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80'
    ],
    inStock: true,
    rating: 4.6,
    reviews: 38
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    await Product.insertMany(products);
    console.log(`✅ Inserted ${products.length} products`);

    // Create default admin — plain password, pre-save hook hashes it automatically
    await Admin.deleteMany({});
    const adminDoc = new Admin({ username: 'admin', password: 'admin123', name: 'Super Admin', role: 'superadmin' });
    await adminDoc.save();
    console.log('✅ Admin user created (admin / admin123)');

    console.log('\n🎉 Database seeded successfully!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();

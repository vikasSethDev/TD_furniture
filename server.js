const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// ─────────────────────────────────────────────────────────────
// Security Middleware
// ─────────────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// ─────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || 'http://localhost:4200',
      'http://localhost:4200'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// ─────────────────────────────────────────────────────────────
// Body Parsers
// ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb'
  })
);

// ─────────────────────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api', orderRoutes);
app.use('/api/admin', adminRoutes);

// ─────────────────────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// ─────────────────────────────────────────────────────────────
// Angular Production Build
// Angular 17+ build path
// client/dist/maison-luxe/browser
// ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {

  const angularPath = path.join(__dirname, 'public/browser');

  console.log('📦 Angular Path:', angularPath);

  // Serve Angular static files
  app.use(express.static(angularPath));

  // Angular SPA fallback
  app.get('*', (_req, res) => {
    res.sendFile(path.join(angularPath, 'index.html'));
  });
}

// ─────────────────────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {

  console.error('❌ Global Error:', err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack
    })
  });
});

// ─────────────────────────────────────────────────────────────
// Database Connection + Server Start
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(
    process.env.MONGO_URI ||
    'mongodb://localhost:27017/maison_luxe'
  )
  .then(() => {

    console.log('✅ MongoDB Connected');

    app.listen(PORT, () => {

      console.log(
        `🚀 Server running on http://localhost:${PORT}`
      );

      console.log(
        `📦 Environment: ${
          process.env.NODE_ENV || 'development'
        }`
      );
    });
  })
  .catch(err => {

    console.error(
      '❌ MongoDB connection error:',
      err.message
    );

    process.exit(1);
  });

module.exports = app;
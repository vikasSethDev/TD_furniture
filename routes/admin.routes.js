const express = require('express');
const router  = express.Router();
const { login, getOrders, getOrderDetails, updateOrderStatus, getDashboardStats } = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

const loginValidation = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/login', loginValidation, validate, login);

// Protected admin routes
router.get('/orders',            verifyToken, getOrders);
router.get('/orders/:id',        verifyToken, getOrderDetails);
router.put('/order/:id/status',  verifyToken, updateOrderStatus);
router.get('/dashboard',         verifyToken, getDashboardStats);

module.exports = router;

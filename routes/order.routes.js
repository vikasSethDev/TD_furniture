const express = require('express');
const router  = express.Router();
const { createRazorpayOrderHandler, createOrder, getOrderById } = require('../controllers/order.controller');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');

const orderValidation = [
  body('customerName').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('address.street').trim().notEmpty().withMessage('Street is required'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('address.state').trim().notEmpty().withMessage('State is required'),
  body('address.pincode').trim().notEmpty().withMessage('Pincode is required'),
  body('items').isArray({ min: 1 }).withMessage('Items are required'),
  body('totalAmount').isNumeric().withMessage('Total amount is required')
];

router.post('/order/create-razorpay-order', createRazorpayOrderHandler);
router.post('/order', orderValidation, validate, createOrder);
router.get('/order/:id', getOrderById);

module.exports = router;

const express = require('express');
const router  = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/',    getProducts);
router.get('/:id', getProduct);

// Admin protected
router.post('/',    verifyToken, createProduct);
router.put('/:id',  verifyToken, updateProduct);
router.delete('/:id', verifyToken, deleteProduct);

module.exports = router;

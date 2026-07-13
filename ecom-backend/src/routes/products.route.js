const express = require('express');
const router = express.Router();
const { getProducts, searchProducts, getProductBySlug } = require('../controllers/products.controller');

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:slug', getProductBySlug);

module.exports = router;
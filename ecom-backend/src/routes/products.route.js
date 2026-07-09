const express = require('express');
const router = express.Router();
const { getProducts, getProductBySlug } = require('../controllers/products.controller');

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

module.exports = router;
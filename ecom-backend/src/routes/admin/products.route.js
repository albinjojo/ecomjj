const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createProduct, updateProduct, uploadProductImage } = require('../../controllers/admin/products.controller');
const { requireAdminAuth } = require('../../middleware/admin/adminAuth.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max upload, before compression
});

router.post('/', requireAdminAuth, createProduct);
router.put('/:id', requireAdminAuth, updateProduct);
router.post('/:id/images', requireAdminAuth, upload.single('image'), uploadProductImage);

module.exports = router;
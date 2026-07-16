const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
  setMainImage,
} = require('../../controllers/admin/products.controller');
const { requireAdminAuth } = require('../../middleware/admin/adminAuth.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.post('/', requireAdminAuth, createProduct);
router.put('/:id', requireAdminAuth, updateProduct);
router.delete('/:id', requireAdminAuth, deleteProduct);
router.post('/:id/images', requireAdminAuth, upload.array('images', 4), uploadProductImage);
router.delete('/:id/images/:imageId', requireAdminAuth, deleteProductImage);
router.put('/:id/images/:imageId/main', requireAdminAuth, setMainImage);

module.exports = router;
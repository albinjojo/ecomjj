const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getAllCategories,
  createCategory,
  updateCategory,
  uploadCategoryImage,
  deleteCategory,
} = require('../../controllers/admin/categories.controller');
const { requireAdminAuth } = require('../../middleware/admin/adminAuth.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.get('/', requireAdminAuth, getAllCategories);
router.post('/', requireAdminAuth, createCategory);
router.put('/:id', requireAdminAuth, updateCategory);
router.post('/:id/image', requireAdminAuth, upload.single('image'), uploadCategoryImage);
router.delete('/:id', requireAdminAuth, deleteCategory);

module.exports = router;
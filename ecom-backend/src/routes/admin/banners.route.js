const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAllBanners, createBanner, updateBanner, deleteBanner } = require('../../controllers/admin/banners.controller');
const { requireAdminAuth } = require('../../middleware/admin/adminAuth.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.get('/', requireAdminAuth, getAllBanners);
router.post('/', requireAdminAuth, upload.single('image'), createBanner);
router.put('/:id', requireAdminAuth, updateBanner);
router.delete('/:id', requireAdminAuth, deleteBanner);

module.exports = router;
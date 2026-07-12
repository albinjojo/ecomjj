const express = require('express');
const router = express.Router();
const { getAddresses, createAddress, updateAddress, deleteAddress } = require('../controllers/addresses.controller');
const { requireAuth } = require('../middleware/auth.middleware');

router.get('/', requireAuth, getAddresses);
router.post('/', requireAuth, createAddress);
router.put('/:id', requireAuth, updateAddress);
router.delete('/:id', requireAuth, deleteAddress);

module.exports = router;
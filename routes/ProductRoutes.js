const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../contollers/ProductController');

const { protect, authorize } = require('../middleware/auth');
const { uploadMultiple } = require('../utils/fileUploader');

// Allow merging params for nested routes (e.g., /api/exhibitors/:exhibitorId/products)
const router = express.Router({ mergeParams: true });

// Public access to view products
router.route('/').get(getProducts);
router.route('/:id').get(getProduct);

// Protected routes (Exhibitors and Admins only)
router.use(protect);
router.use(authorize('exhibitor', 'admin'));

router.route('/')
  // Use the uploadMultiple middleware for the creation route
  .post(uploadMultiple, createProduct);

router.route('/:id')
  .put(updateProduct)
  .delete(deleteProduct);

module.exports = router;
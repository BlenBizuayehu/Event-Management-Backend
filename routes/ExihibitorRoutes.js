const express = require('express');
const {
  createExhibitor,
  getExhibitors,
  getExhibitor,
  updateExhibitor
} = require('../controllers/exhibitorController');
const { protect, authorize } = require('../middleware/auth');
const advancedResults = require('../middleware/advancedResults');
const Exhibitor = require('../models/Exhibitor');

const router = express.Router();

router
  .route('/')
  .get(advancedResults(Exhibitor, ['organizer', 'event']), getExhibitors)
  .post(protect, authorize('organizer'), createExhibitor);

router
  .route('/:id')
  .get(getExhibitor)
  .put(protect, authorize('organizer'), updateExhibitor);
  const productRouter = require('./ProductRoutes');

// Re-route /api/exhibitors/:exhibitorId/products to the product router
router.use('/:exhibitorId/products', productRouter);

module.exports = router;
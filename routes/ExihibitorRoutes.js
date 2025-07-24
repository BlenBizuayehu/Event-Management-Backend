// routes/ExhibitorRoutes.js
const express = require("express");
const {
  createExhibitor,
  getExhibitors,
  getExhibitor,
  updateExhibitor,
} = require("../contollers/ExihibitorController");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");
const Exhibitor = require("../models/Exhibitor");

const router = express.Router({ mergeParams: true }); // Important for nested routes
const productRouter = require("./ProductRoutes");
router.use("/:exhibitorId/products", productRouter);
// Get all exhibitors for an event, or create exhibitor under event
router
  .route("/")
  .get(advancedResults(Exhibitor, ["organizer", "event"]), getExhibitors)
  .post(protect, authorize("organizer"), createExhibitor);

router
  .route("/:id")
  .get(getExhibitor)
  .put(protect, authorize("organizer"), updateExhibitor);

module.exports = router;

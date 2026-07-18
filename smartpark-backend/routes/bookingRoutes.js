const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  getBooking,
  cancelBooking,
} = require("../controllers/bookingController");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("customer"),
  [body("slotId").notEmpty().withMessage("slotId is required")],
  validate,
  createBooking
);

router.get("/me", protect, authorize("customer"), getMyBookings);
router.get("/owner/me", protect, authorize("owner"), getOwnerBookings);
router.get("/:id", protect, getBooking);
router.put("/:id/cancel", protect, authorize("customer"), cancelBooking);

module.exports = router;

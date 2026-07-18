const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const {
  createSpace,
  getSpace,
  getMySpaces,
  updateSpace,
  deleteSpace,
  addSlot,
  searchSpaces,
} = require("../controllers/parkingSpaceController");

const router = express.Router();

// Public search - must be declared before "/:id" to avoid route collision
router.get("/search", searchSpaces);

router.get("/owner/me", protect, authorize("owner"), getMySpaces);

router.post(
  "/",
  protect,
  authorize("owner"),
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("address").trim().notEmpty().withMessage("Address is required"),
    body("city").trim().notEmpty().withMessage("City is required"),
    body("totalSlots").isInt({ min: 1 }).withMessage("totalSlots must be a positive integer"),
    body("pricePerHour").isFloat({ min: 0 }).withMessage("pricePerHour must be a positive number"),
  ],
  validate,
  createSpace
);

router.get("/:id", getSpace);

router.put("/:id", protect, authorize("owner"), updateSpace);

router.delete("/:id", protect, authorize("owner"), deleteSpace);

router.post(
  "/:id/slots",
  protect,
  authorize("owner"),
  [
    body("date").notEmpty().withMessage("date is required (YYYY-MM-DD)"),
    body("startTime").notEmpty().withMessage("startTime is required (HH:mm)"),
    body("endTime").notEmpty().withMessage("endTime is required (HH:mm)"),
  ],
  validate,
  addSlot
);

module.exports = router;

const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const { initiatePayment, getPaymentByBooking } = require("../controllers/paymentController");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("customer"),
  [
    body("bookingId").notEmpty().withMessage("bookingId is required"),
    body("paymentMethod")
      .isIn(["card", "upi", "netbanking", "wallet"])
      .withMessage("paymentMethod must be one of card, upi, netbanking, wallet"),
  ],
  validate,
  initiatePayment
);

router.get("/booking/:bookingId", protect, getPaymentByBooking);

module.exports = router;

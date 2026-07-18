const Booking = require("../models/Booking");
const Payment = require("../models/Payment");

// @route POST /api/payments  (customer only)
// In production this would create a payment-gateway order (Razorpay/Stripe)
// and this endpoint would instead be a webhook/callback handler.
// Here we simulate an immediate success for demo purposes.
async function initiatePayment(req, res, next) {
  try {
    const { bookingId, paymentMethod } = req.body;

    const booking = Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to pay for this booking" });
    }

    const existingPayment = Payment.findByBooking(bookingId);
    if (existingPayment && existingPayment.paymentStatus === "success") {
      return res.status(400).json({ message: "This booking is already paid for" });
    }

    const payment = Payment.create({
      bookingId,
      amount: booking.totalAmount,
      paymentMethod,
    });

    // --- Simulated gateway call ---
    const gatewaySucceeded = true; // swap with real gateway response
    // --------------------------------

    if (gatewaySucceeded) {
      Payment.updateStatus(payment.id, "success");
      Booking.updateStatus(bookingId, "confirmed");
    } else {
      Payment.updateStatus(payment.id, "failed");
      // Booking stays "pending" so the slot remains locked but unconfirmed;
      // a cleanup job should release slots for stale pending bookings.
    }

    const updatedPayment = Payment.findById(payment.id);
    const updatedBooking = Booking.findById(bookingId);

    res.status(201).json({ payment: updatedPayment, booking: updatedBooking });
  } catch (err) {
    next(err);
  }
}

// @route GET /api/payments/booking/:bookingId
async function getPaymentByBooking(req, res, next) {
  try {
    const booking = Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.userId !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this payment" });
    }

    const payment = Payment.findByBooking(req.params.bookingId);
    if (!payment) return res.status(404).json({ message: "No payment found for this booking" });

    res.json({ payment });
  } catch (err) {
    next(err);
  }
}

module.exports = { initiatePayment, getPaymentByBooking };

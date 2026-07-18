const Slot = require("../models/Slot");
const Booking = require("../models/Booking");
const ParkingSpace = require("../models/ParkingSpace");
const Payment = require("../models/Payment");
const db = require("../config/db");

// @route POST /api/bookings  (customer only)
// Reserves a slot. Uses a synchronous read-check-write on lowdb so two
// requests can't both grab the same slot (lowdb's FileSync adapter writes
// synchronously, which effectively serializes this critical section).
async function createBooking(req, res, next) {
  try {
    const { slotId } = req.body;

    const slot = Slot.findById(slotId);
    if (!slot) return res.status(404).json({ message: "Slot not found" });

    if (!slot.isAvailable) {
      return res.status(409).json({ message: "Slot is already booked. Please choose another." });
    }

    const space = ParkingSpace.findById(slot.parkingSpaceId);
    if (!space) return res.status(404).json({ message: "Parking space not found" });

    // Compute total amount based on duration (hours) * pricePerHour
    const [startH, startM] = slot.startTime.split(":").map(Number);
    const [endH, endM] = slot.endTime.split(":").map(Number);
    const durationHours = (endH * 60 + endM - (startH * 60 + startM)) / 60;
    const totalAmount = Math.max(durationHours, 0.5) * space.pricePerHour;

    // --- Critical section: lock slot immediately to prevent double-booking ---
    Slot.setAvailability(slot.id, false);

    const booking = Booking.create({
      userId: req.user.id,
      parkingSpaceId: space.id,
      slotId: slot.id,
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      totalAmount,
    });
    // --- End critical section ---

    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
}

// @route GET /api/bookings/me  (customer only - their own bookings)
async function getMyBookings(req, res, next) {
  try {
    const bookings = Booking.findByUser(req.user.id);
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
}

// @route GET /api/bookings/owner/me  (owner only - bookings on their spaces)
async function getOwnerBookings(req, res, next) {
  try {
    const mySpaces = ParkingSpace.findByOwner(req.user.id);
    const spaceIds = mySpaces.map((s) => s.id);
    const bookings = Booking.findByOwnerSpaces(spaceIds);
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
}

// @route GET /api/bookings/:id
async function getBooking(req, res, next) {
  try {
    const booking = Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isOwnerOfBooking = booking.userId === req.user.id;
    const space = ParkingSpace.findById(booking.parkingSpaceId);
    const isOwnerOfSpace = space && space.ownerId === req.user.id;

    if (!isOwnerOfBooking && !isOwnerOfSpace && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this booking" });
    }

    const payment = Payment.findByBooking(booking.id);
    res.json({ booking, payment: payment || null });
  } catch (err) {
    next(err);
  }
}

// @route PUT /api/bookings/:id/cancel  (customer who booked it)
async function cancelBooking(req, res, next) {
  try {
    const booking = Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.userId !== req.user.id) {
      return res.status(403).json({ message: "You can only cancel your own bookings" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }
    if (booking.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel a completed booking" });
    }

    const updated = Booking.updateStatus(booking.id, "cancelled");
    Slot.setAvailability(booking.slotId, true); // free up the slot again

    // If a payment was already made, mark it refunded
    const payment = Payment.findByBooking(booking.id);
    if (payment && payment.paymentStatus === "success") {
      Payment.updateStatus(payment.id, "refunded");
    }

    res.json({ booking: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  getBooking,
  cancelBooking,
};

const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

const TABLE = "payments";

/**
 * Payment shape:
 * {
 *   id, bookingId, amount,
 *   paymentStatus: "pending" | "success" | "failed" | "refunded",
 *   paymentMethod, transactionId,
 *   paidAt, createdAt
 * }
 */

function create(data) {
  const payment = {
    id: uuidv4(),
    bookingId: data.bookingId,
    amount: data.amount,
    paymentStatus: "pending",
    paymentMethod: data.paymentMethod,
    transactionId: `TXN-${uuidv4().slice(0, 8).toUpperCase()}`,
    paidAt: null,
    createdAt: new Date().toISOString(),
  };
  db.get(TABLE).push(payment).write();
  return payment;
}

function findById(id) {
  return db.get(TABLE).find({ id }).value();
}

function findByBooking(bookingId) {
  return db.get(TABLE).find({ bookingId }).value();
}

function updateStatus(id, paymentStatus) {
  const updates = { paymentStatus };
  if (paymentStatus === "success") updates.paidAt = new Date().toISOString();
  db.get(TABLE).find({ id }).assign(updates).write();
  return findById(id);
}

module.exports = { create, findById, findByBooking, updateStatus };

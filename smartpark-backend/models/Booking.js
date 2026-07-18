const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

const TABLE = "bookings";

/**
 * Booking shape:
 * {
 *   id, userId, parkingSpaceId, slotId,
 *   date, startTime, endTime,
 *   status: "pending" | "confirmed" | "completed" | "cancelled",
 *   totalAmount,
 *   createdAt
 * }
 */

function create(data) {
  const booking = {
    id: uuidv4(),
    userId: data.userId,
    parkingSpaceId: data.parkingSpaceId,
    slotId: data.slotId,
    date: data.date,
    startTime: data.startTime,
    endTime: data.endTime,
    status: "pending",
    totalAmount: data.totalAmount,
    createdAt: new Date().toISOString(),
  };
  db.get(TABLE).push(booking).write();
  return booking;
}

function findById(id) {
  return db.get(TABLE).find({ id }).value();
}

function findByUser(userId) {
  return db.get(TABLE).filter({ userId }).value();
}

function findByOwnerSpaces(spaceIds) {
  return db
    .get(TABLE)
    .filter((b) => spaceIds.includes(b.parkingSpaceId))
    .value();
}

function updateStatus(id, status) {
  db.get(TABLE).find({ id }).assign({ status }).write();
  return findById(id);
}

module.exports = { create, findById, findByUser, findByOwnerSpaces, updateStatus };

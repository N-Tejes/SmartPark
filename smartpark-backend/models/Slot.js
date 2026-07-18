const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

const TABLE = "slots";

/**
 * Slot shape (represents one bookable time-window of availability
 * for a parking space):
 * {
 *   id, parkingSpaceId, date, startTime, endTime,
 *   isAvailable: boolean,
 *   createdAt
 * }
 */

function create(data) {
  const slot = {
    id: uuidv4(),
    parkingSpaceId: data.parkingSpaceId,
    date: data.date, // "YYYY-MM-DD"
    startTime: data.startTime, // "HH:mm"
    endTime: data.endTime, // "HH:mm"
    isAvailable: true,
    createdAt: new Date().toISOString(),
  };
  db.get(TABLE).push(slot).write();
  return slot;
}

function findById(id) {
  return db.get(TABLE).find({ id }).value();
}

function findByParkingSpace(parkingSpaceId) {
  return db.get(TABLE).filter({ parkingSpaceId }).value();
}

function findAvailable(parkingSpaceId, date) {
  return db
    .get(TABLE)
    .filter({ parkingSpaceId, date, isAvailable: true })
    .value();
}

function setAvailability(id, isAvailable) {
  db.get(TABLE).find({ id }).assign({ isAvailable }).write();
  return findById(id);
}

function remove(id) {
  db.get(TABLE).remove({ id }).write();
}

module.exports = {
  create,
  findById,
  findByParkingSpace,
  findAvailable,
  setAvailability,
  remove,
};

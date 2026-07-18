const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

const TABLE = "parkingSpaces";

/**
 * ParkingSpace shape:
 * {
 *   id, ownerId, title, address, city, latitude, longitude,
 *   totalSlots, pricePerHour, description,
 *   status: "active" | "inactive",
 *   createdAt
 * }
 */

function create(data) {
  const space = {
    id: uuidv4(),
    ownerId: data.ownerId,
    title: data.title,
    address: data.address,
    city: data.city,
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    totalSlots: data.totalSlots,
    pricePerHour: data.pricePerHour,
    description: data.description || "",
    status: "active",
    createdAt: new Date().toISOString(),
  };
  db.get(TABLE).push(space).write();
  return space;
}

function findById(id) {
  return db.get(TABLE).find({ id }).value();
}

function findByOwner(ownerId) {
  return db.get(TABLE).filter({ ownerId }).value();
}

function search({ city, minPrice, maxPrice }) {
  let query = db.get(TABLE).filter({ status: "active" });

  if (city) {
    query = query.filter(
      (s) => s.city && s.city.toLowerCase().includes(city.toLowerCase())
    );
  }
  if (minPrice) {
    query = query.filter((s) => s.pricePerHour >= Number(minPrice));
  }
  if (maxPrice) {
    query = query.filter((s) => s.pricePerHour <= Number(maxPrice));
  }
  return query.value();
}

function update(id, updates) {
  db.get(TABLE).find({ id }).assign(updates).write();
  return findById(id);
}

function remove(id) {
  db.get(TABLE).remove({ id }).write();
}

module.exports = { create, findById, findByOwner, search, update, remove };

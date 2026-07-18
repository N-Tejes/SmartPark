const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

const TABLE = "users";

/**
 * User shape:
 * {
 *   id, name, email, password (hashed), phone,
 *   role: "owner" | "customer" | "admin",
 *   createdAt
 * }
 */

function create({ name, email, password, phone, role }) {
  const user = {
    id: uuidv4(),
    name,
    email: email.toLowerCase(),
    password,
    phone,
    role: role || "customer",
    createdAt: new Date().toISOString(),
  };
  db.get(TABLE).push(user).write();
  return user;
}

function findByEmail(email) {
  return db.get(TABLE).find({ email: email.toLowerCase() }).value();
}

function findById(id) {
  return db.get(TABLE).find({ id }).value();
}

function toPublic(user) {
  if (!user) return null;
  const { password, ...publicUser } = user;
  return publicUser;
}

module.exports = { create, findByEmail, findById, toPublic };

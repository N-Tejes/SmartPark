/**
 * Database connection (lowdb - JSON file based).
 *
 * NOTE: This uses a lightweight JSON-file database so the project runs
 * anywhere with zero setup (no MySQL/Postgres server required).
 * For production, swap this out for Sequelize + MySQL/Postgres by
 * replacing the model files in /models with Sequelize models -
 * the controllers/routes layer will not need to change much since
 * data access is isolated behind the model functions.
 */
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");

const adapter = new FileSync(path.join(__dirname, "..", "database.json"));
const db = low(adapter);

// Initialize default collections
db.defaults({
  users: [],
  parkingSpaces: [],
  slots: [],
  bookings: [],
  payments: [],
}).write();

module.exports = db;

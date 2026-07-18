const ParkingSpace = require("../models/ParkingSpace");
const Slot = require("../models/Slot");

// @route POST /api/parking-spaces  (owner only)
async function createSpace(req, res, next) {
  try {
    const { title, address, city, latitude, longitude, totalSlots, pricePerHour, description } =
      req.body;

    const space = ParkingSpace.create({
      ownerId: req.user.id,
      title,
      address,
      city,
      latitude,
      longitude,
      totalSlots,
      pricePerHour,
      description,
    });

    res.status(201).json({ parkingSpace: space });
  } catch (err) {
    next(err);
  }
}

// @route GET /api/parking-spaces/:id
async function getSpace(req, res, next) {
  try {
    const space = ParkingSpace.findById(req.params.id);
    if (!space) return res.status(404).json({ message: "Parking space not found" });

    const slots = Slot.findByParkingSpace(space.id);
    res.json({ parkingSpace: space, slots });
  } catch (err) {
    next(err);
  }
}

// @route GET /api/parking-spaces/owner/me  (owner only - their own listings)
async function getMySpaces(req, res, next) {
  try {
    const spaces = ParkingSpace.findByOwner(req.user.id);
    res.json({ parkingSpaces: spaces });
  } catch (err) {
    next(err);
  }
}

// @route PUT /api/parking-spaces/:id  (owner only, must own it)
async function updateSpace(req, res, next) {
  try {
    const space = ParkingSpace.findById(req.params.id);
    if (!space) return res.status(404).json({ message: "Parking space not found" });

    if (space.ownerId !== req.user.id) {
      return res.status(403).json({ message: "You do not own this parking space" });
    }

    const allowedFields = [
      "title",
      "address",
      "city",
      "latitude",
      "longitude",
      "totalSlots",
      "pricePerHour",
      "description",
      "status",
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updated = ParkingSpace.update(req.params.id, updates);
    res.json({ parkingSpace: updated });
  } catch (err) {
    next(err);
  }
}

// @route DELETE /api/parking-spaces/:id  (owner only, must own it)
async function deleteSpace(req, res, next) {
  try {
    const space = ParkingSpace.findById(req.params.id);
    if (!space) return res.status(404).json({ message: "Parking space not found" });

    if (space.ownerId !== req.user.id) {
      return res.status(403).json({ message: "You do not own this parking space" });
    }

    ParkingSpace.remove(req.params.id);
    res.json({ message: "Parking space deleted successfully" });
  } catch (err) {
    next(err);
  }
}

// @route POST /api/parking-spaces/:id/slots  (owner only - add availability)
async function addSlot(req, res, next) {
  try {
    const space = ParkingSpace.findById(req.params.id);
    if (!space) return res.status(404).json({ message: "Parking space not found" });

    if (space.ownerId !== req.user.id) {
      return res.status(403).json({ message: "You do not own this parking space" });
    }

    const { date, startTime, endTime } = req.body;
    const slot = Slot.create({ parkingSpaceId: space.id, date, startTime, endTime });
    res.status(201).json({ slot });
  } catch (err) {
    next(err);
  }
}

// @route GET /api/parking-spaces/search?city=&date=&minPrice=&maxPrice=
async function searchSpaces(req, res, next) {
  try {
    const { city, date, minPrice, maxPrice } = req.query;
    let spaces = ParkingSpace.search({ city, minPrice, maxPrice });

    // If a date is given, only return spaces that actually have an
    // available slot on that date.
    if (date) {
      spaces = spaces.filter((space) => {
        const availableSlots = Slot.findAvailable(space.id, date);
        return availableSlots.length > 0;
      });
    }

    res.json({ count: spaces.length, parkingSpaces: spaces });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createSpace,
  getSpace,
  getMySpaces,
  updateSpace,
  deleteSpace,
  addSlot,
  searchSpaces,
};

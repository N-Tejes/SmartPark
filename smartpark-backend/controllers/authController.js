const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @route POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password, phone, role } = req.body;

    const existing = User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = User.create({ name, email, password: hashedPassword, phone, role });
    const token = generateToken(user.id);

    res.status(201).json({ user: User.toPublic(user), token });
  } catch (err) {
    next(err);
  }
}

// @route POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user.id);
    res.json({ user: User.toPublic(user), token });
  } catch (err) {
    next(err);
  }
}

// @route GET /api/auth/me
async function getMe(req, res, next) {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe };

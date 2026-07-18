const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Verifies the JWT sent in the Authorization header ("Bearer <token>")
 * and attaches the authenticated user to req.user.
 */
function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = User.toPublic(user);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token invalid or expired" });
  }
}

/**
 * Restricts access to specific roles, e.g. authorize("owner", "admin").
 * Must be used after `protect`.
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: `Access denied. Requires role: ${roles.join(" or ")}` });
    }
    next();
  };
}

module.exports = { protect, authorize };

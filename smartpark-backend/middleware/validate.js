const { validationResult } = require("express-validator");

/**
 * Runs after express-validator check(...) chains.
 * If any validation failed, responds with 400 + details.
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

module.exports = validate;

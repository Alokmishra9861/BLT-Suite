const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.substring(7) : null;

  if (!token) {
    return next(new ApiError(401, "Unauthorized"));
  }

  try {
    const payload = jwt.verify(token, jwtConfig.secret);
    const user = await User.findById(payload.id).populate("role").lean();

    if (!user) {
      return next(new ApiError(401, "Unauthorized"));
    }

    // Ensure req.user.id is available for lean objects
    user.id = user._id;
    // propagate entityId from token if present
    if (payload.entityId) user.entityId = payload.entityId;
    req.user = user;
    return next();
  } catch (error) {
    return next(new ApiError(401, "Invalid token"));
  }
};

module.exports = authMiddleware;

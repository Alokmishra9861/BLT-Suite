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

    req.user = user;
    return next();
  } catch (error) {
    return next(new ApiError(401, "Invalid token"));
  }
};

module.exports = authMiddleware;

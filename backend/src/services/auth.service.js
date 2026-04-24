const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

const generateToken = (user, entityId) => {
  const payload = {
    id: user._id,
    role: user.role?.name,
  };

  if (entityId) payload.entityId = entityId;

  return jwt.sign(payload, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn });
};

const login = async (email, password, entityId) => {
  const findQuery = entityId ? { email, entityIds: entityId } : { email };

  const user = await User.findOne(findQuery).select("+password").populate("role");

  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = generateToken(user, entityId);
  const safeUser = user.toObject();
  delete safeUser.password;

  return { token, user: safeUser };
};

const me = async (userId) => {
  const user = await User.findById(userId).populate("role").lean();
  if (!user) throw new ApiError(404, "User not found");
  return user;
};

module.exports = {
  login,
  me,
  generateToken,
};

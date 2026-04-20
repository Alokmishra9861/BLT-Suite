const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role?.name,
    },
    jwtConfig.secret,
    { expiresIn: jwtConfig.expiresIn },
  );
};

const login = async (email, password) => {
  const user = await User.findOne({ email })
    .select("+password")
    .populate("role");

  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = generateToken(user);
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

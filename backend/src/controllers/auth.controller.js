const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");
const authService = require("../services/auth.service");

const login = catchAsync(async (req, res) => {
  const { email, password, entityId } = req.body;
  const { token, user } = await authService.login(email, password, entityId);
  res.json(
    new ApiResponse({ data: { token, user }, message: "Login successful" }),
  );
});

const me = catchAsync(async (req, res) => {
  const user = await authService.me(req.user._id || req.user.id);
  res.json(new ApiResponse({ data: user }));
});

module.exports = {
  login,
  me,
};

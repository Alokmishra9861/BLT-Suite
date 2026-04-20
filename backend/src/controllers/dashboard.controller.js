const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");
const dashboardService = require("../services/dashboard.service");

const summary = catchAsync(async (req, res) => {
  const data = await dashboardService.getSummary(req.entityId);
  res.json(new ApiResponse({ data }));
});

module.exports = {
  summary,
};

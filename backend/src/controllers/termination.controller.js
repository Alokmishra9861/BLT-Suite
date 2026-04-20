const Termination = require("../models/Termination");
const Employee = require("../models/Employee");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

const getTerminations = catchAsync(async (req, res) => {
  const { entityId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const terminations = await Termination.find({ entityId })
    .populate("employeeId", "firstName lastName")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Termination.countDocuments({ entityId });

  res.status(200).json(
    new ApiResponse({
      data: {
        terminations,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
      message: "Terminations retrieved successfully",
    }),
  );
});

const createTermination = catchAsync(async (req, res) => {
  const { entityId } = req.params;
  const terminationData = { ...req.body, entityId };

  // Update employee status to terminated
  await Employee.findByIdAndUpdate(terminationData.employeeId, {
    status: "terminated",
  });

  const termination = await Termination.create(terminationData);
  await termination.populate("employeeId", "firstName lastName");

  res.status(201).json(
    new ApiResponse({
      data: termination,
      message: "Termination created successfully",
    }),
  );
});

module.exports = {
  getTerminations,
  createTermination,
};

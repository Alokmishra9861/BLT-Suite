const WorkPermit = require("../models/WorkPermit");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const {
  getSelectedEntityId,
  ensureCanCreateOperationalRecord,
} = require("../utils/entityScope.util");

const getWorkPermits = catchAsync(async (req, res) => {
  const entityId = getSelectedEntityId(req);
  const { page = 1, limit = 10, employeeId } = req.query;

  const query = { entityId };
  if (employeeId) query.employeeId = employeeId;

  const workPermits = await WorkPermit.find(query)
    .populate("employeeId", "firstName lastName")
    .sort({ expiryDate: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await WorkPermit.countDocuments(query);

  res.status(200).json(
    new ApiResponse({
      data: {
        workPermits,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
      message: "Work permits retrieved successfully",
    }),
  );
});

const createWorkPermit = catchAsync(async (req, res) => {
  const entityId = getSelectedEntityId(req);
  ensureCanCreateOperationalRecord(req);
  const workPermitData = { ...req.body, entityId };

  const workPermit = await WorkPermit.create(workPermitData);
  await workPermit.populate("employeeId", "firstName lastName");

  res.status(201).json(
    new ApiResponse({
      data: workPermit,
      message: "Work permit created successfully",
    }),
  );
});

const updateWorkPermit = catchAsync(async (req, res) => {
  const { id } = req.params;
  const entityId = getSelectedEntityId(req);
  const workPermit = await WorkPermit.findOneAndUpdate(
    { _id: id, entityId },
    req.body,
    {
      new: true,
    },
  ).populate("employeeId", "firstName lastName");
  if (!workPermit) throw new ApiError(404, "Work permit not found");

  res.status(200).json(
    new ApiResponse({
      data: workPermit,
      message: "Work permit updated successfully",
    }),
  );
});

module.exports = {
  getWorkPermits,
  createWorkPermit,
  updateWorkPermit,
};

const LeaveRequest = require("../models/LeaveRequest");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

const getLeaveRequests = catchAsync(async (req, res) => {
  const { entityId } = req.params;
  const { page = 1, limit = 10, employeeId, status } = req.query;

  const query = { entityId };
  if (employeeId) query.employeeId = employeeId;
  if (status) query.status = status;

  const leaveRequests = await LeaveRequest.find(query)
    .populate("employeeId", "firstName lastName")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await LeaveRequest.countDocuments(query);

  res.status(200).json(
    new ApiResponse({
      data: {
        leaveRequests,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
      message: "Leave requests retrieved successfully",
    }),
  );
});

const createLeaveRequest = catchAsync(async (req, res) => {
  const { entityId } = req.params;
  const leaveRequestData = { ...req.body, entityId };

  const leaveRequest = await LeaveRequest.create(leaveRequestData);
  await leaveRequest.populate("employeeId", "firstName lastName");

  res.status(201).json(
    new ApiResponse({
      data: leaveRequest,
      message: "Leave request created successfully",
    }),
  );
});

const updateLeaveRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const leaveRequest = await LeaveRequest.findByIdAndUpdate(id, req.body, {
    new: true,
  }).populate("employeeId", "firstName lastName");
  if (!leaveRequest) throw new ApiError(404, "Leave request not found");

  res.status(200).json(
    new ApiResponse({
      data: leaveRequest,
      message: "Leave request updated successfully",
    }),
  );
});

const approveLeaveRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const leaveRequest = await LeaveRequest.findByIdAndUpdate(
    id,
    { status: "approved" },
    { new: true },
  ).populate("employeeId", "firstName lastName");
  if (!leaveRequest) throw new ApiError(404, "Leave request not found");

  res.status(200).json(
    new ApiResponse({
      data: leaveRequest,
      message: "Leave request approved successfully",
    }),
  );
});

const rejectLeaveRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const leaveRequest = await LeaveRequest.findByIdAndUpdate(
    id,
    { status: "rejected" },
    { new: true },
  ).populate("employeeId", "firstName lastName");
  if (!leaveRequest) throw new ApiError(404, "Leave request not found");

  res.status(200).json(
    new ApiResponse({
      data: leaveRequest,
      message: "Leave request rejected successfully",
    }),
  );
});

module.exports = {
  getLeaveRequests,
  createLeaveRequest,
  updateLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
};

const Department = require("../models/Department");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const {
  getSelectedEntityId,
  ensureCanCreateOperationalRecord,
} = require("../utils/entityScope.util");

const getDepartments = catchAsync(async (req, res) => {
  const entityId = getSelectedEntityId(req);
  const departments = await Department.find({ entityId }).sort({ name: 1 });

  res.status(200).json(
    new ApiResponse({
      data: departments,
      message: "Departments retrieved successfully",
    }),
  );
});

const createDepartment = catchAsync(async (req, res) => {
  const entityId = getSelectedEntityId(req);
  ensureCanCreateOperationalRecord(req);
  const departmentData = { ...req.body, entityId };

  const department = await Department.create(departmentData);

  res.status(201).json(
    new ApiResponse({
      data: department,
      message: "Department created successfully",
    }),
  );
});

const updateDepartment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const entityId = getSelectedEntityId(req);
  const department = await Department.findOneAndUpdate(
    { _id: id, entityId },
    req.body,
    {
      new: true,
    },
  );
  if (!department) throw new ApiError(404, "Department not found");

  res.status(200).json(
    new ApiResponse({
      data: department,
      message: "Department updated successfully",
    }),
  );
});

const deleteDepartment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const entityId = getSelectedEntityId(req);
  const department = await Department.findOneAndDelete({ _id: id, entityId });
  if (!department) throw new ApiError(404, "Department not found");

  res.status(200).json(
    new ApiResponse({
      message: "Department deleted successfully",
    }),
  );
});

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};

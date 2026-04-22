const Employee = require("../models/Employee");
const ApiError = require("../utils/ApiError");

const createEmployee = async (payload, userId) => {
  const employee = await Employee.create({
    ...payload,
    entityId: payload.entityId,
    createdBy: userId,
  });

  return employee;
};

const getEmployees = async (entityId, query = {}) => {
  const filter = { entityId };

  if (query.status) {
    filter.status = query.status;
  }

  return Employee.find(filter)
    .populate("departmentId", "name")
    .sort({ createdAt: -1 });
};

const getEmployeeById = async (id, entityId) => {
  const employee = await Employee.findOne({ _id: id, entityId }).populate(
    "departmentId",
    "name",
  );

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  return employee;
};

const updateEmployee = async (id, entityId, payload) => {
  const employee = await Employee.findOneAndUpdate(
    { _id: id, entityId },
    payload,
    {
      new: true,
      runValidators: true,
    },
  ).populate("departmentId", "name");

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  return employee;
};

const deleteEmployee = async (id, entityId) => {
  const employee = await Employee.findOneAndDelete({ _id: id, entityId });

  if (!employee) {
    throw new ApiError(404, "Employee not found");
  }

  return employee;
};

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};

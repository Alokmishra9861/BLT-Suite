const Employee = require("../models/Employee");
const Department = require("../models/Department");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

const buildEmployeePayload = (body) => ({
  firstName: body.firstName?.trim(),
  lastName: body.lastName?.trim(),
  email: body.email?.trim().toLowerCase(),
  phone: body.phone?.trim() || "",
  departmentId: body.departmentId,
  jobTitle: body.jobTitle?.trim(),
  employmentType: body.employmentType,
  salary: Number(body.salary),
  payType: body.payType,
  hireDate: body.hireDate,
  status: body.status,
});

const assertDepartmentExistsForEntity = async (departmentId, entityId) => {
  const department = await Department.findOne({
    _id: departmentId,
    entityId,
  }).lean();
  if (!department) {
    throw new ApiError(400, "Selected department is invalid for this entity");
  }
  return department;
};

const getEmployees = catchAsync(async (req, res) => {
  const { entityId } = req.params;
  const { page = 1, limit = 10, search, departmentId, status } = req.query;

  const query = { entityId };
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (departmentId) query.departmentId = departmentId;
  if (status) query.status = status;

  const employees = await Employee.find(query)
    .populate("departmentId", "name")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Employee.countDocuments(query);

  res.status(200).json(
    new ApiResponse({
      data: {
        employees,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
      message: "Employees retrieved successfully",
    }),
  );
});

const getEmployee = catchAsync(async (req, res) => {
  const { id } = req.params;
  const employee = await Employee.findById(id).populate("departmentId", "name");
  if (!employee) throw new ApiError(404, "Employee not found");

  res.status(200).json(
    new ApiResponse({
      data: employee,
      message: "Employee retrieved successfully",
    }),
  );
});

const createEmployee = catchAsync(async (req, res) => {
  const { entityId } = req.params;
  const employeeData = buildEmployeePayload(req.body);

  if (!employeeData.departmentId) {
    throw new ApiError(400, "Department is required");
  }

  await assertDepartmentExistsForEntity(employeeData.departmentId, entityId);

  employeeData.entityId = entityId;
  employeeData.createdBy = req.user._id;

  const employee = await Employee.create(employeeData);
  await employee.populate("departmentId", "name");

  res.status(201).json(
    new ApiResponse({
      data: employee,
      message: "Employee created successfully",
    }),
  );
});

const updateEmployee = catchAsync(async (req, res) => {
  const { entityId } = req.params;
  const { id } = req.params;
  const employeeData = buildEmployeePayload(req.body);

  if (employeeData.departmentId) {
    await assertDepartmentExistsForEntity(employeeData.departmentId, entityId);
  }

  const employee = await Employee.findByIdAndUpdate(id, employeeData, {
    new: true,
  }).populate("departmentId", "name");
  if (!employee) throw new ApiError(404, "Employee not found");

  res.status(200).json(
    new ApiResponse({
      data: employee,
      message: "Employee updated successfully",
    }),
  );
});

const deleteEmployee = catchAsync(async (req, res) => {
  const { id } = req.params;
  const employee = await Employee.findByIdAndUpdate(
    id,
    { status: "inactive" },
    { new: true },
  );
  if (!employee) throw new ApiError(404, "Employee not found");

  res.status(200).json(
    new ApiResponse({
      message: "Employee deactivated successfully",
    }),
  );
});

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};

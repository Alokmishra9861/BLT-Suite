const employeeService = require("../services/employee.service");
const { auditWrap } = require("../utils/audit.util");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");

const getEntityId = (req) =>
  req.entity?._id ||
  req.params?.entityId ||
  req.user?.entity ||
  req.body.entity ||
  req.body.entityId ||
  req.query.entity ||
  req.query.entityId;

const getEmployees = catchAsync(async (req, res) => {
  const entityId = getEntityId(req);
  const employees = await employeeService.getEmployees(entityId, req.query);

  res.status(200).json(
    new ApiResponse({
      data: employees,
      message: "Employees retrieved successfully",
    }),
  );
});

const getEmployee = catchAsync(async (req, res) => {
  const entityId = getEntityId(req);
  const employee = await employeeService.getEmployeeById(
    req.params.id,
    entityId,
  );

  res.status(200).json(
    new ApiResponse({
      data: employee,
      message: "Employee retrieved successfully",
    }),
  );
});

const createEmployeeHandler = async (req) => {
  const entityId = getEntityId(req);
  return await employeeService.createEmployee(
    { ...req.body, entity: entityId },
    req.user?._id,
  );
};

const updateEmployeeHandler = async (req) => {
  const entityId = getEntityId(req);
  const existing = await employeeService.getEmployeeById(
    req.params.id,
    entityId,
  );
  req.res.locals.beforeData = existing;

  return await employeeService.updateEmployee(
    req.params.id,
    entityId,
    req.body,
    req.user?._id,
  );
};

const deleteEmployeeHandler = async (req) => {
  const entityId = getEntityId(req);
  const existing = await employeeService.getEmployeeById(
    req.params.id,
    entityId,
  );
  req.res.locals.beforeData = existing;

  return await employeeService.deleteEmployee(
    req.params.id,
    entityId,
    req.user?._id,
  );
};

module.exports = {
  getEmployees,
  getEmployee,
  createEmployee: auditWrap(createEmployeeHandler, {
    module: "hr",
    action: "create",
    resource: "Employee",
    successStatus: 201,
    successMessage: "Employee created successfully",
  }),

  updateEmployee: auditWrap(updateEmployeeHandler, {
    module: "hr",
    action: "update",
    resource: "Employee",
    successMessage: "Employee updated successfully",
  }),

  deleteEmployee: auditWrap(deleteEmployeeHandler, {
    module: "hr",
    action: "delete",
    resource: "Employee",
    successMessage: "Employee deleted successfully",
  }),
};

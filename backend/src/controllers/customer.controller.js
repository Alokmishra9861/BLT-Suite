const CustomerService = require("../services/customer.service");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");

const getCustomers = catchAsync(async (req, res) => {
  const { entityId } = req;
  const { page, limit, search, status } = req.query;

  const data = await CustomerService.getCustomers(entityId, {
    page,
    limit,
    search,
    status,
  });

  res.status(200).json(
    new ApiResponse({
      data,
      message: "Customers retrieved successfully",
    }),
  );
});

const createCustomer = catchAsync(async (req, res) => {
  const { entityId } = req;
  const userId = req.user._id || req.user.id;

  const customer = await CustomerService.createCustomer(
    entityId,
    req.body,
    userId,
  );

  res.status(201).json(
    new ApiResponse({
      data: customer,
      message: "Customer created successfully",
    }),
  );
});

const getCustomer = catchAsync(async (req, res) => {
  const { entityId } = req;
  const { customerId } = req.params;

  const customer = await CustomerService.getCustomerById(customerId, entityId);

  res.status(200).json(
    new ApiResponse({
      data: customer,
      message: "Customer retrieved successfully",
    }),
  );
});

const updateCustomer = catchAsync(async (req, res) => {
  const { entityId } = req;
  const { customerId } = req.params;
  const userId = req.user._id || req.user.id;

  const customer = await CustomerService.updateCustomer(
    customerId,
    entityId,
    req.body,
    userId,
  );

  res.status(200).json(
    new ApiResponse({
      data: customer,
      message: "Customer updated successfully",
    }),
  );
});

const deleteCustomer = catchAsync(async (req, res) => {
  const { entityId } = req;
  const { customerId } = req.params;

  await CustomerService.deleteCustomer(customerId, entityId);

  res.status(200).json(
    new ApiResponse({
      data: null,
      message: "Customer deleted successfully",
    }),
  );
});

module.exports = {
  getCustomers,
  createCustomer,
  getCustomer,
  updateCustomer,
  deleteCustomer,
};

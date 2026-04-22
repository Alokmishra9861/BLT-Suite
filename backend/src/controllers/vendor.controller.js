const VendorService = require("../services/vendor.service");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");

const getVendors = catchAsync(async (req, res) => {
  const { entityId } = req;
  const { page, limit, search, status } = req.query;

  const data = await VendorService.getVendors(entityId, {
    page,
    limit,
    search,
    status,
  });

  res.status(200).json(
    new ApiResponse({
      data,
      message: "Vendors retrieved successfully",
    }),
  );
});

const createVendor = catchAsync(async (req, res) => {
  const { entityId } = req;
  const userId = req.user._id || req.user.id;

  const vendor = await VendorService.createVendor(entityId, req.body, userId);

  res.status(201).json(
    new ApiResponse({
      data: vendor,
      message: "Vendor created successfully",
    }),
  );
});

const getVendor = catchAsync(async (req, res) => {
  const { entityId } = req;
  const { vendorId } = req.params;

  const vendor = await VendorService.getVendorById(vendorId, entityId);

  res.status(200).json(
    new ApiResponse({
      data: vendor,
      message: "Vendor retrieved successfully",
    }),
  );
});

const updateVendor = catchAsync(async (req, res) => {
  const { entityId } = req;
  const { vendorId } = req.params;
  const userId = req.user._id || req.user.id;

  const vendor = await VendorService.updateVendor(
    vendorId,
    entityId,
    req.body,
    userId,
  );

  res.status(200).json(
    new ApiResponse({
      data: vendor,
      message: "Vendor updated successfully",
    }),
  );
});

const deleteVendor = catchAsync(async (req, res) => {
  const { entityId } = req;
  const { vendorId } = req.params;

  await VendorService.deleteVendor(vendorId, entityId);

  res.status(200).json(
    new ApiResponse({
      data: null,
      message: "Vendor deleted successfully",
    }),
  );
});

module.exports = {
  getVendors,
  createVendor,
  getVendor,
  updateVendor,
  deleteVendor,
};

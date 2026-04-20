const Benefit = require("../models/Benefit");
const ApiResponse = require("../utils/ApiResponse");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

const getBenefits = catchAsync(async (req, res) => {
  const { entityId } = req.params;
  const { page = 1, limit = 10, employeeId, type } = req.query;

  const query = { entityId };
  if (employeeId) query.employeeId = employeeId;
  if (type) query.type = type;

  const benefits = await Benefit.find(query)
    .populate("employeeId", "firstName lastName")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Benefit.countDocuments(query);

  res.status(200).json(
    new ApiResponse({
      data: {
        benefits,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
      message: "Benefits retrieved successfully",
    }),
  );
});

const createBenefit = catchAsync(async (req, res) => {
  const { entityId } = req.params;
  const benefitData = { ...req.body, entityId };

  const benefit = await Benefit.create(benefitData);
  await benefit.populate("employeeId", "firstName lastName");

  res.status(201).json(
    new ApiResponse({
      data: benefit,
      message: "Benefit created successfully",
    }),
  );
});

const updateBenefit = catchAsync(async (req, res) => {
  const { id } = req.params;
  const benefit = await Benefit.findByIdAndUpdate(id, req.body, {
    new: true,
  }).populate("employeeId", "firstName lastName");
  if (!benefit) throw new ApiError(404, "Benefit not found");

  res.status(200).json(
    new ApiResponse({
      data: benefit,
      message: "Benefit updated successfully",
    }),
  );
});

module.exports = {
  getBenefits,
  createBenefit,
  updateBenefit,
};

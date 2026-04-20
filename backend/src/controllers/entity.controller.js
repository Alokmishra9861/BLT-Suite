const ApiResponse = require("../utils/ApiResponse");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const Entity = require("../models/Entity");

const list = catchAsync(async (req, res) => {
  const entities = await Entity.find().sort({ name: 1 }).lean();
  res.json(new ApiResponse({ data: entities }));
});

const getById = catchAsync(async (req, res) => {
  const entity = await Entity.findById(req.params.id).lean();
  if (!entity) {
    throw new ApiError(404, "Entity not found");
  }
  res.json(new ApiResponse({ data: entity }));
});

const create = catchAsync(async (req, res) => {
  const entity = await Entity.create(req.body);
  res
    .status(201)
    .json(new ApiResponse({ data: entity, message: "Entity created" }));
});

const update = catchAsync(async (req, res) => {
  const entity = await Entity.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).lean();

  if (!entity) {
    throw new ApiError(404, "Entity not found");
  }

  res.json(new ApiResponse({ data: entity, message: "Entity updated" }));
});

module.exports = {
  list,
  getById,
  create,
  update,
};

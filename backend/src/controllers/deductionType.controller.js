const DeductionType = require("../models/DeductionType");

// GET /api/deduction-types?entityId=xxx
exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.entityId) {
      filter.$or = [{ entityId: req.query.entityId }, { entityId: "all" }];
    }
    const types = await DeductionType.find(filter).sort({
      category: 1,
      name: 1,
    });
    res.json({ success: true, data: types });
  } catch (err) {
    next(err);
  }
};

// POST /api/deduction-types
exports.create = async (req, res, next) => {
  try {
    const { name, code, category, calcType, value, status, entityId } =
      req.body;
    if (
      !name ||
      !code ||
      !category ||
      !calcType ||
      value === undefined ||
      !entityId
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }
    const type = await DeductionType.create({
      name,
      code,
      category,
      calcType,
      value,
      status,
      entityId,
    });
    res.status(201).json({ success: true, data: type });
  } catch (err) {
    next(err);
  }
};

// PUT /api/deduction-types/:id
exports.update = async (req, res, next) => {
  try {
    const type = await DeductionType.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!type)
      return res
        .status(404)
        .json({ success: false, message: "Deduction type not found." });
    res.json({ success: true, data: type });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/deduction-types/:id
exports.remove = async (req, res, next) => {
  try {
    const type = await DeductionType.findByIdAndDelete(req.params.id);
    if (!type)
      return res
        .status(404)
        .json({ success: false, message: "Deduction type not found." });
    res.json({ success: true, message: "Deleted." });
  } catch (err) {
    next(err);
  }
};

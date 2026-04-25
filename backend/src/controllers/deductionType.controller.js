const DeductionType = require("../models/DeductionType");
const {
  getSelectedEntityId,
  ensureCanCreateOperationalRecord,
} = require("../utils/entityScope.util");

// GET /api/deduction-types?entityId=xxx
exports.getAll = async (req, res, next) => {
  try {
    const entityId = getSelectedEntityId(req);
    const filter = entityId ? { entityId } : {};
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
    ensureCanCreateOperationalRecord(req);
    const { name, code, category, calcType, value, status } = req.body;
    const entityId = getSelectedEntityId(req);

    if (!name || !code || !category || !calcType || value === undefined) {
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
    const entityId = getSelectedEntityId(req);
    const type = await DeductionType.findOneAndUpdate(
      { _id: req.params.id, entityId },
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
    const entityId = getSelectedEntityId(req);
    const type = await DeductionType.findOneAndDelete({
      _id: req.params.id,
      entityId,
    });
    if (!type)
      return res
        .status(404)
        .json({ success: false, message: "Deduction type not found." });
    res.json({ success: true, message: "Deleted." });
  } catch (err) {
    next(err);
  }
};

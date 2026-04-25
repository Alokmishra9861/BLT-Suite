const EmployeeDeduction = require("../models/EmployeeDeduction");
const {
  getSelectedEntityId,
  ensureCanCreateOperationalRecord,
} = require("../utils/entityScope.util");

// GET /api/employee-deductions?entityId=xxx&employeeId=yyy
exports.getAll = async (req, res, next) => {
  try {
    const entityId = getSelectedEntityId(req);
    const filter = entityId ? { entityId } : {};
    if (req.query.employeeId) filter.employeeId = req.query.employeeId;
    const deductions = await EmployeeDeduction.find(filter)
      .populate("deductionTypeId", "name code category calcType value")
      .populate("employeeId", "first last title entity")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: deductions });
  } catch (err) {
    next(err);
  }
};

// POST /api/employee-deductions
exports.create = async (req, res, next) => {
  try {
    const {
      employeeId,
      deductionTypeId,
      customAmount,
      customPct,
      startDate,
      endDate,
      status,
    } = req.body;
    ensureCanCreateOperationalRecord(req);
    const entityId = getSelectedEntityId(req);
    if (!employeeId || !deductionTypeId || !startDate) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }
    const deduction = await EmployeeDeduction.create({
      employeeId,
      deductionTypeId,
      customAmount,
      customPct,
      startDate,
      endDate,
      status,
      entityId,
    });
    const populated = await deduction.populate([
      { path: "deductionTypeId", select: "name code category calcType value" },
      { path: "employeeId", select: "first last title entity" },
    ]);
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

// PUT /api/employee-deductions/:id
exports.update = async (req, res, next) => {
  try {
    const entityId = getSelectedEntityId(req);
    const deduction = await EmployeeDeduction.findOneAndUpdate(
      { _id: req.params.id, entityId },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("deductionTypeId", "name code category calcType value")
      .populate("employeeId", "first last title entity");
    if (!deduction)
      return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, data: deduction });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/employee-deductions/:id
exports.remove = async (req, res, next) => {
  try {
    const entityId = getSelectedEntityId(req);
    const d = await EmployeeDeduction.findOneAndDelete({
      _id: req.params.id,
      entityId,
    });
    if (!d)
      return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, message: "Deleted." });
  } catch (err) {
    next(err);
  }
};

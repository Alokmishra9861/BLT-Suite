const PayrollRun = require("../models/PayrollRun");
const PayrollLine = require("../models/PayrollLine");
const {
  processPayrollRun,
  postPayrollRun,
} = require("../services/payrollRun.service");

// GET /api/payroll-runs?entityId=xxx&status=draft
exports.getAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.entityId) filter.entityId = req.query.entityId;
    if (req.query.status) filter.status = req.query.status;
    const runs = await PayrollRun.find(filter).sort({ periodStart: -1 });
    res.json({ success: true, data: runs });
  } catch (err) {
    next(err);
  }
};

// POST /api/payroll-runs
exports.create = async (req, res, next) => {
  try {
    const { entityId, periodType, periodStart, periodEnd, payDate, notes } =
      req.body;
    if (!entityId || !periodType || !periodStart || !periodEnd || !payDate) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }
    const run = await PayrollRun.create({
      entityId,
      periodType,
      periodStart,
      periodEnd,
      payDate,
      notes,
    });
    res.status(201).json({ success: true, data: run });
  } catch (err) {
    next(err);
  }
};

// GET /api/payroll-runs/:id
exports.getOne = async (req, res, next) => {
  try {
    const run = await PayrollRun.findById(req.params.id);
    if (!run)
      return res.status(404).json({ success: false, message: "Not found." });
    res.json({ success: true, data: run });
  } catch (err) {
    next(err);
  }
};

// PUT /api/payroll-runs/:id  (only draft runs)
exports.update = async (req, res, next) => {
  try {
    const run = await PayrollRun.findById(req.params.id);
    if (!run)
      return res.status(404).json({ success: false, message: "Not found." });
    if (run.status !== "draft") {
      return res
        .status(400)
        .json({ success: false, message: "Only draft runs can be edited." });
    }
    Object.assign(run, req.body);
    await run.save();
    res.json({ success: true, data: run });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/payroll-runs/:id  (only draft runs)
exports.remove = async (req, res, next) => {
  try {
    const run = await PayrollRun.findById(req.params.id);
    if (!run)
      return res.status(404).json({ success: false, message: "Not found." });
    if (run.status !== "draft") {
      return res
        .status(400)
        .json({ success: false, message: "Only draft runs can be deleted." });
    }
    await PayrollLine.deleteMany({ payrollRunId: run._id });
    await run.deleteOne();
    res.json({ success: true, message: "Deleted." });
  } catch (err) {
    next(err);
  }
};

// POST /api/payroll-runs/:id/process
exports.process = async (req, res, next) => {
  try {
    const run = await processPayrollRun(req.params.id);
    res.json({
      success: true,
      data: run,
      message: "Payroll run processed successfully.",
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/payroll-runs/:id/post
exports.post = async (req, res, next) => {
  try {
    const run = await postPayrollRun(req.params.id);
    res.json({
      success: true,
      data: run,
      message: "Payroll run posted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/payroll-runs/:id/lines
exports.getLines = async (req, res, next) => {
  try {
    const lines = await PayrollLine.find({ payrollRunId: req.params.id })
      .populate("employeeId", "first last title dept paytype")
      .sort({ employeeName: 1 });
    res.json({ success: true, data: lines });
  } catch (err) {
    next(err);
  }
};

// GET /api/payroll-runs/:id/summary
exports.getSummary = async (req, res, next) => {
  try {
    const run = await PayrollRun.findById(req.params.id);
    if (!run)
      return res.status(404).json({ success: false, message: "Not found." });
    const lines = await PayrollLine.find({ payrollRunId: req.params.id });
    res.json({
      success: true,
      data: {
        run,
        summary: {
          employeeCount: lines.length,
          totalGrossPay: run.totalGrossPay,
          totalDeductions: run.totalDeductions,
          totalNetPay: run.totalNetPay,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

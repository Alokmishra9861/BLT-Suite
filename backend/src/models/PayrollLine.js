const mongoose = require("mongoose");

const deductionLineSchema = new mongoose.Schema(
  {
    deductionTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeductionType",
    },
    name: { type: String },
    amount: { type: Number },
  },
  { _id: false },
);

const payrollLineSchema = new mongoose.Schema(
  {
    payrollRunId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "PayrollRun",
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Employee",
    },
    employeeName: { type: String, required: true },
    payType: { type: String, enum: ["salary", "hourly"], required: true },
    baseSalary: { type: Number, default: 0 }, // annual salary
    hourlyRate: { type: Number, default: 0 },
    hoursWorked: { type: Number, default: 0 },
    grossPay: { type: Number, required: true },
    deductions: [deductionLineSchema],
    totalDeductions: { type: Number, default: 0 },
    netPay: { type: Number, required: true },
    entityId: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PayrollLine", payrollLineSchema);

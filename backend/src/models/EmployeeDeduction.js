const mongoose = require("mongoose");

const employeeDeductionSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Employee",
    },
    deductionTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "DeductionType",
    },
    customAmount: { type: Number, default: null },
    customPct: { type: Number, default: null },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    entityId: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("EmployeeDeduction", employeeDeductionSchema);

const mongoose = require("mongoose");

const payrollRunSchema = new mongoose.Schema(
  {
    entityId: { type: String, required: true },
    periodType: {
      type: String,
      enum: ["weekly", "biweekly", "semimonthly", "monthly"],
      required: true,
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    payDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["draft", "processed", "posted"],
      default: "draft",
    },
    totalGrossPay: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 },
    totalNetPay: { type: Number, default: 0 },
    notes: { type: String, default: "" },
    processedAt: { type: Date, default: null },
    postedAt: { type: Date, default: null },
    createdBy: { type: String, default: "system" },
    jeRef: { type: String, default: null }, // Journal entry reference after posting
  },
  { timestamps: true },
);

module.exports = mongoose.model("PayrollRun", payrollRunSchema);

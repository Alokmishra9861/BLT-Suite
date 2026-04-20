const mongoose = require("mongoose");

const accountingPeriodSchema = new mongoose.Schema(
  {
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entity",
      required: true,
    },
    // Format: YYYY-MM  e.g. "2026-04"
    period: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true, // e.g. "April 2026"
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    // open | closed | locked
    status: {
      type: String,
      enum: ["open", "closed", "locked"],
      default: "open",
    },
    closedAt: { type: Date, default: null },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

accountingPeriodSchema.index({ entityId: 1, period: 1 }, { unique: true });

module.exports = mongoose.model("AccountingPeriod", accountingPeriodSchema);

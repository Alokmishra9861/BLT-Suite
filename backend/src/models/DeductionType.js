const mongoose = require("mongoose");

const deductionTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    category: {
      type: String,
      enum: ["pension", "insurance", "tax", "loan", "other"],
      required: true,
    },
    calcType: { type: String, enum: ["fixed", "percentage"], required: true },
    value: { type: Number, required: true, min: 0 }, // $ amount OR percent
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    entityId: { type: String, required: true }, // entity name or 'all'
  },
  { timestamps: true },
);

module.exports = mongoose.model("DeductionType", deductionTypeSchema);

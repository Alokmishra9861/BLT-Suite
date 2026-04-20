const mongoose = require("mongoose");

const benefitSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    type: {
      type: String,
      enum: ["insurance", "pension"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entity",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Benefit", benefitSchema);

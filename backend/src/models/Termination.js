const mongoose = require("mongoose");

const terminationSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    terminationDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    severanceAmount: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "processed"],
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

module.exports = mongoose.model("Termination", terminationSchema);

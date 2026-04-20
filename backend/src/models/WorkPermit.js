const mongoose = require("mongoose");

const workPermitSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    permitNumber: {
      type: String,
      required: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired"],
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

module.exports = mongoose.model("WorkPermit", workPermitSchema);

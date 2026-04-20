const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
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

module.exports = mongoose.model("Department", departmentSchema);

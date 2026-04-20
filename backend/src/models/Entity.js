const mongoose = require("mongoose");

const entitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    country: { type: String, default: "" },
    currency: { type: String, default: "USD" },
    timezone: { type: String, default: "UTC" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Entity", entitySchema);

const mongoose = require("mongoose");

const entitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    country: {
      type: String,
      default: "Cayman Islands",
      trim: true,
    },

    currency: {
      type: String,
      default: "KYD",
      trim: true,
    },

    timezone: {
      type: String,
      default: "America/Cayman",
      trim: true,
    },

    entityType: {
      type: String,
      enum: ["standalone", "parent", "subsidiary"],
      default: "standalone",
    },

    parentEntity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entity",
      default: null,
    },

    isHoldingEntity: {
      type: Boolean,
      default: false,
    },

    allowDirectTransactions: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

entitySchema.index({ code: 1 }, { unique: true });
entitySchema.index({ parentEntity: 1 });
entitySchema.index({ entityType: 1 });

module.exports = mongoose.model("Entity", entitySchema);

const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    entity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entity",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    userName: String,

    module: {
      type: String,
      required: true,
      enum: [
        "accounting",
        "banking",
        "payables",
        "receivables",
        "hr",
        "payroll",
        "auth",
        "system",
      ],
    },

    action: {
      type: String,
      required: true,
      enum: ["create", "update", "delete", "view", "login"],
    },

    resource: String, // e.g. "Invoice", "Employee"

    resourceId: mongoose.Schema.Types.ObjectId,

    description: String,

    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,

    ip: String,
    userAgent: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("AuditLog", AuditLogSchema);

const mongoose = require("mongoose");

const reconciliationItemSchema = new mongoose.Schema(
  {
    bankTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankTransaction",
      default: null,
    },
    journal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      default: null,
    },
    itemDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["cleared", "uncleared", "adjustment"],
      default: "cleared",
    },
    amount: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: true },
);

const bankReconciliationSchema = new mongoose.Schema(
  {
    entity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entity",
      required: true,
      index: true,
    },
    bankAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankAccount",
      required: true,
      index: true,
    },
    statementDate: {
      type: Date,
      required: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    openingBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    closingBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    ledgerBalanceAtEnd: {
      type: Number,
      default: 0,
    },
    differenceAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["draft", "in_progress", "completed", "locked"],
      default: "draft",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    items: [reconciliationItemSchema],
    completedAt: {
      type: Date,
      default: null,
    },
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

bankReconciliationSchema.index({
  entity: 1,
  bankAccount: 1,
  statementDate: -1,
});

module.exports = mongoose.model("BankReconciliation", bankReconciliationSchema);

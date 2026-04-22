const mongoose = require("mongoose");

const bankTransactionSchema = new mongoose.Schema(
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
    journal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      default: null,
    },
    transactionDate: {
      type: Date,
      required: true,
      index: true,
    },
    valueDate: {
      type: Date,
      default: null,
    },
    referenceNo: {
      type: String,
      trim: true,
      default: "",
    },
    externalReference: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    memo: {
      type: String,
      trim: true,
      default: "",
    },
    direction: {
      type: String,
      enum: ["inflow", "outflow", "transfer"],
      required: true,
    },
    source: {
      type: String,
      enum: ["manual", "statement_import", "system"],
      default: "manual",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "posted", "voided"],
      default: "posted",
    },
    matchStatus: {
      type: String,
      enum: ["unmatched", "partially_matched", "matched", "reconciled"],
      default: "unmatched",
    },
    isReconciled: {
      type: Boolean,
      default: false,
    },
    reconciledAt: {
      type: Date,
      default: null,
    },
    reconciledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    runningBalanceSnapshot: {
      type: Number,
      default: null,
    },
    importedBatchId: {
      type: String,
      trim: true,
      default: "",
    },
    rawImportRow: {
      type: mongoose.Schema.Types.Mixed,
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

bankTransactionSchema.index({ entity: 1, bankAccount: 1, transactionDate: -1 });

module.exports = mongoose.model("BankTransaction", bankTransactionSchema);

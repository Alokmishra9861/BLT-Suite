const mongoose = require("mongoose");

const bankAccountSchema = new mongoose.Schema(
  {
    entity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entity",
      required: true,
      index: true,
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumberMasked: {
      type: String,
      trim: true,
      default: "",
    },
    accountType: {
      type: String,
      enum: ["checking", "savings", "credit_card", "petty_cash", "other"],
      default: "checking",
    },
    currency: {
      type: String,
      default: "CI$",
      trim: true,
    },
    openingBalance: {
      type: Number,
      default: 0,
    },
    openingBalanceDate: {
      type: Date,
    },
    statementBalance: {
      type: Number,
      default: 0,
    },
    lastStatementDate: {
      type: Date,
    },
    branchName: {
      type: String,
      trim: true,
      default: "",
    },
    swiftCode: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
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

bankAccountSchema.index({ entity: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("BankAccount", bankAccountSchema);

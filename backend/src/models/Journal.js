const mongoose = require("mongoose");

// ── Journal Line (embedded) ──────────────────────────────────────────────────
const journalLineSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    accountCode: { type: String, required: true },
    accountName: { type: String, required: true },
    description: { type: String, default: "" },
    debit: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
      get: (v) => (v ? parseFloat(v.toString()) : 0),
    },
    credit: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
      get: (v) => (v ? parseFloat(v.toString()) : 0),
    },
  },
  { _id: true, toJSON: { getters: true } },
);

// ── Journal Entry ────────────────────────────────────────────────────────────
const journalSchema = new mongoose.Schema(
  {
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Entity",
      required: true,
    },
    journalNumber: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    reference: {
      type: String,
      default: "",
      trim: true,
    },
    // draft | pending | posted | voided | reversed
    status: {
      type: String,
      enum: ["draft", "pending", "posted", "voided", "reversed"],
      default: "draft",
    },
    // manual | payroll | ar | ap | banking | system
    source: {
      type: String,
      enum: ["manual", "payroll", "ar", "ap", "banking", "system"],
      default: "manual",
    },
    lines: {
      type: [journalLineSchema],
      default: [],
    },
    // If this entry is a reversal, link to the original
    reversalOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      default: null,
    },
    // If this entry has been reversed, link to the reversal
    reversedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Journal",
      default: null,
    },
    postedAt: { type: Date, default: null },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    voidedAt: { type: Date, default: null },
    voidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // Period tag: YYYY-MM
    period: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
  },
);

journalSchema.index({ entityId: 1, period: 1 });
journalSchema.index({ entityId: 1, status: 1 });
journalSchema.index({ entityId: 1, journalNumber: 1 }, { unique: true });

// ── Virtual: total debits ────────────────────────────────────────────────────
journalSchema.virtual("totalDebits").get(function () {
  return this.lines.reduce((sum, l) => sum + parseFloat(l.debit || 0), 0);
});

journalSchema.virtual("totalCredits").get(function () {
  return this.lines.reduce((sum, l) => sum + parseFloat(l.credit || 0), 0);
});

journalSchema.virtual("isBalanced").get(function () {
  const d = this.totalDebits;
  const c = this.totalCredits;
  return Math.abs(d - c) < 0.005; // 0.5 cent tolerance
});

module.exports = mongoose.model("Journal", journalSchema);

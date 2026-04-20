const mongoose = require("mongoose");
const Account = require("../models/Account");
const Journal = require("../models/Journal");
const AccountingPeriod = require("../models/AccountingPeriod");
const ApiError = require("../utils/ApiError");

// ── ObjectId helper (works with Mongoose 6, 7, and 8) ────────────────────────
function toObjectId(id) {
  if (id instanceof mongoose.Types.ObjectId) return id;
  return new mongoose.Types.ObjectId(id.toString());
}

// ── Period helper ─────────────────────────────────────────────────────────────
function toPeriod(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

// ── Auto-increment journal number ─────────────────────────────────────────────
async function getNextJournalNumber(entityId) {
  const last = await Journal.findOne({ entityId })
    .sort({ createdAt: -1 })
    .select("journalNumber")
    .lean();
  if (!last) return "JE-0001";
  const match = last.journalNumber.match(/(\d+)$/);
  const num = match ? parseInt(match[1], 10) : 0;
  return `JE-${String(num + 1).padStart(4, "0")}`;
}

// ════════════════════════════════════════════════════════════════════════════
// CHART OF ACCOUNTS
// ════════════════════════════════════════════════════════════════════════════

async function listAccounts(entityId, filters = {}) {
  const query = { entityId };
  if (filters.type) query.type = filters.type;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;
  if (filters.search) {
    query.$or = [
      { code: { $regex: filters.search, $options: "i" } },
      { name: { $regex: filters.search, $options: "i" } },
    ];
  }
  return Account.find(query).sort({ code: 1 }).lean();
}

async function createAccount(entityId, data, userId) {
  const exists = await Account.findOne({ entityId, code: data.code });
  if (exists)
    throw new ApiError(
      400,
      `Account code "${data.code}" already exists in this entity`,
    );

  return Account.create({
    entityId,
    code: data.code,
    name: data.name,
    type: data.type,
    subType: data.subType || "",
    description: data.description || "",
    isActive: true,
    createdBy: userId,
  });
}

async function updateAccount(entityId, accountId, data) {
  const account = await Account.findOne({ _id: accountId, entityId });
  if (!account) throw new ApiError(404, "Account not found");

  if (data.code && data.code !== account.code) {
    const dup = await Account.findOne({ entityId, code: data.code });
    if (dup)
      throw new ApiError(400, `Account code "${data.code}" already exists`);
  }

  if (data.code !== undefined) account.code = data.code;
  if (data.name !== undefined) account.name = data.name;
  if (data.type !== undefined) account.type = data.type;
  if (data.subType !== undefined) account.subType = data.subType;
  if (data.description !== undefined) account.description = data.description;
  if (data.isActive !== undefined) account.isActive = data.isActive;

  await account.save();
  return account.toObject();
}

async function deleteAccount(entityId, accountId) {
  const used = await Journal.findOne({
    entityId,
    "lines.accountId": accountId,
    status: "posted",
  }).lean();
  if (used)
    throw new ApiError(
      400,
      "Cannot delete an account with posted entries. Deactivate it instead.",
    );
  await Account.deleteOne({ _id: accountId, entityId });
  return true;
}

// ════════════════════════════════════════════════════════════════════════════
// ACCOUNT BALANCE (derived from posted journal lines)
// ════════════════════════════════════════════════════════════════════════════

async function getAccountBalance(entityId, accountId, options = {}) {
  const account = await Account.findOne({ _id: accountId, entityId }).lean();
  if (!account) throw new ApiError(404, "Account not found");

  const matchStage = { entityId: toObjectId(entityId), status: "posted" };
  if (options.periodFrom || options.periodTo) {
    matchStage.period = {};
    if (options.periodFrom) matchStage.period.$gte = options.periodFrom;
    if (options.periodTo) matchStage.period.$lte = options.periodTo;
  }

  const result = await Journal.aggregate([
    { $match: matchStage },
    { $unwind: "$lines" },
    { $match: { "lines.accountId": toObjectId(accountId) } },
    {
      $group: {
        _id: null,
        totalDebits: { $sum: { $toDouble: "$lines.debit" } },
        totalCredits: { $sum: { $toDouble: "$lines.credit" } },
      },
    },
  ]);

  const { totalDebits = 0, totalCredits = 0 } = result[0] || {};
  const debitNormal = ["Asset", "Expense"].includes(account.type);
  const balance = debitNormal
    ? totalDebits - totalCredits
    : totalCredits - totalDebits;

  return {
    account,
    totalDebits,
    totalCredits,
    balance,
    normalBalance: debitNormal ? "debit" : "credit",
  };
}

// ════════════════════════════════════════════════════════════════════════════
// ACCOUNT LEDGER
// ════════════════════════════════════════════════════════════════════════════

async function getAccountLedger(entityId, accountId, options = {}) {
  const account = await Account.findOne({ _id: accountId, entityId }).lean();
  if (!account) throw new ApiError(404, "Account not found");

  const matchStage = { entityId: toObjectId(entityId), status: "posted" };
  if (options.periodFrom || options.periodTo) {
    matchStage.period = {};
    if (options.periodFrom) matchStage.period.$gte = options.periodFrom;
    if (options.periodTo) matchStage.period.$lte = options.periodTo;
  }

  const journals = await Journal.find(matchStage)
    .sort({ date: 1, journalNumber: 1 })
    .lean({ getters: true });

  const debitNormal = ["Asset", "Expense"].includes(account.type);
  let runningBalance = 0;
  const lines = [];

  for (const j of journals) {
    for (const l of j.lines) {
      if (l.accountId.toString() !== accountId.toString()) continue;
      const debit = parseFloat(l.debit) || 0;
      const credit = parseFloat(l.credit) || 0;
      runningBalance += debitNormal ? debit - credit : credit - debit;
      lines.push({
        journalId: j._id,
        journalNumber: j.journalNumber,
        date: j.date,
        description: l.description || j.description,
        reference: j.reference,
        debit,
        credit,
        runningBalance,
      });
    }
  }

  return { account, lines };
}

// ════════════════════════════════════════════════════════════════════════════
// JOURNAL ENTRIES
// ════════════════════════════════════════════════════════════════════════════

async function listJournals(entityId, filters = {}) {
  const query = { entityId };
  if (filters.status) query.status = filters.status;
  if (filters.period) query.period = filters.period;
  if (filters.source) query.source = filters.source;
  if (filters.search) {
    query.$or = [
      { journalNumber: { $regex: filters.search, $options: "i" } },
      { description: { $regex: filters.search, $options: "i" } },
      { reference: { $regex: filters.search, $options: "i" } },
    ];
  }

  const page = Math.max(1, parseInt(filters.page) || 1);
  const limit = Math.min(200, parseInt(filters.limit) || 50);
  const skip = (page - 1) * limit;

  const [journals, total] = await Promise.all([
    Journal.find(query)
      .sort({ date: -1, journalNumber: -1 })
      .skip(skip)
      .limit(limit)
      .lean({ getters: true }),
    Journal.countDocuments(query),
  ]);

  const result = journals.map((j) => {
    const totalDebits = j.lines.reduce(
      (s, l) => s + (parseFloat(l.debit) || 0),
      0,
    );
    const totalCredits = j.lines.reduce(
      (s, l) => s + (parseFloat(l.credit) || 0),
      0,
    );
    return { ...j, totalDebits, totalCredits, lineCount: j.lines.length };
  });

  return {
    journals: result,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

async function getJournal(entityId, journalId) {
  const journal = await Journal.findOne({ _id: journalId, entityId }).lean({
    getters: true,
  });
  if (!journal) throw new ApiError(404, "Journal not found");
  const totalDebits = journal.lines.reduce(
    (s, l) => s + (parseFloat(l.debit) || 0),
    0,
  );
  const totalCredits = journal.lines.reduce(
    (s, l) => s + (parseFloat(l.credit) || 0),
    0,
  );
  return {
    ...journal,
    totalDebits,
    totalCredits,
    isBalanced: Math.abs(totalDebits - totalCredits) < 0.005,
  };
}

async function createJournal(entityId, data, userId) {
  if (!data.lines || data.lines.length < 2) {
    throw new ApiError(400, "A journal entry must have at least 2 lines");
  }

  // Validate line values
  for (const line of data.lines) {
    const d = parseFloat(line.debit) || 0;
    const c = parseFloat(line.credit) || 0;
    if (d < 0 || c < 0)
      throw new ApiError(400, "Debit and credit amounts cannot be negative");
    if (d > 0 && c > 0)
      throw new ApiError(
        400,
        "A line cannot have both debit and credit values",
      );
    if (d === 0 && c === 0)
      throw new ApiError(400, "Each line must have a debit or credit amount");
  }

  // Validate all accounts exist in this entity
  const accountIds = [
    ...new Set(data.lines.map((l) => l.accountId.toString())),
  ];
  const accounts = await Account.find({
    _id: { $in: accountIds },
    entityId,
    isActive: true,
  }).lean();

  if (accounts.length !== accountIds.length) {
    throw new ApiError(
      400,
      "One or more accounts not found or inactive in this entity",
    );
  }

  const accountMap = Object.fromEntries(
    accounts.map((a) => [a._id.toString(), a]),
  );

  const enrichedLines = data.lines.map((l) => {
    const acct = accountMap[l.accountId.toString()];
    return {
      accountId: l.accountId,
      accountCode: acct.code,
      accountName: acct.name,
      description: l.description || "",
      debit: parseFloat(l.debit) || 0,
      credit: parseFloat(l.credit) || 0,
    };
  });

  const journalNumber = await getNextJournalNumber(entityId);

  const journal = await Journal.create({
    entityId,
    journalNumber,
    date: new Date(data.date),
    description: data.description,
    reference: data.reference || "",
    source: data.source || "manual",
    status: "draft",
    lines: enrichedLines,
    period: toPeriod(data.date),
    createdBy: userId,
  });

  return journal.toObject();
}

async function updateJournal(entityId, journalId, data) {
  const journal = await Journal.findOne({ _id: journalId, entityId });
  if (!journal) throw new ApiError(404, "Journal not found");
  if (journal.status === "posted")
    throw new ApiError(
      400,
      "Posted journals cannot be edited. Use reversal instead.",
    );
  if (journal.status === "voided")
    throw new ApiError(400, "Voided journals cannot be edited.");
  if (journal.status === "reversed")
    throw new ApiError(400, "Reversed journals cannot be edited.");

  if (data.description !== undefined) journal.description = data.description;
  if (data.reference !== undefined) journal.reference = data.reference;
  if (data.date) {
    journal.date = new Date(data.date);
    journal.period = toPeriod(data.date);
  }

  if (data.lines) {
    if (data.lines.length < 2)
      throw new ApiError(400, "Journal must have at least 2 lines");

    const accountIds = [
      ...new Set(data.lines.map((l) => l.accountId.toString())),
    ];
    const accounts = await Account.find({
      _id: { $in: accountIds },
      entityId,
      isActive: true,
    }).lean();
    if (accounts.length !== accountIds.length)
      throw new ApiError(400, "One or more accounts not found or inactive");
    const accountMap = Object.fromEntries(
      accounts.map((a) => [a._id.toString(), a]),
    );

    journal.lines = data.lines.map((l) => {
      const acct = accountMap[l.accountId.toString()];
      return {
        accountId: l.accountId,
        accountCode: acct.code,
        accountName: acct.name,
        description: l.description || "",
        debit: parseFloat(l.debit) || 0,
        credit: parseFloat(l.credit) || 0,
      };
    });
  }

  await journal.save();
  return journal.toObject();
}

async function postJournal(entityId, journalId, userId) {
  const journal = await Journal.findOne({ _id: journalId, entityId });
  if (!journal) throw new ApiError(404, "Journal not found");
  if (journal.status === "posted")
    throw new ApiError(400, "Journal is already posted");
  if (journal.status === "voided")
    throw new ApiError(400, "Cannot post a voided journal");

  const totalDebits = journal.lines.reduce(
    (s, l) => s + (parseFloat(l.debit) || 0),
    0,
  );
  const totalCredits = journal.lines.reduce(
    (s, l) => s + (parseFloat(l.credit) || 0),
    0,
  );

  if (Math.abs(totalDebits - totalCredits) >= 0.005) {
    throw new ApiError(
      400,
      `Journal does not balance. Debits: ${totalDebits.toFixed(2)}, Credits: ${totalCredits.toFixed(2)}`,
    );
  }
  if (journal.lines.length < 2)
    throw new ApiError(400, "Journal must have at least 2 lines");

  // Check period is open
  const period = await AccountingPeriod.findOne({
    entityId,
    period: journal.period,
  });
  if (period?.status === "locked")
    throw new ApiError(400, `Period ${journal.period} is locked`);
  if (period?.status === "closed")
    throw new ApiError(400, `Period ${journal.period} is closed`);

  journal.status = "posted";
  journal.postedAt = new Date();
  journal.postedBy = userId;
  await journal.save();
  return journal.toObject();
}

async function reverseJournal(entityId, journalId, userId, reverseData = {}) {
  const original = await Journal.findOne({ _id: journalId, entityId });
  if (!original) throw new ApiError(404, "Journal not found");
  if (original.status !== "posted")
    throw new ApiError(400, "Only posted journals can be reversed");
  if (original.reversedBy)
    throw new ApiError(400, "This journal has already been reversed");

  const reverseDate = reverseData.date
    ? new Date(reverseData.date)
    : new Date();
  const reversalNumber = await getNextJournalNumber(entityId);

  // Swap debit ↔ credit on every line
  const reversalLines = original.lines.map((l) => ({
    accountId: l.accountId,
    accountCode: l.accountCode,
    accountName: l.accountName,
    description: `Reversal: ${l.description || original.description}`,
    debit: parseFloat(l.credit) || 0,
    credit: parseFloat(l.debit) || 0,
  }));

  const reversal = await Journal.create({
    entityId,
    journalNumber: reversalNumber,
    date: reverseDate,
    description:
      reverseData.description ||
      `Reversal of ${original.journalNumber}: ${original.description}`,
    reference: original.journalNumber,
    source: "manual",
    status: "posted",
    lines: reversalLines,
    period: toPeriod(reverseDate),
    reversalOf: original._id,
    postedAt: new Date(),
    postedBy: userId,
    createdBy: userId,
  });

  original.status = "reversed";
  original.reversedBy = reversal._id;
  await original.save();

  return reversal.toObject();
}

async function voidJournal(entityId, journalId, userId) {
  const journal = await Journal.findOne({ _id: journalId, entityId });
  if (!journal) throw new ApiError(404, "Journal not found");
  if (journal.status === "posted")
    throw new ApiError(400, "Use reversal to undo a posted journal");
  if (journal.status === "voided") throw new ApiError(400, "Already voided");

  journal.status = "voided";
  journal.voidedAt = new Date();
  journal.voidedBy = userId;
  await journal.save();
  return journal.toObject();
}

// ════════════════════════════════════════════════════════════════════════════
// ACCOUNTING PERIODS
// ════════════════════════════════════════════════════════════════════════════

async function listPeriods(entityId) {
  return AccountingPeriod.find({ entityId }).sort({ period: -1 }).lean();
}

async function createPeriod(entityId, data) {
  const exists = await AccountingPeriod.findOne({
    entityId,
    period: data.period,
  });
  if (exists) throw new ApiError(400, `Period ${data.period} already exists`);
  return AccountingPeriod.create({
    entityId,
    period: data.period,
    name: data.name,
    startDate: new Date(data.startDate),
    endDate: new Date(data.endDate),
    status: "open",
  });
}

async function closePeriod(entityId, period, userId) {
  const p = await AccountingPeriod.findOne({ entityId, period });
  if (!p) throw new ApiError(404, "Period not found");
  if (p.status !== "open")
    throw new ApiError(400, `Period is already ${p.status}`);
  p.status = "closed";
  p.closedAt = new Date();
  p.closedBy = userId;
  await p.save();
  return p.toObject();
}

// ════════════════════════════════════════════════════════════════════════════
// TRIAL BALANCE
// ════════════════════════════════════════════════════════════════════════════

async function getTrialBalance(entityId, periodFrom, periodTo) {
  const accounts = await Account.find({ entityId, isActive: true })
    .sort({ code: 1 })
    .lean();

  const matchStage = { entityId: toObjectId(entityId), status: "posted" };
  if (periodFrom || periodTo) {
    matchStage.period = {};
    if (periodFrom) matchStage.period.$gte = periodFrom;
    if (periodTo) matchStage.period.$lte = periodTo;
  }

  const aggregated = await Journal.aggregate([
    { $match: matchStage },
    { $unwind: "$lines" },
    {
      $group: {
        _id: "$lines.accountId",
        totalDebits: { $sum: { $toDouble: "$lines.debit" } },
        totalCredits: { $sum: { $toDouble: "$lines.credit" } },
      },
    },
  ]);

  const balanceMap = Object.fromEntries(
    aggregated.map((r) => [r._id.toString(), r]),
  );

  const rows = accounts.map((a) => {
    const b = balanceMap[a._id.toString()] || {
      totalDebits: 0,
      totalCredits: 0,
    };
    const debitNormal = ["Asset", "Expense"].includes(a.type);
    const balance = debitNormal
      ? b.totalDebits - b.totalCredits
      : b.totalCredits - b.totalDebits;
    return {
      accountId: a._id,
      code: a.code,
      name: a.name,
      type: a.type,
      subType: a.subType,
      totalDebits: b.totalDebits,
      totalCredits: b.totalCredits,
      balance,
    };
  });

  const sumDebits = rows.reduce((s, r) => s + r.totalDebits, 0);
  const sumCredits = rows.reduce((s, r) => s + r.totalCredits, 0);

  return {
    rows,
    sumDebits,
    sumCredits,
    balanced: Math.abs(sumDebits - sumCredits) < 0.005,
  };
}

module.exports = {
  // COA
  listAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  // Balances
  getAccountBalance,
  getAccountLedger,
  // Journals
  listJournals,
  getJournal,
  createJournal,
  updateJournal,
  postJournal,
  reverseJournal,
  voidJournal,
  // Periods
  listPeriods,
  createPeriod,
  closePeriod,
  // Reports
  getTrialBalance,
  // Helpers (exported for payroll/AR/AP modules to reuse)
  toPeriod,
  getNextJournalNumber,
};

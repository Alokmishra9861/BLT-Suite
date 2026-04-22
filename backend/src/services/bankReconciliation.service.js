const BankReconciliation = require("../models/BankReconciliation");
const BankAccount = require("../models/BankAccount");
const BankTransaction = require("../models/BankTransaction");
const Journal = require("../models/Journal");

const calculateLedgerBalanceAtDate = async (glAccountId, endDate) => {
  const journals = await Journal.find({
    date: { $lte: endDate },
    status: { $in: ["posted", "Posted", "POSTED"] },
    lines: { $elemMatch: { account: glAccountId } },
  }).lean();

  let balance = 0;

  for (const journal of journals) {
    for (const line of journal.lines || []) {
      if (String(line.account) === String(glAccountId)) {
        balance += Number(line.debit || 0) - Number(line.credit || 0);
      }
    }
  }

  return Number(balance.toFixed(2));
};

const createReconciliation = async (payload, userId) => {
  const bankAccount = await BankAccount.findById(payload.bankAccount);
  if (!bankAccount) {
    throw new Error("Bank account not found");
  }

  const ledgerBalanceAtEnd = await calculateLedgerBalanceAtDate(
    bankAccount.account,
    payload.periodEnd,
  );

  const differenceAmount = Number(
    (Number(payload.closingBalance) - ledgerBalanceAtEnd).toFixed(2),
  );

  const created = await BankReconciliation.create({
    ...payload,
    ledgerBalanceAtEnd,
    differenceAmount,
    createdBy: userId || null,
    updatedBy: userId || null,
  });

  return created.populate("bankAccount", "name bankName currency");
};

const getReconciliations = async (entityId, bankAccountId) => {
  const filter = { entity: entityId };
  if (bankAccountId) filter.bankAccount = bankAccountId;

  return BankReconciliation.find(filter)
    .populate("bankAccount", "name bankName currency")
    .sort({ statementDate: -1, createdAt: -1 });
};

const getReconciliationById = async (id, entityId) => {
  const rec = await BankReconciliation.findOne({
    _id: id,
    entity: entityId,
  })
    .populate("bankAccount", "name bankName currency")
    .populate("items.bankTransaction")
    .populate("items.journal");

  if (!rec) {
    throw new Error("Bank reconciliation not found");
  }

  return rec;
};

const addReconciliationItem = async (id, entityId, item, userId) => {
  const rec = await BankReconciliation.findOne({
    _id: id,
    entity: entityId,
  });

  if (!rec) {
    throw new Error("Bank reconciliation not found");
  }

  if (["completed", "locked"].includes(rec.status)) {
    throw new Error("Completed or locked reconciliation cannot be edited");
  }

  rec.items.push(item);
  rec.updatedBy = userId || null;
  await rec.save();

  return rec;
};

const completeReconciliation = async (id, entityId, userId) => {
  const rec = await BankReconciliation.findOne({
    _id: id,
    entity: entityId,
  });

  if (!rec) {
    throw new Error("Bank reconciliation not found");
  }

  rec.status = "completed";
  rec.completedAt = new Date();
  rec.completedBy = userId || null;
  rec.updatedBy = userId || null;

  for (const item of rec.items) {
    if (item.bankTransaction) {
      await BankTransaction.findByIdAndUpdate(item.bankTransaction, {
        isReconciled: true,
        matchStatus: "reconciled",
        reconciledAt: new Date(),
        reconciledBy: userId || null,
      });
    }
  }

  await rec.save();
  return rec;
};

module.exports = {
  createReconciliation,
  getReconciliations,
  getReconciliationById,
  addReconciliationItem,
  completeReconciliation,
};

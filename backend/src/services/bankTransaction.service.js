const BankTransaction = require("../models/BankTransaction");
const BankAccount = require("../models/BankAccount");

const createBankTransaction = async (payload, userId) => {
  const bankAccount = await BankAccount.findById(payload.bankAccount);
  if (!bankAccount) {
    throw new Error("Bank account not found");
  }

  const created = await BankTransaction.create({
    ...payload,
    createdBy: userId || null,
    updatedBy: userId || null,
  });

  return created.populate([
    { path: "bankAccount", select: "name bankName currency" },
    { path: "journal", select: "journalNumber date status" },
  ]);
};

const getBankTransactions = async (entityId, query = {}) => {
  const filter = { entity: entityId };

  if (query.bankAccount) filter.bankAccount = query.bankAccount;
  if (query.isReconciled !== undefined) {
    filter.isReconciled = query.isReconciled === "true";
  }
  if (query.matchStatus) filter.matchStatus = query.matchStatus;
  if (query.status) filter.status = query.status;

  if (query.from || query.to) {
    filter.transactionDate = {};
    if (query.from) filter.transactionDate.$gte = new Date(query.from);
    if (query.to) filter.transactionDate.$lte = new Date(query.to);
  }

  return BankTransaction.find(filter)
    .populate("bankAccount", "name bankName currency")
    .populate("journal", "journalNumber date status")
    .sort({ transactionDate: -1, createdAt: -1 });
};

const getBankTransactionById = async (id, entityId) => {
  const txn = await BankTransaction.findOne({
    _id: id,
    entity: entityId,
  })
    .populate("bankAccount", "name bankName currency")
    .populate("journal", "journalNumber date status");

  if (!txn) {
    throw new Error("Bank transaction not found");
  }

  return txn;
};

const updateBankTransaction = async (id, entityId, payload, userId) => {
  const existing = await BankTransaction.findOne({ _id: id, entity: entityId });

  if (!existing) {
    throw new Error("Bank transaction not found");
  }

  if (existing.isReconciled) {
    throw new Error("Reconciled transaction cannot be edited");
  }

  const updated = await BankTransaction.findOneAndUpdate(
    { _id: id, entity: entityId },
    { ...payload, updatedBy: userId || null },
    { new: true, runValidators: true },
  )
    .populate("bankAccount", "name bankName currency")
    .populate("journal", "journalNumber date status");

  return updated;
};

const deleteBankTransaction = async (id, entityId) => {
  const deleted = await BankTransaction.findOneAndDelete({
    _id: id,
    entity: entityId,
  });

  if (!deleted) {
    throw new Error("Bank transaction not found");
  }

  return deleted;
};

module.exports = {
  createBankTransaction,
  getBankTransactions,
  getBankTransactionById,
  updateBankTransaction,
  deleteBankTransaction,
};

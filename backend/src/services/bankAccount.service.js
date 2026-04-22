const BankAccount = require("../models/BankAccount");
const BankTransaction = require("../models/BankTransaction");
const Journal = require("../models/Journal");
const Account = require("../models/Account");

const calculateLedgerBalance = async (bankAccount) => {
  const glAccountId = bankAccount.account;

  const journals = await Journal.find({
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

const getUnreconciledCount = async (bankAccountId) => {
  return BankTransaction.countDocuments({
    bankAccount: bankAccountId,
    isReconciled: false,
    status: { $ne: "voided" },
  });
};

const createBankAccount = async (payload, userId) => {
  const account = await Account.findById(payload.account);
  if (!account) {
    throw new Error("Linked chart of account not found");
  }

  const exists = await BankAccount.findOne({
    entity: payload.entity,
    name: payload.name,
  });

  if (exists) {
    throw new Error("Bank account with this name already exists");
  }

  const created = await BankAccount.create({
    ...payload,
    createdBy: userId || null,
    updatedBy: userId || null,
  });

  return created;
};

const getBankAccounts = async (entityId) => {
  const accounts = await BankAccount.find({
    entity: entityId,
    isActive: true,
  })
    .populate("entity", "name code")
    .populate("account", "code name type")
    .sort({ createdAt: -1 });

  const enriched = await Promise.all(
    accounts.map(async (item) => {
      const ledgerBalance = await calculateLedgerBalance(item);
      const unreconciledCount = await getUnreconciledCount(item._id);

      return {
        ...item.toObject(),
        ledgerBalance,
        unreconciledCount,
      };
    }),
  );

  return enriched;
};

const getBankAccountById = async (id, entityId) => {
  const account = await BankAccount.findOne({
    _id: id,
    entity: entityId,
  })
    .populate("entity", "name code")
    .populate("account", "code name type");

  if (!account) {
    throw new Error("Bank account not found");
  }

  const ledgerBalance = await calculateLedgerBalance(account);
  const unreconciledCount = await getUnreconciledCount(account._id);

  return {
    ...account.toObject(),
    ledgerBalance,
    unreconciledCount,
  };
};

const updateBankAccount = async (id, entityId, payload, userId) => {
  const updated = await BankAccount.findOneAndUpdate(
    { _id: id, entity: entityId },
    { ...payload, updatedBy: userId || null },
    { new: true, runValidators: true },
  )
    .populate("entity", "name code")
    .populate("account", "code name type");

  if (!updated) {
    throw new Error("Bank account not found");
  }

  return updated;
};

const deleteBankAccount = async (id, entityId, userId) => {
  const updated = await BankAccount.findOneAndUpdate(
    { _id: id, entity: entityId },
    { isActive: false, updatedBy: userId || null },
    { new: true },
  );

  if (!updated) {
    throw new Error("Bank account not found");
  }

  return updated;
};

const getCashPosition = async (entityId) => {
  const accounts = await BankAccount.find({
    entity: entityId,
    isActive: true,
  });

  const result = [];

  for (const acc of accounts) {
    const ledgerBalance = await calculateLedgerBalance(acc);
    const unreconciledCount = await getUnreconciledCount(acc._id);

    result.push({
      bankAccountId: acc._id,
      name: acc.name,
      bankName: acc.bankName,
      currency: acc.currency,
      statementBalance: acc.statementBalance || 0,
      ledgerBalance,
      difference: Number(
        ((acc.statementBalance || 0) - ledgerBalance).toFixed(2),
      ),
      unreconciledCount,
    });
  }

  return result;
};

module.exports = {
  createBankAccount,
  getBankAccounts,
  getBankAccountById,
  updateBankAccount,
  deleteBankAccount,
  getCashPosition,
};

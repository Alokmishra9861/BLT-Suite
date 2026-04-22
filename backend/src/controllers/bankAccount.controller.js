const bankAccountService = require("../services/bankAccount.service");
const { auditWrap } = require("../utils/audit.util");

const getEntityId = (req) =>
  req.entity?._id || req.user?.entity || req.body.entity || req.query.entity;

const createBankAccountHandler = async (req) => {
  const entityId = getEntityId(req);

  return await bankAccountService.createBankAccount(
    { ...req.body, entity: entityId },
    req.user?._id,
  );
};

const updateBankAccountHandler = async (req) => {
  const entityId = getEntityId(req);

  const existing = await bankAccountService.getBankAccountById(
    req.params.id,
    entityId,
  );
  req.res.locals.beforeData = existing;

  return await bankAccountService.updateBankAccount(
    req.params.id,
    entityId,
    req.body,
    req.user?._id,
  );
};

const deleteBankAccountHandler = async (req) => {
  const entityId = getEntityId(req);

  const existing = await bankAccountService.getBankAccountById(
    req.params.id,
    entityId,
  );
  req.res.locals.beforeData = existing;

  return await bankAccountService.deleteBankAccount(
    req.params.id,
    entityId,
    req.user?._id,
  );
};

const getBankAccounts = async (req, res, next) => {
  try {
    const entityId = getEntityId(req);
    const data = await bankAccountService.getBankAccounts(entityId);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getBankAccountById = async (req, res, next) => {
  try {
    const entityId = getEntityId(req);
    const data = await bankAccountService.getBankAccountById(
      req.params.id,
      entityId,
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getCashPosition = async (req, res, next) => {
  try {
    const entityId = getEntityId(req);
    const data = await bankAccountService.getCashPosition(entityId);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBankAccount: auditWrap(createBankAccountHandler, {
    module: "banking",
    action: "create",
    resource: "BankAccount",
    successStatus: 201,
    successMessage: "Bank account created successfully",
  }),

  updateBankAccount: auditWrap(updateBankAccountHandler, {
    module: "banking",
    action: "update",
    resource: "BankAccount",
    successMessage: "Bank account updated successfully",
  }),

  deleteBankAccount: auditWrap(deleteBankAccountHandler, {
    module: "banking",
    action: "delete",
    resource: "BankAccount",
    successMessage: "Bank account deactivated successfully",
  }),

  getBankAccounts,
  getBankAccountById,
  getCashPosition,
};

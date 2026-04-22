const bankTransactionService = require("../services/bankTransaction.service");

const getEntityId = (req) =>
  req.entity?._id || req.user?.entity || req.body.entity || req.query.entity;

const createBankTransaction = async (req, res, next) => {
  try {
    const entityId = getEntityId(req);

    const data = await bankTransactionService.createBankTransaction(
      { ...req.body, entity: entityId },
      req.user?._id,
    );

    res.status(201).json({
      success: true,
      message: "Bank transaction created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getBankTransactions = async (req, res, next) => {
  try {
    const entityId = getEntityId(req);
    const data = await bankTransactionService.getBankTransactions(
      entityId,
      req.query,
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getBankTransactionById = async (req, res, next) => {
  try {
    const entityId = getEntityId(req);
    const data = await bankTransactionService.getBankTransactionById(
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

const updateBankTransaction = async (req, res, next) => {
  try {
    const entityId = getEntityId(req);

    const data = await bankTransactionService.updateBankTransaction(
      req.params.id,
      entityId,
      req.body,
      req.user?._id,
    );

    res.json({
      success: true,
      message: "Bank transaction updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const deleteBankTransaction = async (req, res, next) => {
  try {
    const entityId = getEntityId(req);

    const data = await bankTransactionService.deleteBankTransaction(
      req.params.id,
      entityId,
    );

    res.json({
      success: true,
      message: "Bank transaction deleted successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBankTransaction,
  getBankTransactions,
  getBankTransactionById,
  updateBankTransaction,
  deleteBankTransaction,
};

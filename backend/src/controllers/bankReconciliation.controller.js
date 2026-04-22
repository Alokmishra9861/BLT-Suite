const bankReconciliationService = require("../services/bankReconciliation.service");

const getEntityId = (req) =>
  req.entity?._id || req.user?.entity || req.body.entity || req.query.entity;

const createReconciliation = async (req, res, next) => {
  try {
    const entityId = getEntityId(req);

    const data = await bankReconciliationService.createReconciliation(
      { ...req.body, entity: entityId },
      req.user?._id,
    );

    res.status(201).json({
      success: true,
      message: "Bank reconciliation created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getReconciliations = async (req, res, next) => {
  try {
    const entityId = getEntityId(req);
    const data = await bankReconciliationService.getReconciliations(
      entityId,
      req.query.bankAccount,
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getReconciliationById = async (req, res, next) => {
  try {
    const entityId = getEntityId(req);
    const data = await bankReconciliationService.getReconciliationById(
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

const addReconciliationItem = async (req, res, next) => {
  try {
    const entityId = getEntityId(req);

    const data = await bankReconciliationService.addReconciliationItem(
      req.params.id,
      entityId,
      req.body,
      req.user?._id,
    );

    res.json({
      success: true,
      message: "Reconciliation item added successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const completeReconciliation = async (req, res, next) => {
  try {
    const entityId = getEntityId(req);

    const data = await bankReconciliationService.completeReconciliation(
      req.params.id,
      entityId,
      req.user?._id,
    );

    res.json({
      success: true,
      message: "Reconciliation completed successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReconciliation,
  getReconciliations,
  getReconciliationById,
  addReconciliationItem,
  completeReconciliation,
};

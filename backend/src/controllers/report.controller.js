const reportService = require("../services/report.service");
const entityService = require("../services/entity.service");

/**
 * Resolve the selected entity ID + all descendant entity IDs
 * so that reports automatically aggregate across the group.
 */
const resolveEntityIds = async (req) => {
  const entityId = req.entity?._id;

  if (!entityId) return [];

  return entityService.getDescendantEntityIds(entityId);
};

const getProfitAndLoss = async (req, res, next) => {
  try {
    const entityIds = await resolveEntityIds(req);
    const { from, to } = req.query;

    const data = await reportService.calculateProfitAndLoss(
      entityIds,
      from,
      to,
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getBalanceSheet = async (req, res, next) => {
  try {
    const entityIds = await resolveEntityIds(req);
    const { to } = req.query;

    const data = await reportService.calculateBalanceSheet(entityIds, to);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getCashFlow = async (req, res, next) => {
  try {
    const entityIds = await resolveEntityIds(req);
    const { from, to } = req.query;

    const data = await reportService.calculateCashFlowSummary(
      entityIds,
      from,
      to,
    );

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getTrialBalance = async (req, res, next) => {
  try {
    const entityIds = await resolveEntityIds(req);
    const { from, to } = req.query;

    const data = await reportService.calculateTrialBalance(entityIds, from, to);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getHrSummary = async (req, res, next) => {
  try {
    const entityIds = await resolveEntityIds(req);
    const { from, to } = req.query;

    const data = await reportService.getHrSummary(entityIds, from, to);

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfitAndLoss,
  getBalanceSheet,
  getCashFlow,
  getTrialBalance,
  getHrSummary,
};

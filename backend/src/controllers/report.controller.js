const reportService = require("../services/report.service");

const getEntityId = (req) =>
  req.entity?._id || req.user?.entity || req.query.entity || req.body.entity;

const getProfitAndLoss = async (req, res, next) => {
  try {
    const entityId = getEntityId(req);
    const { from, to } = req.query;

    const data = await reportService.calculateProfitAndLoss(entityId, from, to);

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
    const entityId = getEntityId(req);
    const { to } = req.query;

    const data = await reportService.calculateBalanceSheet(entityId, to);

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
    const entityId = getEntityId(req);
    const { from, to } = req.query;

    const data = await reportService.calculateCashFlowSummary(
      entityId,
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
    const entityId = getEntityId(req);
    const { from, to } = req.query;

    const data = await reportService.calculateTrialBalance(entityId, from, to);

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
    const entityId = getEntityId(req);
    const { from, to } = req.query;

    const data = await reportService.getHrSummary(entityId, from, to);

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

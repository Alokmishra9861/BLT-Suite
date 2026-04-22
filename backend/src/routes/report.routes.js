const express = require("express");
const controller = require("../controllers/report.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const entityMiddleware = require("../middlewares/entity.middleware");

const router = express.Router();

router.use(authMiddleware, entityMiddleware);

router.get("/profit-loss", controller.getProfitAndLoss);
router.get("/balance-sheet", controller.getBalanceSheet);
router.get("/cash-flow", controller.getCashFlow);
router.get("/trial-balance", controller.getTrialBalance);
router.get("/hr-summary", controller.getHrSummary);

module.exports = router;

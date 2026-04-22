const express = require("express");
const controller = require("../controllers/bankReconciliation.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const entityMiddleware = require("../middlewares/entity.middleware");
const autoAudit = require("../middlewares/autoAudit.middleware");
const BankReconciliation = require("../models/BankReconciliation");

const router = express.Router();

router.use(authMiddleware, entityMiddleware);

router.post(
  "/",
  autoAudit({
    module: "banking",
    resource: "BankReconciliation",
    model: BankReconciliation,
  }),
  controller.createReconciliation,
);
router.get("/", controller.getReconciliations);
router.get("/:id", controller.getReconciliationById);
router.post(
  "/:id/items",
  autoAudit({
    module: "banking",
    action: "update",
    resource: "BankReconciliation",
    model: BankReconciliation,
    idParam: "id",
    description: "update BankReconciliation items",
  }),
  controller.addReconciliationItem,
);
router.post(
  "/:id/complete",
  autoAudit({
    module: "banking",
    action: "update",
    resource: "BankReconciliation",
    model: BankReconciliation,
    idParam: "id",
    description: "complete BankReconciliation",
  }),
  controller.completeReconciliation,
);

module.exports = router;

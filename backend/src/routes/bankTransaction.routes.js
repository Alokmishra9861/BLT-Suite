const express = require("express");
const controller = require("../controllers/bankTransaction.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const entityMiddleware = require("../middlewares/entity.middleware");
const autoAudit = require("../middlewares/autoAudit.middleware");
const BankTransaction = require("../models/BankTransaction");

const router = express.Router();

router.use(authMiddleware, entityMiddleware);

router.post(
  "/",
  autoAudit({
    module: "banking",
    resource: "BankTransaction",
    model: BankTransaction,
  }),
  controller.createBankTransaction,
);
router.get("/", controller.getBankTransactions);
router.get("/:id", controller.getBankTransactionById);
router.put(
  "/:id",
  autoAudit({
    module: "banking",
    resource: "BankTransaction",
    model: BankTransaction,
    idParam: "id",
  }),
  controller.updateBankTransaction,
);
router.delete(
  "/:id",
  autoAudit({
    module: "banking",
    resource: "BankTransaction",
    model: BankTransaction,
    idParam: "id",
  }),
  controller.deleteBankTransaction,
);

module.exports = router;

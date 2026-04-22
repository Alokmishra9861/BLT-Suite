const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middlewares/auth.middleware");
const entityMiddleware = require("../middlewares/entity.middleware");
const autoAudit = require("../middlewares/autoAudit.middleware");
const validate = require("../middlewares/validate.middleware");
const { createBillValidator } = require("../validators/bill.validator");
const billController = require("../controllers/bill.controller");
const Bill = require("../models/Bill");

router.use(authMiddleware);
router.use(entityMiddleware);

router.get("/", billController.getBills);
router.get("/summary", billController.getBillSummary);
router.post(
  "/",
  autoAudit({ module: "payables", resource: "Bill", model: Bill }),
  validate(createBillValidator),
  billController.createBill,
);
router.get("/:billId", billController.getBill);
router.put(
  "/:billId",
  autoAudit({
    module: "payables",
    resource: "Bill",
    model: Bill,
    idParam: "billId",
  }),
  validate(createBillValidator),
  billController.updateBill,
);
router.delete(
  "/:billId",
  autoAudit({
    module: "payables",
    resource: "Bill",
    model: Bill,
    idParam: "billId",
  }),
  billController.deleteBill,
);
router.patch(
  "/:billId/approve",
  autoAudit({
    module: "payables",
    action: "update",
    resource: "Bill",
    model: Bill,
    idParam: "billId",
    description: "approve Bill",
  }),
  billController.approveBill,
);
router.patch(
  "/:billId/void",
  autoAudit({
    module: "payables",
    action: "update",
    resource: "Bill",
    model: Bill,
    idParam: "billId",
    description: "void Bill",
  }),
  billController.voidBill,
);

module.exports = router;

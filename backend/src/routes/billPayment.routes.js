const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middlewares/auth.middleware");
const entityMiddleware = require("../middlewares/entity.middleware");
const autoAudit = require("../middlewares/autoAudit.middleware");
const validate = require("../middlewares/validate.middleware");
const { createBillPaymentValidator } = require("../validators/bill.validator");
const billPaymentController = require("../controllers/billPayment.controller");
const BillPayment = require("../models/BillPayment");

router.use(authMiddleware);
router.use(entityMiddleware);

router.get("/", billPaymentController.getPayments);
router.post(
  "/",
  autoAudit({
    module: "payables",
    resource: "BillPayment",
    model: BillPayment,
  }),
  validate(createBillPaymentValidator),
  billPaymentController.createPayment,
);
router.get("/:paymentId", billPaymentController.getPayment);

module.exports = router;

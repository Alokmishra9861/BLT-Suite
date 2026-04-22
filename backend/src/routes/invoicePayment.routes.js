const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middlewares/auth.middleware");
const entityMiddleware = require("../middlewares/entity.middleware");
const autoAudit = require("../middlewares/autoAudit.middleware");
const validate = require("../middlewares/validate.middleware");
const {
  createInvoicePaymentValidator,
} = require("../validators/invoice.validator");
const invoicePaymentController = require("../controllers/invoicePayment.controller");
const InvoicePayment = require("../models/InvoicePayment");

router.use(authMiddleware);
router.use(entityMiddleware);

router.get("/", invoicePaymentController.getPayments);
router.post(
  "/",
  autoAudit({
    module: "receivables",
    resource: "InvoicePayment",
    model: InvoicePayment,
  }),
  validate(createInvoicePaymentValidator),
  invoicePaymentController.createPayment,
);
router.get("/:paymentId", invoicePaymentController.getPayment);

module.exports = router;

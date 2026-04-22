const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middlewares/auth.middleware");
const entityMiddleware = require("../middlewares/entity.middleware");
const validate = require("../middlewares/validate.middleware");
const { createInvoiceValidator } = require("../validators/invoice.validator");
const invoiceController = require("../controllers/invoice.controller");

router.use(authMiddleware);
router.use(entityMiddleware);

router.get("/", invoiceController.getInvoices);
router.get("/summary", invoiceController.getInvoiceSummary);
router.post(
  "/",
  validate(createInvoiceValidator),
  invoiceController.createInvoice,
);
router.get("/:invoiceId", invoiceController.getInvoice);
router.put(
  "/:invoiceId",
  validate(createInvoiceValidator),
  invoiceController.updateInvoice,
);
router.delete("/:invoiceId", invoiceController.deleteInvoice);
router.patch("/:invoiceId/send", invoiceController.sendInvoice);
router.patch("/:invoiceId/void", invoiceController.voidInvoice);

module.exports = router;

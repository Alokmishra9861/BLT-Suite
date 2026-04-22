const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middlewares/auth.middleware");
const entityMiddleware = require("../middlewares/entity.middleware");
const autoAudit = require("../middlewares/autoAudit.middleware");
const validate = require("../middlewares/validate.middleware");
const { createCustomerValidator } = require("../validators/customer.validator");
const customerController = require("../controllers/customer.controller");
const Customer = require("../models/Customer");

router.use(authMiddleware);
router.use(entityMiddleware);

router.get("/", customerController.getCustomers);
router.post(
  "/",
  autoAudit({ module: "receivables", resource: "Customer", model: Customer }),
  validate(createCustomerValidator),
  customerController.createCustomer,
);
router.get("/:customerId", customerController.getCustomer);
router.put(
  "/:customerId",
  autoAudit({
    module: "receivables",
    resource: "Customer",
    model: Customer,
    idParam: "customerId",
  }),
  validate(createCustomerValidator),
  customerController.updateCustomer,
);
router.delete(
  "/:customerId",
  autoAudit({
    module: "receivables",
    resource: "Customer",
    model: Customer,
    idParam: "customerId",
  }),
  customerController.deleteCustomer,
);

module.exports = router;

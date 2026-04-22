const express = require("express");
const router = express.Router({ mergeParams: true });
const authMiddleware = require("../middlewares/auth.middleware");
const entityMiddleware = require("../middlewares/entity.middleware");
const autoAudit = require("../middlewares/autoAudit.middleware");
const validate = require("../middlewares/validate.middleware");
const { createVendorValidator } = require("../validators/vendor.validator");
const vendorController = require("../controllers/vendor.controller");
const Vendor = require("../models/Vendor");

router.use(authMiddleware);
router.use(entityMiddleware);

router.get("/", vendorController.getVendors);
router.post(
  "/",
  autoAudit({ module: "payables", resource: "Vendor", model: Vendor }),
  validate(createVendorValidator),
  vendorController.createVendor,
);
router.get("/:vendorId", vendorController.getVendor);
router.put(
  "/:vendorId",
  autoAudit({
    module: "payables",
    resource: "Vendor",
    model: Vendor,
    idParam: "vendorId",
  }),
  validate(createVendorValidator),
  vendorController.updateVendor,
);
router.delete(
  "/:vendorId",
  autoAudit({
    module: "payables",
    resource: "Vendor",
    model: Vendor,
    idParam: "vendorId",
  }),
  vendorController.deleteVendor,
);

module.exports = router;

const express = require("express");
const {
  getBenefits,
  createBenefit,
  updateBenefit,
} = require("../controllers/benefit.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const autoAudit = require("../middlewares/autoAudit.middleware");
const Benefit = require("../models/Benefit");

const { validateBenefit } = require("../validators/hr.validator");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router
  .route("/")
  .get(getBenefits)
  .post(
    autoAudit({ module: "hr", resource: "Benefit", model: Benefit }),
    validateBenefit,
    createBenefit,
  );

router.route("/:id").put(
  autoAudit({
    module: "hr",
    resource: "Benefit",
    model: Benefit,
    idParam: "id",
  }),
  validateBenefit,
  updateBenefit,
);

module.exports = router;

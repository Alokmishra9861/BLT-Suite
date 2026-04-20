const express = require("express");
const {
  getBenefits,
  createBenefit,
  updateBenefit,
} = require("../controllers/benefit.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const { validateBenefit } = require("../validators/hr.validator");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router.route("/").get(getBenefits).post(validateBenefit, createBenefit);

router.route("/:id").put(validateBenefit, updateBenefit);

module.exports = router;

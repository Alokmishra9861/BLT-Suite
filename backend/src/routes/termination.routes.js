const express = require("express");
const {
  getTerminations,
  createTermination,
} = require("../controllers/termination.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const autoAudit = require("../middlewares/autoAudit.middleware");
const Termination = require("../models/Termination");

const { validateTermination } = require("../validators/hr.validator");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router
  .route("/")
  .get(getTerminations)
  .post(
    autoAudit({ module: "hr", resource: "Termination", model: Termination }),
    validateTermination,
    createTermination,
  );

module.exports = router;

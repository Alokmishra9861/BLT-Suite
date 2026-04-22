const express = require("express");
const {
  getWorkPermits,
  createWorkPermit,
  updateWorkPermit,
} = require("../controllers/workPermit.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const autoAudit = require("../middlewares/autoAudit.middleware");
const WorkPermit = require("../models/WorkPermit");

const { validateWorkPermit } = require("../validators/hr.validator");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router
  .route("/")
  .get(getWorkPermits)
  .post(
    autoAudit({ module: "hr", resource: "WorkPermit", model: WorkPermit }),
    validateWorkPermit,
    createWorkPermit,
  );

router.route("/:id").put(
  autoAudit({
    module: "hr",
    resource: "WorkPermit",
    model: WorkPermit,
    idParam: "id",
  }),
  validateWorkPermit,
  updateWorkPermit,
);

module.exports = router;

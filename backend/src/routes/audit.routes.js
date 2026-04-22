const express = require("express");
const controller = require("../controllers/audit.controller");
const auth = require("../middlewares/auth.middleware");
const entity = require("../middlewares/entity.middleware");
const { auditView } = require("../middlewares/audit.middleware");

const router = express.Router();

router.use(auth, entity);

router.get(
  "/",
  auditView("system", "AuditLog", "Viewed audit timeline"),
  controller.getAuditLogs,
);

module.exports = router;

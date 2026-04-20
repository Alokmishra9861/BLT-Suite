const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const entityMiddleware = require("../middlewares/entity.middleware");

const router = express.Router();

router.get(
  "/summary",
  authMiddleware,
  entityMiddleware,
  dashboardController.summary,
);

module.exports = router;

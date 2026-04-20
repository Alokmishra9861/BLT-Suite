const express = require("express");
const {
  getWorkPermits,
  createWorkPermit,
  updateWorkPermit,
} = require("../controllers/workPermit.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const { validateWorkPermit } = require("../validators/hr.validator");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router
  .route("/")
  .get(getWorkPermits)
  .post(validateWorkPermit, createWorkPermit);

router.route("/:id").put(validateWorkPermit, updateWorkPermit);

module.exports = router;

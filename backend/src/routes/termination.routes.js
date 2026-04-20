const express = require("express");
const {
  getTerminations,
  createTermination,
} = require("../controllers/termination.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const { validateTermination } = require("../validators/hr.validator");

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

router
  .route("/")
  .get(getTerminations)
  .post(validateTermination, createTermination);

module.exports = router;

const express = require("express");
const authController = require("../controllers/auth.controller");
const validate = require("../middlewares/validate.middleware");
const { loginValidator } = require("../validators/auth.validator");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/login", validate(loginValidator), authController.login);
router.get("/me", authMiddleware, authController.me);

module.exports = router;

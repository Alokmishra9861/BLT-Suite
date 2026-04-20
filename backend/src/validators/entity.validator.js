const { body } = require("express-validator");

const createEntityValidator = [
  body("name").isString().notEmpty().withMessage("Name is required"),
  body("code").isString().notEmpty().withMessage("Code is required"),
  body("currency").optional().isString(),
  body("timezone").optional().isString(),
  body("country").optional().isString(),
  body("active").optional().isBoolean(),
];

const updateEntityValidator = [
  body("name").optional().isString(),
  body("code").optional().isString(),
  body("currency").optional().isString(),
  body("timezone").optional().isString(),
  body("country").optional().isString(),
  body("active").optional().isBoolean(),
];

module.exports = {
  createEntityValidator,
  updateEntityValidator,
};

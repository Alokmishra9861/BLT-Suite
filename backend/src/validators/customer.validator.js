const { body } = require("express-validator");

const createCustomerValidator = [
  body("name").trim().notEmpty().withMessage("Customer name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").optional().trim(),
  body("address").optional().trim(),
  body("contactPerson").optional().trim(),
  body("taxNumber").optional().trim(),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be active or inactive"),
];

module.exports = {
  createCustomerValidator,
};

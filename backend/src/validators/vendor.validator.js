const { body } = require("express-validator");

const createVendorValidator = [
  body("name").trim().notEmpty().withMessage("Vendor name is required"),
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
  createVendorValidator,
};

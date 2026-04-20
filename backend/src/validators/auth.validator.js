const { body } = require("express-validator");

const loginValidator = [
  body("email").isEmail().withMessage("Valid email required"),
  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("Password required"),
];

module.exports = {
  loginValidator,
};

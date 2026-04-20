const { validationResult } = require("express-validator");
const ApiError = require("../utils/ApiError");

const validate = (validators = []) => {
  return async (req, res, next) => {
    await Promise.all(validators.map((validator) => validator.run(req)));
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return next(new ApiError(422, "Validation failed", result.array()));
    }
    return next();
  };
};

module.exports = validate;

const ApiError = require("../utils/ApiError");

const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ApiError(403, "Forbidden"));
    }

    if (!allowedRoles.includes(req.user.role.name)) {
      return next(new ApiError(403, "Insufficient role permissions"));
    }

    return next();
  };
};

module.exports = roleMiddleware;

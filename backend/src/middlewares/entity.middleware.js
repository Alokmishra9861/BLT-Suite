const ApiError = require("../utils/ApiError");
const Entity = require("../models/Entity");

const entityMiddleware = async (req, res, next) => {
  const entityId = req.header("x-entity-id");

  if (!entityId) {
    return next(new ApiError(400, "Missing x-entity-id header"));
  }

  const entity = await Entity.findById(entityId).lean();

  if (!entity || entity.active === false) {
    return next(new ApiError(404, "Entity not found or inactive"));
  }

  req.entityId = entityId;
  req.entity = entity;
  return next();
};

module.exports = entityMiddleware;

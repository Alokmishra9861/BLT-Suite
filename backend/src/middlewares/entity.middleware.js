const Entity = require("../models/Entity");

const entityMiddleware = async (req, res, next) => {
  try {
    const entityId =
      req.headers["x-entity-id"] ||
      req.query.entity ||
      req.body.entity ||
      req.user?.entity;

    if (!entityId) {
      return res.status(400).json({
        success: false,
        message: "Entity is required",
      });
    }

    const entity = await Entity.findById(entityId);

    if (!entity) {
      return res.status(404).json({
        success: false,
        message: "Entity not found",
      });
    }

    req.entity = entity;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = entityMiddleware;

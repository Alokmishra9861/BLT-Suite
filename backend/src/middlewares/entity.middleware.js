const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const ApiError = require("../utils/ApiError");
const Entity = require("../models/Entity");

const entityMiddleware = async (req, res, next) => {
  // Skip for auth routes (login) and OPTIONS
  if (req.method === "OPTIONS") return next();
  if (req.path && req.path.startsWith("/auth")) return next();

  try {
    // Prefer explicit header
    let entityId = req.headers["x-entity-id"] || null;

    // Try extract from path /entities/:entityId
    if (!entityId && req.path) {
      const match = req.path.match(/^\/entities\/([0-9a-fA-F]{24})/);
      if (match) entityId = match[1];
    }

    // Try token payload if present
    if (!entityId) {
      const header = req.headers.authorization || "";
      const token = header.startsWith("Bearer ") ? header.substring(7) : null;
      if (token) {
        try {
          const payload = jwt.verify(token, jwtConfig.secret);
          if (payload && payload.entityId) entityId = payload.entityId;
        } catch (e) {
          // ignore invalid token here; auth middleware will handle protected routes
        }
      }
    }

    if (!entityId) {
      return res.status(400).json({ message: "Entity required" });
    }

    const entity = await Entity.findById(entityId).lean();
    if (!entity || entity.active === false) {
      return res.status(404).json({ message: "Entity not found or inactive" });
    }

    req.entityId = entityId;
    req.entity = entity;
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = entityMiddleware;

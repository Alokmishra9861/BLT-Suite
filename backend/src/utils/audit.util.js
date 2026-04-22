const auditService = require("../services/audit.service");

const getEntityId = (req, result, options = {}) => {
  return (
    req.entity?._id ||
    req.user?.entity ||
    req.body?.entity ||
    req.query?.entity ||
    result?.entity ||
    options.entity ||
    null
  );
};

const getUserId = (req) => req.user?._id || null;
const getUserName = (req) => req.user?.name || req.user?.fullName || "Unknown User";

const auditWrap = (handler, config) => {
  return async (req, res, next) => {
    try {
      const result = await handler(req, res, next);

      if (res.headersSent) return result;

      const entityId = getEntityId(req, result, config);
      const userId = getUserId(req);
      const userName = getUserName(req);

      await auditService.logAudit({
        entity: entityId,
        user: userId,
        userName,
        module: config.module,
        action: config.action,
        resource: config.resource,
        resourceId:
          result?._id ||
          result?.id ||
          res.locals?.resourceId ||
          req.params?.id ||
          null,
        description:
          typeof config.description === "function"
            ? config.description(req, result)
            : config.description || `${config.action} ${config.resource}`,
        before: res.locals?.beforeData || null,
        after: result || res.locals?.afterData || null,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      if (!res.writableEnded) {
        return res.status(config.successStatus || 200).json({
          success: true,
          message: config.successMessage || `${config.resource} ${config.action}d successfully`,
          data: result,
        });
      }
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  auditWrap,
};
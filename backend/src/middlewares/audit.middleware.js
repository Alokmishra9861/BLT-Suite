const auditService = require("../services/audit.service");

const auditView = (moduleName, resource, description) => {
  return async (req, res, next) => {
    try {
      await auditService.logAudit({
        entity: req.entity?._id || req.user?.entity || null,
        user: req.user?._id || null,
        userName: req.user?.name || "Unknown User",
        module: moduleName,
        action: "view",
        resource,
        description: description || `Viewed ${resource}`,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
    } catch (error) {
      console.error("Audit view log failed:", error.message);
    }

    next();
  };
};

module.exports = {
  auditView,
};

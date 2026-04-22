const auditService = require("../services/audit.service");

const getAuditLogs = async (req, res, next) => {
  try {
    const filters = {
      entity: req.entity._id,
      module: req.query.module,
      action: req.query.action,
      user: req.query.user,
      from: req.query.from,
      to: req.query.to,
    };

    const logs = await auditService.getAuditLogs(filters);

    res.json({
      success: true,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAuditLogs,
};

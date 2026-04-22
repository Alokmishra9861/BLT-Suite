const AuditLog = require("../models/AuditLog");

const sanitizeAuditData = (data) => {
  if (!data) return null;

  try {
    const obj = typeof data.toObject === "function" ? data.toObject() : data;
    const cloned = JSON.parse(JSON.stringify(obj));

    delete cloned.password;
    delete cloned.resetPasswordToken;
    delete cloned.resetPasswordExpires;
    delete cloned.__v;

    return cloned;
  } catch (error) {
    return null;
  }
};

const logAudit = async ({
  entity,
  user,
  userName,
  module,
  action,
  resource,
  resourceId,
  description,
  before,
  after,
  ip,
  userAgent,
}) => {
  try {
    if (!entity || !module || !action || !resource) return null;

    return await AuditLog.create({
      entity,
      user: user || null,
      userName: userName || "Unknown User",
      module,
      action,
      resource,
      resourceId: resourceId || null,
      description: description || `${action} ${resource}`,
      before: sanitizeAuditData(before),
      after: sanitizeAuditData(after),
      ip: ip || "",
      userAgent: userAgent || "",
    });
  } catch (error) {
    console.error("Audit log failed:", error.message);
    return null;
  }
};

const getAuditLogs = async (filters = {}) => {
  const query = {};

  if (filters.entity) query.entity = filters.entity;
  if (filters.module) query.module = filters.module;
  if (filters.action) query.action = filters.action;
  if (filters.user) query.user = filters.user;
  if (filters.resource) query.resource = filters.resource;

  if (filters.from || filters.to) {
    query.createdAt = {};
    if (filters.from) query.createdAt.$gte = new Date(filters.from);
    if (filters.to) query.createdAt.$lte = new Date(filters.to);
  }

  return AuditLog.find(query)
    .sort({ createdAt: -1 })
    .limit(500)
    .populate("user", "name email");
};

module.exports = {
  logAudit,
  getAuditLogs,
};

const auditService = require("../services/audit.service");

const METHOD_TO_ACTION = {
  POST: "create",
  PUT: "update",
  PATCH: "update",
  DELETE: "delete",
};

const resolveValue = (valueOrResolver, ...args) => {
  if (typeof valueOrResolver === "function") {
    return valueOrResolver(...args);
  }
  return valueOrResolver;
};

const getEntityId = (req, responseBody, beforeData, afterData) => {
  return (
    req.entity?._id ||
    req.entityId ||
    req.params?.entityId ||
    req.user?.entity ||
    req.user?.entityId ||
    req.body?.entity ||
    req.body?.entityId ||
    req.query?.entity ||
    req.query?.entityId ||
    beforeData?.entity ||
    beforeData?.entityId ||
    afterData?.entity ||
    afterData?.entityId ||
    responseBody?.data?.entity ||
    responseBody?.data?.entityId ||
    null
  );
};

const getResourceId = (req, responseBody, idParam, beforeData, afterData) => {
  return (
    (idParam && req.params?.[idParam]) ||
    req.params?.id ||
    responseBody?.data?._id ||
    responseBody?.data?.id ||
    afterData?._id ||
    afterData?.id ||
    beforeData?._id ||
    beforeData?.id ||
    null
  );
};

const defaultDescription = (action, resource) => `${action} ${resource}`;

const autoAudit = (config = {}) => {
  return async (req, res, next) => {
    const action =
      resolveValue(config.action, req) ||
      METHOD_TO_ACTION[req.method.toUpperCase()];

    if (!action) {
      return next();
    }

    const model = resolveValue(config.model, req);
    const idParam = resolveValue(config.idParam, req) || "id";

    let beforeData = null;

    if (
      !res.locals?.beforeData &&
      model &&
      (action === "update" || action === "delete")
    ) {
      const beforeId = req.params?.[idParam] || req.params?.id || null;
      if (beforeId) {
        try {
          beforeData = await model.findById(beforeId).lean();
        } catch (error) {
          beforeData = null;
        }
      }
    }

    const originalJson = res.json.bind(res);

    res.json = async (body) => {
      try {
        if (res.statusCode < 400) {
          const resolvedAction =
            resolveValue(config.action, req, body) || action;
          const resource =
            resolveValue(config.resource, req, body, resolvedAction) ||
            "Resource";

          const responseData = body?.data ?? null;
          const resolvedBefore = res.locals?.beforeData || beforeData;
          const resolvedAfter =
            resolvedAction === "delete"
              ? null
              : responseData || res.locals?.afterData || req.body || null;

          const entityId = getEntityId(
            req,
            body,
            resolvedBefore,
            resolvedAfter,
          );
          const resourceId = getResourceId(
            req,
            body,
            resolveValue(config.idParam, req, body) || idParam,
            resolvedBefore,
            resolvedAfter,
          );

          if (entityId) {
            const descriptionResolver =
              config.description || defaultDescription;
            const description =
              typeof descriptionResolver === "function"
                ? descriptionResolver(req, body, resolvedAction)
                : descriptionResolver;

            await auditService.logAudit({
              entity: entityId,
              user: req.user?._id || req.user?.id || null,
              userName: req.user?.name || req.user?.fullName || "Unknown User",
              module: config.module || "system",
              action: resolvedAction,
              resource,
              resourceId,
              description,
              before: resolvedBefore,
              after: resolvedAfter,
              ip: req.ip,
              userAgent: req.headers["user-agent"],
            });
          }
        }
      } catch (error) {
        console.error("Auto audit log failed:", error.message);
      }

      return originalJson(body);
    };

    return next();
  };
};

module.exports = autoAudit;

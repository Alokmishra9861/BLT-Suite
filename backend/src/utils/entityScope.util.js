const ApiError = require("./ApiError");
const entityService = require("../services/entity.service");

const getSelectedEntityId = (req) => req.entity?._id || null;

const getOperationalEntityFilter = (req) => {
  const entityId = getSelectedEntityId(req);
  if (!entityId) {
    throw new ApiError(400, "Entity context is missing");
  }

  return { entity: entityId };
};

const getReportingEntityFilter = async (req) => {
  const entityId = getSelectedEntityId(req);
  if (!entityId) {
    throw new ApiError(400, "Entity context is missing");
  }

  const entityIds = await entityService.getDescendantEntityIds(entityId);
  return { entity: { $in: entityIds } };
};

const ensureCanCreateOperationalRecord = (req) => {
  if (
    req.entity?.entityType === "parent" &&
    req.entity?.allowDirectTransactions === false
  ) {
    throw new ApiError(
      403,
      "This parent entity is for consolidated reporting only and cannot create operational records.",
    );
  }
};

module.exports = {
  getSelectedEntityId,
  getOperationalEntityFilter,
  getReportingEntityFilter,
  ensureCanCreateOperationalRecord,
};

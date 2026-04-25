const mongoose = require("mongoose");
const Entity = require("../models/Entity");
const ApiError = require("../utils/ApiError");

const buildEntityPayload = (body) => ({
  name: body.name?.trim(),
  code: body.code?.trim().toUpperCase(),
  country: body.country?.trim() || "Cayman Islands",
  currency: body.currency?.trim() || "KYD",
  timezone: body.timezone?.trim() || "America/Cayman",
  entityType: body.entityType || "standalone",
  parentEntity: body.parentEntity || null,
  isHoldingEntity: Boolean(body.isHoldingEntity),
  allowDirectTransactions:
    body.allowDirectTransactions !== undefined
      ? Boolean(body.allowDirectTransactions)
      : true,
  status: body.status || "active",
});

const normalizeEntityTypeRules = (payload) => {
  if (payload.entityType === "parent") {
    payload.parentEntity = null;
    payload.isHoldingEntity = true;
    payload.allowDirectTransactions =
      payload.allowDirectTransactions !== undefined
        ? Boolean(payload.allowDirectTransactions)
        : true;
    return payload;
  }

  if (payload.entityType === "subsidiary") {
    payload.isHoldingEntity = false;
    payload.allowDirectTransactions = true;
    return payload;
  }

  payload.entityType = "standalone";
  payload.parentEntity = null;
  payload.isHoldingEntity = false;
  payload.allowDirectTransactions = true;
  return payload;
};

const ensureNoCircularParent = async (entityId, parentEntityId) => {
  if (!entityId || !parentEntityId) {
    return;
  }

  const normalizedParentId = normalizeId(parentEntityId);
  if (!normalizedParentId) {
    throw new ApiError(400, "Parent entity id is invalid");
  }

  if (String(entityId) === String(normalizedParentId)) {
    throw new ApiError(400, "Entity cannot be parent of itself");
  }

  const descendantIds = await getDescendantEntityIds(entityId);
  const descendantSet = new Set(descendantIds.map((id) => String(id)));

  if (descendantSet.has(String(normalizedParentId))) {
    throw new ApiError(400, "Circular entity hierarchy is not allowed");
  }
};

const ensureValidStructure = async (payload, entityIdForUpdate = null) => {
  if (payload.entityType === "subsidiary") {
    if (!payload.parentEntity) {
      throw new ApiError(400, "Parent entity is required for a subsidiary");
    }

    await ensureNoCircularParent(entityIdForUpdate, payload.parentEntity);

    const parent = await Entity.findById(payload.parentEntity)
      .select("_id")
      .lean();
    if (!parent) {
      throw new ApiError(404, "Parent entity not found");
    }

    return;
  }

  if (payload.parentEntity) {
    throw new ApiError(
      400,
      "Only subsidiary entities can have a parent entity",
    );
  }
};

const ensureUniqueCode = async (code, excludeId = null) => {
  if (!code) {
    throw new ApiError(400, "Entity code is required");
  }

  const existing = await Entity.findOne({ code }).select("_id code").lean();

  if (
    existing &&
    (!excludeId || existing._id.toString() !== excludeId.toString())
  ) {
    throw new ApiError(409, `Entity code \"${code}\" already exists`);
  }
};

const handleMongoError = (error) => {
  if (error?.code === 11000 && error?.keyPattern?.code) {
    throw new ApiError(
      409,
      `Entity code \"${error?.keyValue?.code || ""}\" already exists`,
    );
  }

  throw error;
};

const normalizeId = (id) => {
  if (!id) return null;

  return mongoose.Types.ObjectId.isValid(id)
    ? new mongoose.Types.ObjectId(id)
    : null;
};

const getEntities = async () => Entity.find().sort({ createdAt: -1 }).lean();

const getEntitiesPublic = async () =>
  Entity.find({ status: "active" })
    .select("_id name code")
    .sort({ name: 1 })
    .lean();

const getEntityById = async (id) => {
  const entity = await Entity.findById(id).lean();

  if (!entity) {
    throw new ApiError(404, "Entity not found");
  }

  return entity;
};

const createEntity = async (body, userId) => {
  const payload = normalizeEntityTypeRules(buildEntityPayload(body));
  await ensureUniqueCode(payload.code);
  await ensureValidStructure(payload);

  payload.createdBy = userId || null;
  payload.updatedBy = userId || null;

  try {
    const entity = new Entity(payload);
    await entity.save();
    return entity;
  } catch (error) {
    handleMongoError(error);
  }
};

const updateEntity = async (id, body, userId) => {
  const entity = await Entity.findById(id);

  if (!entity) {
    throw new ApiError(404, "Entity not found");
  }

  const payload = normalizeEntityTypeRules(buildEntityPayload(body));
  await ensureUniqueCode(payload.code, entity._id);
  await ensureValidStructure(payload, entity._id);

  Object.assign(entity, payload, {
    updatedBy: userId || null,
  });

  try {
    await entity.save();
    return entity;
  } catch (error) {
    handleMongoError(error);
  }
};

const getDescendantEntityIds = async (entityId) => {
  const rootId = normalizeId(entityId);

  if (!rootId) {
    return [];
  }

  const entities = await Entity.find({}, { _id: 1, parentEntity: 1 }).lean();
  const childrenByParent = new Map();

  for (const entity of entities) {
    const parentKey = entity.parentEntity
      ? entity.parentEntity.toString()
      : null;
    const childId = entity._id.toString();

    if (!childrenByParent.has(parentKey)) {
      childrenByParent.set(parentKey, []);
    }

    childrenByParent.get(parentKey).push(childId);
  }

  const visited = new Set();
  const stack = [rootId.toString()];

  while (stack.length > 0) {
    const currentId = stack.pop();

    if (visited.has(currentId)) {
      continue;
    }

    visited.add(currentId);

    const children = childrenByParent.get(currentId) || [];
    for (const childId of children) {
      stack.push(childId);
    }
  }

  return [...visited].map((id) => new mongoose.Types.ObjectId(id));
};

const buildEntityTree = (entities, parentId = null) =>
  entities
    .filter((entity) => {
      const currentParentId = entity.parentEntity
        ? entity.parentEntity.toString()
        : null;
      return currentParentId === parentId;
    })
    .map((entity) => ({
      id: entity._id,
      name: entity.name,
      code: entity.code,
      country: entity.country,
      currency: entity.currency,
      timezone: entity.timezone,
      entityType: entity.entityType,
      isHoldingEntity: entity.isHoldingEntity,
      status: entity.status,
      children: buildEntityTree(entities, entity._id.toString()),
    }));

const getEntityTree = async () => {
  const entities = await Entity.find().lean();
  return buildEntityTree(entities);
};

const deactivateEntity = async (id, userId) => {
  const entity = await Entity.findById(id);

  if (!entity) {
    throw new ApiError(404, "Entity not found");
  }

  entity.status = "inactive";
  entity.updatedBy = userId || null;

  await entity.save();
  return entity;
};

module.exports = {
  createEntity,
  getEntities,
  getEntitiesPublic,
  getEntityById,
  updateEntity,
  getEntityTree,
  deactivateEntity,
  getDescendantEntityIds,
};

const Entity = require("../models/Entity");
const User = require("../models/User");
const Role = require("../models/Role");
const entityService = require("./entity.service");

const getSummary = async (entityId) => {
  // Resolve hierarchy — include selected entity + all descendants
  const entityIds = await entityService.getDescendantEntityIds(entityId);

  const [entity, totalEntities, activeEntities, activeUsers, totalRoles, entityUsers, latestEntities, latestUsers] = await Promise.all([
    Entity.findById(entityId).lean(),
    Entity.countDocuments(),
    Entity.countDocuments({ status: "active" }),
    User.countDocuments({ isActive: true }),
    Role.countDocuments(),
    User.countDocuments({ isActive: true, entityIds: { $in: entityIds } }),
    Entity.find({ _id: { $in: entityIds } }).sort({ createdAt: -1 }).limit(3).lean(),
    User.find({ isActive: true, entityIds: { $in: entityIds } })
      .select("name email createdAt")
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("role", "name")
      .lean(),
  ]);

  const pendingActions = [];
  const alerts = [];

  if (entityUsers === 0) {
    pendingActions.push("No users are assigned to this entity yet");
  }

  if (activeEntities < 2) {
    pendingActions.push("Add a second entity to activate multi-entity comparison");
  }

  if (totalRoles < 3) {
    pendingActions.push("Expand role setup before onboarding more teams");
  }

  if (latestUsers.length > 0) {
    alerts.push(`Latest user added: ${latestUsers[0].name}`);
  } else {
    alerts.push("No active users found for this entity");
  }

  if (latestEntities.length > 0) {
    alerts.push(`Most recent entity: ${latestEntities[0].name}`);
  }

  const isGroupView = entityIds.length > 1;

  return {
    entityId,
    entityIds,
    isGroupView,
    entity: entity
      ? {
          id: entity._id,
          name: entity.name,
          code: entity.code,
          currency: entity.currency,
          country: entity.country,
          status: entity.status,
          entityType: entity.entityType,
          isHoldingEntity: entity.isHoldingEntity,
        }
      : null,
    kpis: [
      {
        key: "active_entities",
        label: isGroupView ? "Group Entities" : "Active Entities",
        value: isGroupView ? entityIds.length : activeEntities,
        trend: `${totalEntities} total entities`,
      },
      {
        key: "entity_users",
        label: isGroupView ? "Group Users" : "Users in Entity",
        value: entityUsers,
        trend: `${activeUsers} active users overall`,
      },
      {
        key: "role_catalog",
        label: "Role Catalog",
        value: totalRoles,
        trend: "RBAC ready",
      },
      {
        key: "current_entity",
        label: isGroupView ? "Group" : "Current Entity",
        value: entity ? entity.name : "Unknown entity",
        trend: entity ? entity.code : "No entity found",
      },
    ],
    pendingActions,
    alerts,
    recentUsers: latestUsers,
    recentEntities: latestEntities,
    updatedAt: new Date().toISOString(),
  };
};

module.exports = {
  getSummary,
};

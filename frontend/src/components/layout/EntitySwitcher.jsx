import React from "react";
import { useEntity } from "../../hooks/useEntity.js";

const EntitySwitcher = () => {
  const { entities, activeEntityId, switchEntity } = useEntity();

  return (
    <div className="entity-switcher">
      <label htmlFor="entity-select">Entity</label>
      <select
        id="entity-select"
        value={activeEntityId || ""}
        onChange={(event) => switchEntity(event.target.value)}
      >
        {entities.length === 0 && <option value="">No entities</option>}
        {entities.map((entity) => (
          <option key={entity._id} value={entity._id}>
            {entity.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default EntitySwitcher;

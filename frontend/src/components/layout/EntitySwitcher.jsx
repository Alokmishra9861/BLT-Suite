import React, { useState } from "react";
import { useEntity } from "../../hooks/useEntity.js";
import CreateEntityModal from "../common/CreateEntityModal.jsx";

const EntitySwitcher = () => {
  const { entities, entityId, switchEntity } = useEntity();
  const [showModal, setShowModal] = useState(false);

  const handleChange = (event) => {
    const value = event.target.value;
    if (value === "__create__") {
      setShowModal(true);
      return;
    }
    switchEntity(value);
    if (value) localStorage.setItem("entityId", value);
  };

  return (
    <div className="entity-switcher">
      <label htmlFor="entity-select">Entity</label>
      <select id="entity-select" value={entityId || ""} onChange={handleChange}>
        {entities.length === 0 && <option value="">No entities</option>}
        {entities.map((entity) => (
          <option key={entity._id} value={entity._id}>
            {entity.name}
          </option>
        ))}
        <option value="__create__">+ Create New Entity</option>
      </select>

      <CreateEntityModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default EntitySwitcher;

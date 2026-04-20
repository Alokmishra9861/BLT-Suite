import { createContext, useContext, useState, useEffect } from "react";
import { getEntities } from "../services/entity.service";

const EntityContext = createContext(null);

export function EntityProvider({ children }) {
  const [entities, setEntities] = useState([]);
  const [currentEntity, setCurrentEntity] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load entities on mount
  useEffect(() => {
    const load = async () => {
      const token =
        localStorage.getItem("blt_token") || localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const list = (await getEntities()) || [];
        setEntities(list);

        // Restore previously selected entity from localStorage
        const savedId = localStorage.getItem("entityId");
        const saved = savedId ? list.find((e) => e._id === savedId) : null;
        const active = saved || list[0] || null;

        if (active) {
          setCurrentEntity(active);
          localStorage.setItem("entityId", active._id); // ← ensure it's stored
        }
      } catch (err) {
        console.error("Failed to load entities:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Persist entity ID whenever it changes
  useEffect(() => {
    if (currentEntity?._id) {
      localStorage.setItem("entityId", currentEntity._id);
    }
  }, [currentEntity]);

  const switchEntity = (entity) => {
    setCurrentEntity(entity);
    localStorage.setItem("entityId", entity._id);
  };

  return (
    <EntityContext.Provider
      value={{ entities, currentEntity, switchEntity, loading }}
    >
      {children}
    </EntityContext.Provider>
  );
}

export const useEntity = () => {
  const ctx = useContext(EntityContext);
  if (!ctx) throw new Error("useEntity must be used inside EntityProvider");
  return ctx;
};

export default EntityContext;

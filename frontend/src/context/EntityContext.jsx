import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";
import entityService from "../services/entity.service";

const EntityContext = createContext(null);

const normalizeEntity = (entity) => {
  if (!entity) return null;

  const id = entity._id || entity.id;
  if (!id) return null;

  return {
    ...entity,
    _id: id,
  };
};

const persistSelection = (entity) => {
  if (!entity?._id) return;

  localStorage.setItem("entityId", entity._id);
  localStorage.setItem("entityName", entity.name || "");
  localStorage.setItem("entityType", entity.entityType || "");
};

export function EntityProvider({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [entities, setEntities] = useState([]);
  const [entityTree, setEntityTree] = useState([]);
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [loadingEntities, setLoadingEntities] = useState(true);

  const loadEntities = async () => {
    try {
      setLoadingEntities(true);

      const [flatEntities, tree] = isAuthenticated
        ? await Promise.all([
            entityService.getEntities(),
            entityService.getEntityTree(),
          ])
        : [await entityService.getEntitiesPublic(), []];

      setEntities(flatEntities);
      setEntityTree(tree);

      const savedEntityId = localStorage.getItem("entityId");

      if (savedEntityId) {
        const found = flatEntities.find((item) => item._id === savedEntityId);
        if (found) {
          const normalized = normalizeEntity(found);
          setSelectedEntity(normalized);
          persistSelection(normalized);
        } else if (flatEntities[0]) {
          const normalized = normalizeEntity(flatEntities[0]);
          setSelectedEntity(normalized);
          persistSelection(normalized);
        }
      } else if (flatEntities[0]) {
        const normalized = normalizeEntity(flatEntities[0]);
        setSelectedEntity(normalized);
        persistSelection(normalized);
      }
    } catch (error) {
      console.error("Failed to load entities:", error);

      if (isAuthenticated) {
        try {
          const flatEntities = await entityService.getEntitiesPublic();
          setEntities(flatEntities);
          setEntityTree([]);

          const savedEntityId = localStorage.getItem("entityId");
          if (savedEntityId) {
            const found = flatEntities.find(
              (item) => item._id === savedEntityId,
            );
            if (found) {
              const normalized = normalizeEntity(found);
              setSelectedEntity(normalized);
              persistSelection(normalized);
            }
          } else if (flatEntities[0]) {
            const normalized = normalizeEntity(flatEntities[0]);
            setSelectedEntity(normalized);
            persistSelection(normalized);
          }
        } catch (fallbackError) {
          console.error("Failed to load public entities:", fallbackError);
        }
      }
    } finally {
      setLoadingEntities(false);
    }
  };

  const selectEntity = (entity) => {
    const normalized = normalizeEntity(entity);
    setSelectedEntity(normalized);
    persistSelection(normalized);
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    loadEntities();
  }, [isAuthenticated, authLoading]);

  const currentEntity = selectedEntity;
  const entityId = selectedEntity?._id || null;

  return (
    <EntityContext.Provider
      value={{
        entities,
        entityTree,
        selectedEntity,
        currentEntity,
        entityId,
        loadingEntities,
        loading: loadingEntities,
        loadEntities,
        selectEntity,
      }}
    >
      {children}
    </EntityContext.Provider>
  );
}

export const useEntity = () => {
  const context = useContext(EntityContext);
  if (!context) {
    throw new Error("useEntity must be used inside EntityProvider");
  }
  return context;
};

export default EntityContext;

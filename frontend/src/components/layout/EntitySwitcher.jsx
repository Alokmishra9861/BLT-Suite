import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useEntity } from "../../context/EntityContext";
import CreateEntityModal from "./CreateEntityModal";

/* ──── helpers ──── */
const getEntityKey = (entity) => entity._id || entity.id;

const ENTITY_META = {
  parent: { icon: "🏢", label: "PARENT", color: "#7c3aed", bg: "#ede9fe" },
  subsidiary: {
    icon: "🧩",
    label: "SUBSIDIARY",
    color: "#0369a1",
    bg: "#e0f2fe",
  },
  standalone: {
    icon: "🏬",
    label: "STANDALONE",
    color: "#0f766e",
    bg: "#ccfbf1",
  },
};

const getMeta = (entity) =>
  ENTITY_META[entity.entityType] || ENTITY_META.standalone;

/** Recursively check if any node in the subtree matches the search term */
function treeMatches(node, term) {
  if (!term) return true;
  const t = term.toLowerCase();
  const selfMatch =
    (node.name || "").toLowerCase().includes(t) ||
    (node.code || "").toLowerCase().includes(t) ||
    (node.entityType || "").toLowerCase().includes(t);
  if (selfMatch) return true;
  return (node.children || []).some((child) => treeMatches(child, t));
}

/** Collect all entity IDs that have children (for default expand) */
function collectExpandableIds(nodes) {
  const ids = new Set();
  for (const node of nodes) {
    if (node.children?.length) {
      ids.add(getEntityKey(node));
      for (const id of collectExpandableIds(node.children)) ids.add(id);
    }
  }
  return ids;
}

/* ────────────────────────────
   EntityTreeNode
   ──────────────────────────── */
function EntityTreeNode({
  entity,
  level = 0,
  selectedEntity,
  onSelect,
  searchTerm,
  expandedIds,
  toggleExpand,
}) {
  const key = getEntityKey(entity);
  const meta = getMeta(entity);
  const hasChildren = entity.children?.length > 0;
  const isExpanded = expandedIds.has(key);
  const isSelected = selectedEntity && getEntityKey(selectedEntity) === key;

  // hide nodes that don't match search
  if (searchTerm && !treeMatches(entity, searchTerm)) return null;

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "10px 16px",
    paddingLeft: 16 + level * 24,
    background: isSelected
      ? "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)"
      : "transparent",
    border: "none",
    borderLeft: isSelected ? "3px solid #0f172a" : "3px solid transparent",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "inherit",
    fontSize: 13,
    transition: "all 0.15s ease",
    borderRadius: 8,
    position: "relative",
  };

  const rowHoverStyle = {
    background: isSelected
      ? "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)"
      : "#f8fafc",
  };

  return (
    <>
      <button
        type="button"
        onClick={() => onSelect(entity)}
        style={rowStyle}
        onMouseEnter={(e) => {
          if (!isSelected)
            e.currentTarget.style.background = rowHoverStyle.background;
        }}
        onMouseLeave={(e) => {
          if (!isSelected) e.currentTarget.style.background = "transparent";
        }}
      >
        {/* Expand / collapse toggle */}
        {hasChildren ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(key);
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              fontSize: 11,
              cursor: "pointer",
              transition: "background 0.15s ease",
              flexShrink: 0,
              color: "#64748b",
              fontWeight: 700,
            }}
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? "▾" : "▸"}
          </span>
        ) : (
          <span style={{ width: 22, flexShrink: 0 }} />
        )}

        {/* Icon */}
        <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>
          {meta.icon}
        </span>

        {/* Name + code */}
        <span style={{ flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontWeight: isSelected ? 700 : 600,
              color: "#0f172a",
              display: "block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {entity.name} ({entity.code})
          </span>
        </span>

        {/* Badge */}
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: 999,
            background: meta.bg,
            color: meta.color,
            flexShrink: 0,
            lineHeight: 1.4,
          }}
        >
          {meta.label}
        </span>

        {/* Selected indicator */}
        {isSelected && (
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#0f172a",
              flexShrink: 0,
            }}
          />
        )}
      </button>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div
          style={{
            borderLeft: "1px solid #e2e8f0",
            marginLeft: 26 + level * 24,
            transition: "all 0.2s ease",
          }}
        >
          {entity.children.map((child) => (
            <EntityTreeNode
              key={getEntityKey(child)}
              entity={child}
              level={level + 1}
              selectedEntity={selectedEntity}
              onSelect={onSelect}
              searchTerm={searchTerm}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </>
  );
}

/* ────────────────────────────
   EntitySwitcher (main)
   ──────────────────────────── */
export default function EntitySwitcher() {
  const {
    entities,
    entityTree,
    selectedEntity,
    selectEntity,
    loadEntities,
    loadingEntities,
  } = useEntity();

  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set());
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  // Expand all on first open / when tree changes
  useEffect(() => {
    if (entityTree?.length) {
      setExpandedIds(collectExpandableIds(entityTree));
    }
  }, [entityTree]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  // Auto-focus search when open
  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 80);
    }
    if (!open) setSearchTerm("");
  }, [open]);

  const toggleExpand = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelect = (entity) => {
    selectEntity(entity);
    setOpen(false);
    window.location.reload();
  };

  const tree = useMemo(() => entityTree || [], [entityTree]);

  const hasSearchResults = useMemo(() => {
    if (!searchTerm) return true;
    return tree.some((node) => treeMatches(node, searchTerm));
  }, [tree, searchTerm]);

  const meta = selectedEntity ? getMeta(selectedEntity) : null;
  const scopeLabel =
    selectedEntity?.entityType === "parent"
      ? "Group reporting available"
      : selectedEntity?.entityType === "subsidiary"
        ? "Subsidiary individual scope"
        : "Individual business scope";

  /* ──── styles ──── */
  const btnStyle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 18px",
    borderRadius: 16,
    border: "1px solid #e2e8f0",
    background: "white",
    boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 600,
    color: "#0f172a",
    transition: "all 0.2s ease",
    position: "relative",
    whiteSpace: "nowrap",
  };

  const dropdownStyle = {
    position: "absolute",
    right: 0,
    top: "calc(100% + 8px)",
    zIndex: 100,
    width: 420,
    maxWidth: "calc(100vw - 32px)",
    borderRadius: 24,
    border: "1px solid #e2e8f0",
    background: "white",
    boxShadow:
      "0 20px 60px rgba(15,23,42,0.12), 0 4px 16px rgba(15,23,42,0.06)",
    overflow: "hidden",
    animation: "entityDropIn 0.18s ease-out",
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={btnStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#cbd5e1";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(15,23,42,0.10)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#e2e8f0";
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.06)";
        }}
      >
        {meta && (
          <span style={{ fontSize: 16, lineHeight: 1 }}>{meta.icon}</span>
        )}
        <span style={{ color: "#64748b", fontWeight: 500, fontSize: 12 }}>
          Entity
        </span>
        <span
          style={{
            maxWidth: 160,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {selectedEntity?.name || "Select Entity"}
        </span>
        {selectedEntity && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "2px 7px",
              borderRadius: 999,
              background: "#e2e8f0",
              color: "#334155",
              whiteSpace: "nowrap",
            }}
          >
            {scopeLabel}
          </span>
        )}
        {meta && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "2px 7px",
              borderRadius: 999,
              background: meta.bg,
              color: meta.color,
            }}
          >
            {meta.label}
          </span>
        )}
        <span
          style={{
            fontSize: 14,
            color: "#94a3b8",
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            display: "inline-block",
          }}
        >
          ▾
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={dropdownStyle}>
          {/* Header */}
          <div
            style={{
              padding: "16px 20px 12px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 15,
                color: "#0f172a",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Entity Structure
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 12,
                color: "#94a3b8",
                fontWeight: 500,
              }}
            >
              Selecting a parent shows combined data for all subsidiaries.
            </p>
          </div>

          {/* Search */}
          <div
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "0 12px",
                transition: "border-color 0.2s ease",
              }}
            >
              <span style={{ fontSize: 14, color: "#94a3b8" }}>🔍</span>
              <input
                ref={searchRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search entities..."
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  padding: "10px 0",
                  fontSize: 13,
                  fontFamily: "inherit",
                  color: "#0f172a",
                  width: "100%",
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  style={{
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    fontSize: 14,
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Entity list */}
          <div
            style={{
              maxHeight: 340,
              overflowY: "auto",
              padding: "6px 0",
            }}
          >
            {loadingEntities ? (
              /* Loading state */
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    width: 32,
                    height: 32,
                    border: "3px solid #e2e8f0",
                    borderTopColor: "#0f172a",
                    borderRadius: "50%",
                    animation: "entitySpin 0.8s linear infinite",
                  }}
                />
                <p
                  style={{
                    margin: "12px 0 0",
                    fontSize: 13,
                    color: "#94a3b8",
                    fontWeight: 500,
                  }}
                >
                  Loading entities...
                </p>
              </div>
            ) : tree.length === 0 ? (
              /* Empty state */
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                }}
              >
                <span style={{ fontSize: 36 }}>🏗️</span>
                <p
                  style={{
                    margin: "12px 0 4px",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  No entities found. Create your first entity.
                </p>
              </div>
            ) : !hasSearchResults ? (
              <div
                style={{
                  padding: "36px 20px",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "#64748b",
                    fontWeight: 600,
                  }}
                >
                  No entities match your search.
                </p>
              </div>
            ) : (
              /* Tree */
              tree.map((entity) => (
                <EntityTreeNode
                  key={getEntityKey(entity)}
                  entity={entity}
                  level={0}
                  selectedEntity={selectedEntity}
                  onSelect={handleSelect}
                  searchTerm={searchTerm}
                  expandedIds={expandedIds}
                  toggleExpand={toggleExpand}
                />
              ))
            )}
          </div>

          {/* Footer — Create button */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setCreateOpen(true);
                setOpen(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 16px",
                borderRadius: 14,
                border: "none",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(15,23,42,0.18)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 14px rgba(15,23,42,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(15,23,42,0.18)";
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>＋</span>+ Create
              New Entity
            </button>
          </div>
        </div>
      )}

      <CreateEntityModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        entities={entities}
        onCreated={loadEntities}
      />

      {/* Keyframe styles injected once */}
      <style>{`
        @keyframes entityDropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes entitySpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

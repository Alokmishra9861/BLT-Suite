import { useEffect, useState } from "react";
import entityService from "../../services/entity.service";

const initialForm = {
  name: "",
  code: "",
  country: "Cayman Islands",
  currency: "KYD",
  timezone: "America/Cayman",
  entityType: "standalone",
  parentEntity: "",
  allowDirectTransactions: true,
};

/* ──── Entity type card definitions ──── */
const ENTITY_TYPES = [
  {
    value: "standalone",
    title: "Standalone Business",
    icon: "🏬",
    desc: "Independent operating business",
    help: "Independent business, not part of a group.",
  },
  {
    value: "parent",
    title: "Parent / Holding",
    icon: "🏢",
    desc: "Group reporting entity",
    help: "Can consolidate reports from child entities.",
  },
  {
    value: "subsidiary",
    title: "Subsidiary / Child",
    icon: "🧩",
    desc: "Child under another entity",
    help: "Rolls up into a selected parent entity.",
  },
];

/* ──── reusable inline styles ──── */
const S = {
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 1001,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(15,23,42,0.45)",
    backdropFilter: "blur(4px)",
    padding: 16,
    animation: "cemFadeIn 0.2s ease",
  },
  modal: {
    width: "100%",
    maxWidth: 680,
    maxHeight: "90vh",
    borderRadius: 24,
    background: "white",
    boxShadow:
      "0 24px 80px rgba(15,23,42,0.18), 0 4px 16px rgba(15,23,42,0.06)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    animation: "cemSlideUp 0.25s ease-out",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "24px 28px 16px",
    borderBottom: "1px solid #f1f5f9",
  },
  body: {
    padding: "20px 28px 24px",
    overflowY: "auto",
    flex: 1,
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    padding: "16px 28px 20px",
    borderTop: "1px solid #f1f5f9",
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#334155",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    height: 46,
    padding: "0 16px",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: 14,
    fontFamily: "inherit",
    color: "#0f172a",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    background: "white",
  },
  select: {
    width: "100%",
    height: 46,
    padding: "0 16px",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    outline: "none",
    fontSize: 14,
    fontFamily: "inherit",
    color: "#0f172a",
    background: "white",
    cursor: "pointer",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  error: {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#b91c1c",
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 16,
  },
  helpText: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
    lineHeight: 1.5,
    fontWeight: 400,
  },
};

const inputFocusHandler = (e) => {
  e.currentTarget.style.borderColor = "#0f172a";
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(15,23,42,0.06)";
};

const inputBlurHandler = (e) => {
  e.currentTarget.style.borderColor = "#e2e8f0";
  e.currentTarget.style.boxShadow = "none";
};

export default function CreateEntityModal({
  open,
  onClose,
  entities = [],
  onCreated,
}) {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setError("");
      setFieldErrors({});
    }
  }, [open]);

  if (!open) return null;

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setFieldErrors({});

      const nextFieldErrors = {};

      if (!form.name.trim()) {
        nextFieldErrors.name = "Entity name is required";
      }

      const normalizedCode = form.code.trim().toUpperCase();
      if (!normalizedCode) {
        nextFieldErrors.code = "Entity code is required";
      }

      if (form.entityType === "subsidiary" && !form.parentEntity) {
        nextFieldErrors.parentEntity =
          "Parent entity is required for subsidiary";
      }

      if (Object.keys(nextFieldErrors).length > 0) {
        setFieldErrors(nextFieldErrors);
        return;
      }

      const duplicateCode = entities.some(
        (item) => (item.code || "").toUpperCase() === normalizedCode,
      );
      if (duplicateCode) {
        setError(`Entity code \"${normalizedCode}\" already exists`);
        return;
      }

      const payload = {
        name: form.name,
        code: normalizedCode,
        country: form.country,
        currency: form.currency,
        timezone: form.timezone,
        entityType: form.entityType,
        parentEntity:
          form.entityType === "subsidiary" ? form.parentEntity : null,
        isHoldingEntity: form.entityType === "parent",
        allowDirectTransactions:
          form.entityType === "parent" ? form.allowDirectTransactions : true,
      };

      await entityService.createEntity(payload);

      await onCreated?.();
      setForm(initialForm);
      setFieldErrors({});
      setError("");
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create entity");
    } finally {
      setSaving(false);
    }
  };

  const parentOptions = entities.filter(
    (item) => item.entityType === "parent" || item.entityType === "standalone",
  );

  const selectedTypeObj = ENTITY_TYPES.find((t) => t.value === form.entityType);

  return (
    <div
      style={S.backdrop}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={S.modal}>
        {/* Header */}
        <div style={S.header}>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 700,
                color: "#0f172a",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Create New Entity
            </h2>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: "#94a3b8",
                fontWeight: 500,
              }}
            >
              Set up a standalone business, holding company, or subsidiary
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              background: "white",
              cursor: "pointer",
              fontSize: 14,
              color: "#64748b",
              fontFamily: "inherit",
              transition: "all 0.15s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f8fafc";
              e.currentTarget.style.borderColor = "#cbd5e1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleCreate}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <div style={S.body}>
            {error && <div style={S.error}>{error}</div>}

            {/* Entity Type Cards */}
            <div style={{ marginBottom: 24 }}>
              <span
                style={{
                  ...S.label,
                  marginBottom: 12,
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Entity Structure
              </span>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                }}
              >
                {ENTITY_TYPES.map((option) => {
                  const isActive = form.entityType === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField("entityType", option.value)}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        padding: "16px 14px",
                        borderRadius: 16,
                        border: isActive
                          ? "2px solid #0f172a"
                          : "1px solid #e2e8f0",
                        background: isActive
                          ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
                          : "white",
                        color: isActive ? "white" : "#0f172a",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        textAlign: "left",
                        transition: "all 0.2s ease",
                        position: "relative",
                        overflow: "hidden",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = "#cbd5e1";
                          e.currentTarget.style.boxShadow =
                            "0 2px 8px rgba(15,23,42,0.06)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = "#e2e8f0";
                          e.currentTarget.style.boxShadow = "none";
                        }
                      }}
                    >
                      <span style={{ fontSize: 24, marginBottom: 8 }}>
                        {option.icon}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          marginBottom: 4,
                        }}
                      >
                        {option.title}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: isActive ? "rgba(255,255,255,0.7)" : "#94a3b8",
                          lineHeight: 1.4,
                          fontWeight: 400,
                        }}
                      >
                        {option.desc}
                      </span>
                      {isActive && (
                        <span
                          style={{
                            position: "absolute",
                            top: 10,
                            right: 10,
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            background: "white",
                            color: "#0f172a",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Helper text for selected type */}
              {selectedTypeObj && (
                <div
                  style={{
                    marginTop: 10,
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "#f8fafc",
                    border: "1px solid #f1f5f9",
                    fontSize: 12,
                    color: "#64748b",
                    lineHeight: 1.5,
                  }}
                >
                  💡 {selectedTypeObj.help}
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {/* Entity Name */}
              <div>
                <label style={S.label}>Entity Name</label>
                <input
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="e.g. BLT International Group LLC"
                  required
                  style={S.input}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
                {fieldErrors.name && (
                  <p style={{ ...S.helpText, color: "#b91c1c" }}>
                    {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* Code */}
              <div>
                <label style={S.label}>Code</label>
                <input
                  value={form.code}
                  onChange={(e) => updateField("code", e.target.value)}
                  placeholder="e.g. BLT"
                  required
                  style={{ ...S.input, textTransform: "uppercase" }}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
                {fieldErrors.code && (
                  <p style={{ ...S.helpText, color: "#b91c1c" }}>
                    {fieldErrors.code}
                  </p>
                )}
              </div>

              {/* Country */}
              <div>
                <label style={S.label}>Country</label>
                <input
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  style={S.input}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>

              {/* Currency */}
              <div>
                <label style={S.label}>Currency</label>
                <input
                  value={form.currency}
                  onChange={(e) => updateField("currency", e.target.value)}
                  style={S.input}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>

              {/* Timezone */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={S.label}>Timezone</label>
                <input
                  value={form.timezone}
                  onChange={(e) => updateField("timezone", e.target.value)}
                  style={S.input}
                  onFocus={inputFocusHandler}
                  onBlur={inputBlurHandler}
                />
              </div>

              {/* Parent Entity (subsidiary only) */}
              {form.entityType === "subsidiary" && (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={S.label}>Parent Entity</label>
                  <select
                    value={form.parentEntity}
                    onChange={(e) =>
                      updateField("parentEntity", e.target.value)
                    }
                    required
                    style={S.select}
                    onFocus={inputFocusHandler}
                    onBlur={inputBlurHandler}
                  >
                    <option value="">Select parent entity</option>
                    {parentOptions.map((entity) => (
                      <option key={entity._id} value={entity._id}>
                        {entity.name} ({entity.code})
                      </option>
                    ))}
                  </select>
                  <p style={S.helpText}>
                    This entity will roll up into the selected parent for group
                    reports.
                  </p>
                  {fieldErrors.parentEntity && (
                    <p style={{ ...S.helpText, color: "#b91c1c" }}>
                      {fieldErrors.parentEntity}
                    </p>
                  )}
                </div>
              )}

              {/* Direct transactions checkbox (parent only) */}
              {form.entityType === "parent" && (
                <div
                  style={{
                    gridColumn: "1 / -1",
                    padding: "16px 18px",
                    borderRadius: 16,
                    border: "1px solid #f1f5f9",
                    background: "#f8fafc",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.allowDirectTransactions}
                      onChange={(e) =>
                        updateField("allowDirectTransactions", e.target.checked)
                      }
                      style={{
                        marginTop: 2,
                        width: 18,
                        height: 18,
                        accentColor: "#0f172a",
                        cursor: "pointer",
                      }}
                    />
                    <span>
                      <span
                        style={{
                          display: "block",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0f172a",
                        }}
                      >
                        Allow direct transactions for this parent entity
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: 12,
                          color: "#94a3b8",
                          marginTop: 4,
                          lineHeight: 1.5,
                        }}
                      >
                        Turn this off if this parent exists only for
                        consolidated group reporting.
                      </span>
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={S.footer}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "12px 22px",
                borderRadius: 14,
                border: "1px solid #e2e8f0",
                background: "white",
                color: "#334155",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                padding: "12px 28px",
                borderRadius: 14,
                border: "none",
                background: saving
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                color: "white",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: saving ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(15,23,42,0.18)",
                opacity: saving ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 14px rgba(15,23,42,0.25)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(15,23,42,0.18)";
              }}
            >
              {saving ? "Creating..." : "Create Entity"}
            </button>
          </div>
        </form>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes cemFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cemSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          /* Make entity type cards stack on mobile */
        }
      `}</style>
    </div>
  );
}

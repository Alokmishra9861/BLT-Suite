// src/pages/payroll/DeductionTypesPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  getDeductionTypes,
  createDeductionType,
  updateDeductionType,
  deleteDeductionType,
} from "../../services/PayrollApi";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import "../../styles/Payroll.css";

const CATEGORIES = ["pension", "insurance", "tax", "loan", "other"];
const CALC_TYPES = ["fixed", "percentage"];

const EMPTY_FORM = {
  name: "",
  code: "",
  category: "pension",
  calcType: "percentage",
  value: "",
  status: "active",
  entityId: "all",
};

const ENTITIES = [
  "all",
  "BLT International Group LLC",
  "Mall of Cayman",
  "CayEats",
  "CaySearch",
  "Cayman Home Page",
  "Discount Club Cayman",
  "CayBookMe",
  "CayVids",
  "CayMaintenance",
  "CayAuctions",
];

export default function DeductionTypesPage({ activeEntity }) {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // null = create mode
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const clearFilters = () => {
    setFilterCat("");
    setFilterStatus("");
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDeductionTypes(activeEntity || undefined);
      // Ensure data is always an array
      setTypes(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load deduction types.");
      setTypes([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  }, [activeEntity]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    // Use activeEntity._id directly; it's set at the system level
    setForm({ ...EMPTY_FORM, entityId: activeEntity || "all" });
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (dt) => {
    setEditing(dt);
    setForm({
      name: dt.name,
      code: dt.code,
      category: dt.category,
      calcType: dt.calcType,
      value: dt.value,
      status: dt.status,
      entityId: dt.entityId,
    });
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.code.trim() || form.value === "") {
      setFormError("Name, code, and value are required.");
      return;
    }
    if (isNaN(Number(form.value)) || Number(form.value) < 0) {
      setFormError("Value must be a positive number.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = { ...form, value: Number(form.value) };
      if (editing) {
        await updateDeductionType(editing._id, payload);
      } else {
        await createDeductionType(payload);
      }
      closeModal();
      await load();
    } catch (e) {
      setFormError(e.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this deduction type? This cannot be undone."))
      return;
    try {
      await deleteDeductionType(id);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed.");
    }
  };

  const handleToggleStatus = async (dt) => {
    try {
      await updateDeductionType(dt._id, {
        status: dt.status === "active" ? "inactive" : "active",
      });
      await load();
    } catch (e) {
      alert("Status update failed.");
    }
  };

  // ── Filters ────────────────────────────────────────────────────────────
  let visible = types || [];
  if (filterCat) visible = visible.filter((t) => t.category === filterCat);
  if (filterStatus) visible = visible.filter((t) => t.status === filterStatus);

  return (
    <div className="pr-page">
      {/* ── Header ── */}
      <div className="pr-page-header">
        <div>
          <div className="pr-page-title">Deduction Types</div>
          <div className="pr-page-subtitle">
            Define reusable deduction templates applied during payroll
          </div>
        </div>
        <button className="pr-btn pr-btn-primary" onClick={openCreate}>
          + New Deduction Type
        </button>
      </div>

      {error && <div className="pr-alert pr-alert-red">⚠ {error}</div>}

      {/* ── Panel ── */}
      <div className="pr-panel">
        {/* Toolbar */}
        <div className="pr-toolbar">
          <select
            className="pr-select"
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <select
            className="pr-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <div className="pr-toolbar-meta">
            <button
              type="button"
              className="pr-view-all"
              onClick={clearFilters}
            >
              View all
            </button>
            <span className="pr-count">
              {visible.length} type{visible.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="pr-loading">
            <div className="pr-spinner" /> Loading…
          </div>
        ) : (
          <div className="pr-table-wrap">
            <table className="pr-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Calculation</th>
                  <th className="right">Value</th>
                  <th>Entity</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!visible.length && (
                  <tr className="empty-row">
                    <td colSpan={8}>No deduction types found.</td>
                  </tr>
                )}
                {visible.map((dt) => (
                  <tr key={dt._id}>
                    <td className="bold">{dt.name}</td>
                    <td className="mono">{dt.code}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span className={`pr-cat-dot ${dt.category}`} />
                        <Badge value={dt.category} />
                      </span>
                    </td>
                    <td style={{ textTransform: "capitalize", fontSize: 12 }}>
                      {dt.calcType}
                    </td>
                    <td className="right pr-ci">
                      {dt.calcType === "percentage"
                        ? `${dt.value}%`
                        : `CI$ ${dt.value.toFixed(2)}`}
                    </td>
                    <td style={{ fontSize: 11, color: "var(--muted)" }}>
                      {dt.entityId === "all" ? "All Entities" : "This Entity"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span
                        style={{
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                        onClick={() => handleToggleStatus(dt)}
                        title="Click to toggle"
                      >
                        <span className={`pr-status-dot ${dt.status}`} />
                        <Badge value={dt.status} />
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="pr-btn pr-btn-ghost"
                          onClick={() => openEdit(dt)}
                        >
                          Edit
                        </button>
                        <button
                          className="pr-btn pr-btn-ghost"
                          style={{ color: "var(--red)" }}
                          onClick={() => handleDelete(dt._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editing ? `Edit — ${editing.name}` : "New Deduction Type"}
        footer={
          <>
            <button className="pr-btn" onClick={closeModal}>
              Cancel
            </button>
            <button
              className="pr-btn pr-btn-primary"
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Type"}
            </button>
          </>
        }
      >
        {formError && (
          <div className="pr-alert pr-alert-red">⚠ {formError}</div>
        )}

        <div className="pr-form-grid">
          <div className="pr-form-row">
            <label className="pr-form-label">Name</label>
            <input
              className="pr-form-input"
              placeholder="e.g. Pension — Employee"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="pr-form-row">
            <label className="pr-form-label">Code</label>
            <input
              className="pr-form-input"
              placeholder="e.g. PEN-EMP"
              value={form.code}
              onChange={(e) =>
                setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))
              }
            />
          </div>
        </div>

        <div className="pr-form-grid">
          <div className="pr-form-row">
            <label className="pr-form-label">Category</label>
            <select
              className="pr-form-input"
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({ ...p, category: e.target.value }))
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="pr-form-row">
            <label className="pr-form-label">Calculation Type</label>
            <select
              className="pr-form-input"
              value={form.calcType}
              onChange={(e) =>
                setForm((p) => ({ ...p, calcType: e.target.value }))
              }
            >
              {CALC_TYPES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pr-form-grid">
          <div className="pr-form-row">
            <label className="pr-form-label">
              Value{" "}
              {form.calcType === "percentage" ? "(%)" : "(CI$ fixed amount)"}
            </label>
            <input
              className="pr-form-input"
              type="number"
              min="0"
              step="0.01"
              placeholder={
                form.calcType === "percentage" ? "e.g. 5" : "e.g. 200"
              }
              value={form.value}
              onChange={(e) =>
                setForm((p) => ({ ...p, value: e.target.value }))
              }
            />
          </div>
          <div className="pr-form-row">
            <label className="pr-form-label">Status</label>
            <select
              className="pr-form-input"
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value }))
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="pr-form-row">
          <label className="pr-form-label">Entity Scope</label>
          <select
            className="pr-form-input"
            value={form.entityId}
            onChange={(e) =>
              setForm((p) => ({ ...p, entityId: e.target.value }))
            }
          >
            {activeEntity && <option value={activeEntity}>This Entity</option>}
            <option value="all">All Entities (Global)</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}

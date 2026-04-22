// src/pages/payroll/EmployeeDeductionsPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api";
import {
  getEmployeeDeductions,
  createEmployeeDeduction,
  updateEmployeeDeduction,
  deleteEmployeeDeduction,
  getDeductionTypes,
} from "../../services/PayrollApi";
import Modal from "../../components/common/Modal";
import Badge from "../../components/common/Badge";
import "../../styles/Payroll.css";

const fmt = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const EMPTY_FORM = {
  employeeId: "",
  deductionTypeId: "",
  customAmount: "",
  customPct: "",
  startDate: "",
  endDate: "",
  status: "active",
  entityId: "",
};

export default function EmployeeDeductionsPage({ activeEntity }) {
  const [deductions, setDeductions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [dedTypes, setDedTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterEmp, setFilterEmp] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (activeEntity) params.entityId = activeEntity;
      const [deds, types, empResp] = await Promise.all([
        getEmployeeDeductions(params),
        getDeductionTypes(activeEntity || undefined),
        activeEntity
          ? api
              .get(`/entities/${activeEntity}/employees`, {
                params: { status: "active" },
              })
              .then((r) => r.data.data?.employees || r.data.data || r.data)
              .catch(() => [])
          : Promise.resolve([]),
      ]);
      // Ensure all data are arrays
      setDeductions(Array.isArray(deds) ? deds : []);
      setDedTypes(Array.isArray(types) ? types : []);
      setEmployees(Array.isArray(empResp) ? empResp : []);
    } catch (e) {
      setError(
        e.response?.data?.message || "Failed to load employee deductions.",
      );
      setDeductions([]);
      setDedTypes([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [activeEntity]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, entityId: activeEntity || "" });
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({
      employeeId: d.employeeId?._id || d.employeeId,
      deductionTypeId: d.deductionTypeId?._id || d.deductionTypeId,
      customAmount: d.customAmount ?? "",
      customPct: d.customPct ?? "",
      startDate: d.startDate ? d.startDate.split("T")[0] : "",
      endDate: d.endDate ? d.endDate.split("T")[0] : "",
      status: d.status,
      entityId: d.entityId,
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
    if (
      !form.employeeId ||
      !form.deductionTypeId ||
      !form.startDate ||
      !form.entityId
    ) {
      setFormError(
        "Employee, deduction type, start date, and entity are required.",
      );
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const payload = {
        ...form,
        customAmount:
          form.customAmount !== "" ? Number(form.customAmount) : null,
        customPct: form.customPct !== "" ? Number(form.customPct) : null,
        endDate: form.endDate || null,
      };
      if (editing) {
        await updateEmployeeDeduction(editing._id, payload);
      } else {
        await createEmployeeDeduction(payload);
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
    if (!window.confirm("Remove this deduction assignment?")) return;
    try {
      await deleteEmployeeDeduction(id);
      await load();
    } catch (e) {
      alert(e.response?.data?.message || "Delete failed.");
    }
  };

  const handleToggleStatus = async (d) => {
    try {
      await updateEmployeeDeduction(d._id, {
        status: d.status === "active" ? "inactive" : "active",
      });
      await load();
    } catch (_) {
      alert("Status update failed.");
    }
  };

  // ── Filters ────────────────────────────────────────────────────────────
  let visible = deductions || [];
  if (filterEmp)
    visible = visible.filter(
      (d) => (d.employeeId?._id || d.employeeId) === filterEmp,
    );
  if (filterStatus) visible = visible.filter((d) => d.status === filterStatus);
  if (search) {
    const q = search.toLowerCase();
    visible = visible.filter((d) => {
      const empName = d.employeeId
        ? `${d.employeeId.firstName} ${d.employeeId.lastName}`.toLowerCase()
        : "";
      const typeName = (d.deductionTypeId?.name || "").toLowerCase();
      return empName.includes(q) || typeName.includes(q);
    });
  }

  return (
    <div className="pr-page">
      {/* ── Header ── */}
      <div className="pr-page-header">
        <div>
          <div className="pr-page-title">Employee Deductions</div>
          <div className="pr-page-subtitle">
            Assign deduction types to specific employees
          </div>
        </div>
        <button className="pr-btn pr-btn-primary" onClick={openCreate}>
          + Assign Deduction
        </button>
      </div>

      {error && <div className="pr-alert pr-alert-red">⚠ {error}</div>}

      <div className="pr-panel">
        {/* Toolbar */}
        <div className="pr-toolbar">
          <input
            className="pr-search"
            placeholder="Search employee or deduction…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="pr-select"
            value={filterEmp}
            onChange={(e) => setFilterEmp(e.target.value)}
          >
            <option value="">All Employees</option>
            {employees.map((e) => (
              <option key={e._id} value={e._id}>
                {e.firstName} {e.lastName}
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
          <span
            style={{ fontSize: 11, color: "var(--muted)", marginLeft: "auto" }}
          >
            {visible.length} assignment{visible.length !== 1 ? "s" : ""}
          </span>
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
                  <th>Employee</th>
                  <th>Deduction Type</th>
                  <th>Category</th>
                  <th>Override Amount</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {!visible.length && (
                  <tr className="empty-row">
                    <td colSpan={8}>No deduction assignments found.</td>
                  </tr>
                )}
                {visible.map((d) => {
                  const emp = d.employeeId;
                  const dt = d.deductionTypeId;
                  const override =
                    d.customAmount != null
                      ? `CI$ ${Number(d.customAmount).toFixed(2)} (fixed)`
                      : d.customPct != null
                        ? `${d.customPct}% (custom)`
                        : "—  (use type default)";
                  return (
                    <tr key={d._id}>
                      <td>
                        {emp ? (
                          <>
                            <div style={{ fontWeight: 700 }}>
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div
                              style={{ fontSize: 10, color: "var(--muted)" }}
                            >
                              {emp.jobTitle}
                            </div>
                          </>
                        ) : (
                          <span style={{ color: "var(--muted)" }}>Unknown</span>
                        )}
                      </td>
                      <td className="bold">{dt?.name || "—"}</td>
                      <td>
                        {dt?.category && (
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <span className={`pr-cat-dot ${dt.category}`} />
                            <Badge value={dt.category} />
                          </span>
                        )}
                      </td>
                      <td
                        style={{
                          fontSize: 12,
                          color:
                            d.customAmount != null || d.customPct != null
                              ? "var(--navy)"
                              : "var(--muted)",
                        }}
                      >
                        {override}
                      </td>
                      <td>{fmt(d.startDate)}</td>
                      <td
                        style={{
                          color: d.endDate ? "var(--red)" : "var(--muted)",
                        }}
                      >
                        {fmt(d.endDate)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          style={{
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                          onClick={() => handleToggleStatus(d)}
                          title="Click to toggle"
                        >
                          <span className={`pr-status-dot ${d.status}`} />
                          <Badge value={d.status} />
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="pr-btn pr-btn-ghost"
                            onClick={() => openEdit(d)}
                          >
                            Edit
                          </button>
                          <button
                            className="pr-btn pr-btn-ghost"
                            style={{ color: "var(--red)" }}
                            onClick={() => handleDelete(d._id)}
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Assign / Edit Modal ── */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={
          editing ? "Edit Deduction Assignment" : "Assign Deduction to Employee"
        }
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
              {saving
                ? "Saving…"
                : editing
                  ? "Save Changes"
                  : "Assign Deduction"}
            </button>
          </>
        }
      >
        {formError && (
          <div className="pr-alert pr-alert-red">⚠ {formError}</div>
        )}

        <div className="pr-form-row">
          <label className="pr-form-label">Employee</label>
          <select
            className="pr-form-input"
            value={form.employeeId}
            onChange={(e) => {
              const emp = employees.find((x) => x._id === e.target.value);
              setForm((p) => ({
                ...p,
                employeeId: e.target.value,
                entityId: emp?.entityId || p.entityId,
              }));
            }}
          >
            <option value="">— Select employee —</option>
            {employees.map((e) => (
              <option key={e._id} value={e._id}>
                {e.firstName} {e.lastName} — {e.jobTitle}
              </option>
            ))}
          </select>
        </div>

        <div className="pr-form-row">
          <label className="pr-form-label">Deduction Type</label>
          <select
            className="pr-form-input"
            value={form.deductionTypeId}
            onChange={(e) =>
              setForm((p) => ({ ...p, deductionTypeId: e.target.value }))
            }
          >
            <option value="">— Select deduction type —</option>
            {dedTypes
              .filter((t) => t.status === "active")
              .map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} (
                  {t.calcType === "percentage"
                    ? `${t.value}%`
                    : `CI$ ${t.value}`}
                  )
                </option>
              ))}
          </select>
        </div>

        <div className="pr-section-div">
          Override (leave blank to use type default)
        </div>

        <div className="pr-form-grid">
          <div className="pr-form-row">
            <label className="pr-form-label">Custom Fixed Amount (CI$)</label>
            <input
              className="pr-form-input"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 150"
              value={form.customAmount}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  customAmount: e.target.value,
                  customPct: "",
                }))
              }
            />
          </div>
          <div className="pr-form-row">
            <label className="pr-form-label">Custom Percentage (%)</label>
            <input
              className="pr-form-input"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="e.g. 3.5"
              value={form.customPct}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  customPct: e.target.value,
                  customAmount: "",
                }))
              }
            />
          </div>
        </div>

        <div className="pr-form-grid">
          <div className="pr-form-row">
            <label className="pr-form-label">Start Date</label>
            <input
              className="pr-form-input"
              type="date"
              value={form.startDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, startDate: e.target.value }))
              }
            />
          </div>
          <div className="pr-form-row">
            <label className="pr-form-label">End Date (optional)</label>
            <input
              className="pr-form-input"
              type="date"
              value={form.endDate}
              onChange={(e) =>
                setForm((p) => ({ ...p, endDate: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="pr-form-row">
          <label className="pr-form-label">Status</label>
          <select
            className="pr-form-input"
            value={form.status}
            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Modal>
    </div>
  );
}

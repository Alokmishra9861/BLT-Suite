import api from "./api";

// ── Deduction Types ────────────────────────────────────────────────────────
export const getDeductionTypes = (entityId) =>
  api
    .get("/deduction-types", { params: { entityId } })
    .then((r) => r.data.data);

export const createDeductionType = (payload) =>
  api.post("/deduction-types", payload).then((r) => r.data.data);

export const updateDeductionType = (id, payload) =>
  api.put(`/deduction-types/${id}`, payload).then((r) => r.data.data);

export const deleteDeductionType = (id) =>
  api.delete(`/deduction-types/${id}`).then((r) => r.data);

// ── Employee Deductions ────────────────────────────────────────────────────
export const getEmployeeDeductions = (params) =>
  api.get("/employee-deductions", { params }).then((r) => r.data.data);

export const createEmployeeDeduction = (payload) =>
  api.post("/employee-deductions", payload).then((r) => r.data.data);

export const updateEmployeeDeduction = (id, payload) =>
  api.put(`/employee-deductions/${id}`, payload).then((r) => r.data.data);

export const deleteEmployeeDeduction = (id) =>
  api.delete(`/employee-deductions/${id}`).then((r) => r.data);

// ── Payroll Runs ──────────────────────────────────────────────────────────
export const getPayrollRuns = (params) =>
  api.get("/payroll-runs", { params }).then((r) => r.data.data);

export const getPayrollRun = (id) =>
  api.get(`/payroll-runs/${id}`).then((r) => r.data.data);

export const createPayrollRun = (payload) =>
  api.post("/payroll-runs", payload).then((r) => r.data.data);

export const updatePayrollRun = (id, payload) =>
  api.put(`/payroll-runs/${id}`, payload).then((r) => r.data.data);

export const deletePayrollRun = (id) =>
  api.delete(`/payroll-runs/${id}`).then((r) => r.data);

export const processPayrollRun = (id) =>
  api.post(`/payroll-runs/${id}/process`).then((r) => r.data.data);

export const postPayrollRun = (id) =>
  api.post(`/payroll-runs/${id}/post`).then((r) => r.data.data);

export const getPayrollLines = (id) =>
  api.get(`/payroll-runs/${id}/lines`).then((r) => r.data.data);

export const getPayrollSummary = (id) =>
  api.get(`/payroll-runs/${id}/summary`).then((r) => r.data.data);

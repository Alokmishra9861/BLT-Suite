import api from "./api";

// ── Chart of Accounts ────────────────────────────────────────────────────────
export const getAccounts = (params = {}) =>
  api.get("/accounting/accounts", { params });

export const createAccount = (data) => api.post("/accounting/accounts", data);

export const updateAccount = (accountId, data) =>
  api.patch(`/accounting/accounts/${accountId}`, data);

export const deleteAccount = (accountId) =>
  api.delete(`/accounting/accounts/${accountId}`);

export const getAccountBalance = (accountId, params = {}) =>
  api.get(`/accounting/accounts/${accountId}/balance`, { params });

export const getAccountLedger = (accountId, params = {}) =>
  api.get(`/accounting/accounts/${accountId}/ledger`, { params });

// ── Journal Entries ───────────────────────────────────────────────────────────
export const getJournals = (params = {}) =>
  api.get("/accounting/journals", { params });

export const getJournal = (journalId) =>
  api.get(`/accounting/journals/${journalId}`);

export const createJournal = (data) => api.post("/accounting/journals", data);

export const updateJournal = (journalId, data) =>
  api.patch(`/accounting/journals/${journalId}`, data);

export const postJournal = (journalId) =>
  api.post(`/accounting/journals/${journalId}/post`);

export const reverseJournal = (journalId, data = {}) =>
  api.post(`/accounting/journals/${journalId}/reverse`, data);

export const voidJournal = (journalId) =>
  api.post(`/accounting/journals/${journalId}/void`);

// ── Periods ───────────────────────────────────────────────────────────────────
export const getPeriods = () => api.get("/accounting/periods");

// ── Reports ───────────────────────────────────────────────────────────────────
export const getTrialBalance = (params = {}) =>
  api.get("/accounting/reports/trial-balance", { params });

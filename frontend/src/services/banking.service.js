import api from "./api";

const bankingService = {
  getBankAccounts: async (params = {}) => {
    const response = await api.get("/bank-accounts", { params });
    return response.data;
  },

  getBankAccountById: async (id) => {
    const response = await api.get(`/bank-accounts/${id}`);
    return response.data;
  },

  createBankAccount: async (payload) => {
    const response = await api.post("/bank-accounts", payload);
    return response.data;
  },

  updateBankAccount: async (id, payload) => {
    const response = await api.put(`/bank-accounts/${id}`, payload);
    return response.data;
  },

  deleteBankAccount: async (id) => {
    const response = await api.delete(`/bank-accounts/${id}`);
    return response.data;
  },

  getCashPosition: async () => {
    const response = await api.get("/bank-accounts/cash-position");
    return response.data;
  },

  getBankTransactions: async (params = {}) => {
    const response = await api.get("/bank-transactions", { params });
    return response.data;
  },

  getBankTransactionById: async (id) => {
    const response = await api.get(`/bank-transactions/${id}`);
    return response.data;
  },

  createBankTransaction: async (payload) => {
    const response = await api.post("/bank-transactions", payload);
    return response.data;
  },

  updateBankTransaction: async (id, payload) => {
    const response = await api.put(`/bank-transactions/${id}`, payload);
    return response.data;
  },

  deleteBankTransaction: async (id) => {
    const response = await api.delete(`/bank-transactions/${id}`);
    return response.data;
  },

  getReconciliations: async (params = {}) => {
    const response = await api.get("/bank-reconciliations", { params });
    return response.data;
  },

  getReconciliationById: async (id) => {
    const response = await api.get(`/bank-reconciliations/${id}`);
    return response.data;
  },

  createReconciliation: async (payload) => {
    const response = await api.post("/bank-reconciliations", payload);
    return response.data;
  },

  addReconciliationItem: async (id, payload) => {
    const response = await api.post(
      `/bank-reconciliations/${id}/items`,
      payload,
    );
    return response.data;
  },

  completeReconciliation: async (id) => {
    const response = await api.post(`/bank-reconciliations/${id}/complete`);
    return response.data;
  },
};

export default bankingService;

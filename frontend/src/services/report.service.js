import api from "./api";

const reportService = {
  getProfitAndLoss: async (params = {}) => {
    const response = await api.get("/reports/profit-loss", { params });
    return response.data;
  },

  getBalanceSheet: async (params = {}) => {
    const response = await api.get("/reports/balance-sheet", { params });
    return response.data;
  },

  getCashFlow: async (params = {}) => {
    const response = await api.get("/reports/cash-flow", { params });
    return response.data;
  },

  getTrialBalance: async (params = {}) => {
    const response = await api.get("/reports/trial-balance", { params });
    return response.data;
  },

  getHrSummary: async (params = {}) => {
    const response = await api.get("/reports/hr-summary", { params });
    return response.data;
  },
};

export default reportService;

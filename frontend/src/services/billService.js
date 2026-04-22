import axiosInstance from "./api";

const BASE_URL = "/entities";

export const billService = {
  // Get all bills with pagination and filters
  getBills: async (entityId, params = {}) => {
    const { data } = await axiosInstance.get(`${BASE_URL}/${entityId}/bills`, {
      params,
    });
    return data.data;
  },

  // Get bill summary
  getBillSummary: async (entityId) => {
    const { data } = await axiosInstance.get(
      `${BASE_URL}/${entityId}/bills/summary`,
    );
    return data.data;
  },

  // Create new bill
  createBill: async (entityId, billData) => {
    const { data } = await axiosInstance.post(
      `${BASE_URL}/${entityId}/bills`,
      billData,
    );
    return data.data;
  },

  // Get single bill
  getBill: async (entityId, billId) => {
    const { data } = await axiosInstance.get(
      `${BASE_URL}/${entityId}/bills/${billId}`,
    );
    return data.data;
  },

  // Update bill
  updateBill: async (entityId, billId, billData) => {
    const { data } = await axiosInstance.put(
      `${BASE_URL}/${entityId}/bills/${billId}`,
      billData,
    );
    return data.data;
  },

  // Delete bill
  deleteBill: async (entityId, billId) => {
    const { data } = await axiosInstance.delete(
      `${BASE_URL}/${entityId}/bills/${billId}`,
    );
    return data;
  },

  // Approve bill
  approveBill: async (entityId, billId) => {
    const { data } = await axiosInstance.patch(
      `${BASE_URL}/${entityId}/bills/${billId}/approve`,
    );
    return data.data;
  },

  // Void bill
  voidBill: async (entityId, billId) => {
    const { data } = await axiosInstance.patch(
      `${BASE_URL}/${entityId}/bills/${billId}/void`,
    );
    return data.data;
  },
};

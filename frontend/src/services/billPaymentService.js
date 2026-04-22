import axiosInstance from "./api";

const BASE_URL = "/entities";

export const billPaymentService = {
  // Get all bill payments with pagination and filters
  getPayments: async (entityId, params = {}) => {
    const { data } = await axiosInstance.get(
      `${BASE_URL}/${entityId}/bill-payments`,
      { params },
    );
    return data.data;
  },

  // Create new bill payment
  createPayment: async (entityId, paymentData) => {
    const { data } = await axiosInstance.post(
      `${BASE_URL}/${entityId}/bill-payments`,
      paymentData,
    );
    return data.data;
  },

  // Get single payment
  getPayment: async (entityId, paymentId) => {
    const { data } = await axiosInstance.get(
      `${BASE_URL}/${entityId}/bill-payments/${paymentId}`,
    );
    return data.data;
  },
};

import axiosInstance from "./api";

const BASE_URL = "/entities";

export const invoicePaymentService = {
  // Get all invoice payments with pagination and filters
  getPayments: async (entityId, params = {}) => {
    const { data } = await axiosInstance.get(
      `${BASE_URL}/${entityId}/invoice-payments`,
      { params },
    );
    return data.data;
  },

  // Create new invoice payment
  createPayment: async (entityId, paymentData) => {
    const { data } = await axiosInstance.post(
      `${BASE_URL}/${entityId}/invoice-payments`,
      paymentData,
    );
    return data.data;
  },

  // Get single payment
  getPayment: async (entityId, paymentId) => {
    const { data } = await axiosInstance.get(
      `${BASE_URL}/${entityId}/invoice-payments/${paymentId}`,
    );
    return data.data;
  },
};

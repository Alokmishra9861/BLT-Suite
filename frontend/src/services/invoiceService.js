import axiosInstance from "./api";

const BASE_URL = "/entities";

export const invoiceService = {
  // Get all invoices with pagination and filters
  getInvoices: async (entityId, params = {}) => {
    const { data } = await axiosInstance.get(
      `${BASE_URL}/${entityId}/invoices`,
      { params },
    );
    return data.data;
  },

  // Get invoice summary
  getInvoiceSummary: async (entityId) => {
    const { data } = await axiosInstance.get(
      `${BASE_URL}/${entityId}/invoices/summary`,
    );
    return data.data;
  },

  // Create new invoice
  createInvoice: async (entityId, invoiceData) => {
    const { data } = await axiosInstance.post(
      `${BASE_URL}/${entityId}/invoices`,
      invoiceData,
    );
    return data.data;
  },

  // Get single invoice
  getInvoice: async (entityId, invoiceId) => {
    const { data } = await axiosInstance.get(
      `${BASE_URL}/${entityId}/invoices/${invoiceId}`,
    );
    return data.data;
  },

  // Update invoice
  updateInvoice: async (entityId, invoiceId, invoiceData) => {
    const { data } = await axiosInstance.put(
      `${BASE_URL}/${entityId}/invoices/${invoiceId}`,
      invoiceData,
    );
    return data.data;
  },

  // Delete invoice
  deleteInvoice: async (entityId, invoiceId) => {
    const { data } = await axiosInstance.delete(
      `${BASE_URL}/${entityId}/invoices/${invoiceId}`,
    );
    return data;
  },

  // Send invoice
  sendInvoice: async (entityId, invoiceId) => {
    const { data } = await axiosInstance.patch(
      `${BASE_URL}/${entityId}/invoices/${invoiceId}/send`,
    );
    return data.data;
  },

  // Void invoice
  voidInvoice: async (entityId, invoiceId) => {
    const { data } = await axiosInstance.patch(
      `${BASE_URL}/${entityId}/invoices/${invoiceId}/void`,
    );
    return data.data;
  },
};

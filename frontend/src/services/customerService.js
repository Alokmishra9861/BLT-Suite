import axiosInstance from "./api";

const BASE_URL = "/entities";

export const customerService = {
  // Get all customers with pagination and filters
  getCustomers: async (entityId, params = {}) => {
    const { data } = await axiosInstance.get(
      `${BASE_URL}/${entityId}/customers`,
      { params },
    );
    return data.data;
  },

  // Create new customer
  createCustomer: async (entityId, customerData) => {
    const { data } = await axiosInstance.post(
      `${BASE_URL}/${entityId}/customers`,
      customerData,
    );
    return data.data;
  },

  // Get single customer
  getCustomer: async (entityId, customerId) => {
    const { data } = await axiosInstance.get(
      `${BASE_URL}/${entityId}/customers/${customerId}`,
    );
    return data.data;
  },

  // Update customer
  updateCustomer: async (entityId, customerId, customerData) => {
    const { data } = await axiosInstance.put(
      `${BASE_URL}/${entityId}/customers/${customerId}`,
      customerData,
    );
    return data.data;
  },

  // Delete customer
  deleteCustomer: async (entityId, customerId) => {
    const { data } = await axiosInstance.delete(
      `${BASE_URL}/${entityId}/customers/${customerId}`,
    );
    return data;
  },
};

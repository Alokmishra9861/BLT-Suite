import axiosInstance from "./api";

const BASE_URL = "/entities";

export const vendorService = {
  // Get all vendors with pagination and filters
  getVendors: async (entityId, params = {}) => {
    const { data } = await axiosInstance.get(
      `${BASE_URL}/${entityId}/vendors`,
      { params },
    );
    return data.data;
  },

  // Create new vendor
  createVendor: async (entityId, vendorData) => {
    const { data } = await axiosInstance.post(
      `${BASE_URL}/${entityId}/vendors`,
      vendorData,
    );
    return data.data;
  },

  // Get single vendor
  getVendor: async (entityId, vendorId) => {
    const { data } = await axiosInstance.get(
      `${BASE_URL}/${entityId}/vendors/${vendorId}`,
    );
    return data.data;
  },

  // Update vendor
  updateVendor: async (entityId, vendorId, vendorData) => {
    const { data } = await axiosInstance.put(
      `${BASE_URL}/${entityId}/vendors/${vendorId}`,
      vendorData,
    );
    return data.data;
  },

  // Delete vendor
  deleteVendor: async (entityId, vendorId) => {
    const { data } = await axiosInstance.delete(
      `${BASE_URL}/${entityId}/vendors/${vendorId}`,
    );
    return data;
  },
};

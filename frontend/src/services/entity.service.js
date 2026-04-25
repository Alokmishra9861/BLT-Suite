import api from "./api.js";

export const getEntitiesPublic = async () => {
  const response = await api.get("/entities/public");
  return response.data.data;
};

export const getEntities = async () => {
  const response = await api.get("/entities");
  return response.data.data;
};

export const getEntityTree = async () => {
  const response = await api.get("/entities/tree");
  return response.data.data;
};

export const getEntityById = async (id) => {
  const response = await api.get(`/entities/${id}`);
  return response.data.data;
};

export const createEntity = async (data) => {
  const response = await api.post("/entities", data);
  return response.data.data;
};

export const updateEntity = async (id, data) => {
  const response = await api.put(`/entities/${id}`, data);
  return response.data.data;
};

export const deleteEntity = async (id) => {
  const response = await api.delete(`/entities/${id}`);
  return response.data.data;
};

export default {
  getEntitiesPublic,
  getEntities,
  getEntityTree,
  getEntityById,
  createEntity,
  updateEntity,
  deleteEntity,
};

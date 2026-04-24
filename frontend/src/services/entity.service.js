import api from "./api.js";

export const getEntities = async () => {
  const response = await api.get("/entities");
  console.log(response.data.data);
  return response.data.data;
};

export const createEntity = async (data) => {
  const response = await api.post("/entities", data);
  return response.data.data;
};

export default {
  getEntities,
  createEntity,
};

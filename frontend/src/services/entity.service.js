import api from "./api.js";

export const getEntities = async () => {
  const response = await api.get("/entities");
  return response.data.data;
};

export default {
  getEntities,
};

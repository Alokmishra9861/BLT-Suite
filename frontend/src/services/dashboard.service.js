import api from "./api.js";

const getSummary = async () => {
  const response = await api.get("/dashboard/summary");
  return response.data.data;
};

export default {
  getSummary,
};

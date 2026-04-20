import api from "./api.js";

const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data.data;
};

const me = async () => {
  const response = await api.get("/auth/me");
  return response.data.data;
};

export default {
  login,
  me,
};

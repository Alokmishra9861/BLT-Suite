import api from "./api.js";

const login = async (email, password, entityId) => {
  const body = { email, password };
  if (entityId) body.entityId = entityId;
  const response = await api.post("/auth/login", body);
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

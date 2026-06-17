import axios from "axios";

export const TOKEN_KEY = "selfcare_token";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "");

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`
});

api.interceptors.request.use((config) => {
  // TODO: Move JWT storage to httpOnly cookies before production.
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const authService = {
  register: async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },
  login: async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },
  me: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  }
};

export const goalService = {
  list: async () => {
    const { data } = await api.get("/goals");
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post("/goals", payload);
    return data;
  },
  get: async (id) => {
    const { data } = await api.get(`/goals/${id}`);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/goals/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/goals/${id}`);
    return data;
  }
};

export const taskService = {
  today: async () => {
    const { data } = await api.get("/tasks/today");
    return data;
  },
  generate: async () => {
    const { data } = await api.post("/tasks/generate");
    return data;
  },
  toggle: async (id) => {
    const { data } = await api.put(`/tasks/${id}/toggle`);
    return data;
  },
  history: async () => {
    const { data } = await api.get("/tasks/history");
    return data;
  }
};

export const checkInService = {
  create: async (payload) => {
    const { data } = await api.post("/checkins", payload);
    return data;
  },
  list: async () => {
    const { data } = await api.get("/checkins");
    return data;
  },
  summary: async () => {
    const { data } = await api.get("/checkins/summary");
    return data;
  }
};

export default api;

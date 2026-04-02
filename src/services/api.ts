import axios from "axios";
import { clearAdminTabToken, getAdminTabToken } from "./adminTabSession";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const tabToken = getAdminTabToken();

    if (tabToken) {
      config.headers = config.headers ?? {};
      config.headers["X-Admin-Tab-Token"] = tabToken;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      clearAdminTabToken();

      if (window.location.pathname.startsWith("/admin-dashboard")) {
        window.location.href = "/shubh-dev";
      }
    }

    return Promise.reject(error);
  }
);

export default api;

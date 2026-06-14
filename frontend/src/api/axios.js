import axios from "axios";

const stringifyErrorValue = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);

  if (Array.isArray(value)) {
    return value.map(stringifyErrorValue).filter(Boolean).join(" ");
  }

  if (typeof value === "object") {
    return (
      stringifyErrorValue(value.message) ||
      stringifyErrorValue(value.error) ||
      stringifyErrorValue(value.detail) ||
      stringifyErrorValue(value.title) ||
      JSON.stringify(value)
    );
  }

  return String(value);
};

export const getApiErrorMessage = (error, fallback = "Request failed. Please try again.") => {
  const data = error?.response?.data;
  return (
    stringifyErrorValue(data?.detail) ||
    stringifyErrorValue(data?.error) ||
    stringifyErrorValue(data?.message) ||
    stringifyErrorValue(data) ||
    stringifyErrorValue(error?.message) ||
    fallback
  );
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/gateway" : "http://localhost:9000/gateway"),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error?.config?.url || "";

    if (error?.response?.status === 401 && !requestUrl.includes("/auth/")) {
      sessionStorage.removeItem("activeSession");
      localStorage.removeItem("token");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
      localStorage.removeItem("name");

      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;

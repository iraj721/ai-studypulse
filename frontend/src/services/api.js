import axios from "axios";

// ✅ Define API URL with fallback
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL.replace(/\/$/, "") + "/api",  // ✅ Use API_URL here
});

// Add Authorization header ONLY for protected routes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  const publicRoutes = ["/auth/login", "/auth/register"];

  const isPublicRoute = publicRoutes.some((route) =>
    config.url.includes(route)
  );

  if (token && !isPublicRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

// Handle responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes("/login")
    ) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
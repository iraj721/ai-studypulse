import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL.replace(/\/$/, "") + "/api",
});

// ✅ Add Authorization header ONLY for protected routes
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

// ✅ Handle responses globally
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

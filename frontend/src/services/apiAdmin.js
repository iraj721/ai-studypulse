import axios from "axios";

const apiAdmin = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor - Add token
apiAdmin.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handle 401
apiAdmin.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("adminToken");
      // Redirect only if not already on login page
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiAdmin;
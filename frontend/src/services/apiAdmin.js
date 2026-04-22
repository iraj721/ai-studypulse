import axios from "axios";

/* ================= CREATE INSTANCE ================= */
const apiAdmin = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================= REQUEST INTERCEPTOR ================= */
apiAdmin.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/* ================= RESPONSE INTERCEPTOR ================= */
apiAdmin.interceptors.response.use(
  (response) => {
    // console.log(
    //   "✅ API RESPONSE:",
    //   response.config.method?.toUpperCase(),
    //   response.config.url,
    //   response.status
    // );
    return response;
  },
  (error) => {
    console.error(
      "❌ API ERROR:",
      error.response?.status,
      error.config?.url
    );

    if (
      error.response &&
      (error.response.status === 401 ||
        error.response.status === 403)
    ) {
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login";
    }

    return Promise.reject(error);
  }
);

export default apiAdmin;

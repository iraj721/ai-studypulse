import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth pages where navbar shouldn't show
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/verify-email" ||
    location.pathname === "/forgot-password" ||
    location.pathname === "/reset-password";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error("Auth error:", err);
        localStorage.removeItem("token");
        if (
          !isAuthPage &&
          !location.pathname.includes("/admin") &&
          !location.pathname.includes("/teacher")
        ) {
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    // Auth pages ka return — line ~60
    if (isAuthPage) {
      return (
        <div style={{ background: "#0a0c12", minHeight: "100vh" }}>
          <Outlet />
        </div>
      );
    }

    if (!isAuthPage) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [navigate, isAuthPage, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-spinner"></div>
        <p>Loading...</p>
        <style>{`
          .app-loading {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #0a0c12;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }
          .app-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(88, 130, 255, 0.2);
            border-top-color: #5882ff;
            border-radius: 50%;
            animation: appSpin 0.8s linear infinite;
          }
          @keyframes appSpin {
            to { transform: rotate(360deg); }
          }
          .app-loading p {
            margin-top: 15px;
            color: #8e9cc4;
            font-family: 'Inter', sans-serif;
          }
        `}</style>
      </div>
    );
  }

  // For auth pages, just render outlet without navbar
  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className="app-wrapper">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="app-main">
        <Outlet />
      </main>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
          // AppLayout.jsx
.app-wrapper {
  min-height: 100vh;
  background: #0a0c12;
  padding-top: 0;
}

.app-main {
  padding-top: 64px;
  min-height: calc(100vh - 64px);
}

@media (max-width: 768px) {
  .app-main {
    padding-top: 58px;
    min-height: calc(100vh - 58px);
  }
}
      `}</style>
    </div>
  );
}

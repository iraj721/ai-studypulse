import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Stars from "../components/Stars";
import FloatingTimer from "../components/FloatingTimer";

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Check if current page is chat - don't show stars on chat
  const isChatPage = location.pathname.includes("/chat");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error("Auth error:", err);
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="app-bg min-vh-100 position-relative">
      {/* ✅ Only show stars if NOT on chat page */}
      {!isChatPage && <Stars />}
      <Navbar user={user} onLogout={handleLogout} />
      <FloatingTimer />
      <div className="pt-5">
        <Outlet />
      </div>
    </div>
  );
}
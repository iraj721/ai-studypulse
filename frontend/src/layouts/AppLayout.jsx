import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import Stars from "../components/Stars";

export default function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch {
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

  if (loading) return null; // or Spinner

  return (
    <div className="app-bg min-vh-100 position-relative">
      <Stars />
      <Navbar user={user} onLogout={handleLogout} />

      {/* PAGE CONTENT */}
      <div className="pt-5">
        <Outlet />
      </div>
    </div>
  );
}

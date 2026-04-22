import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiAdmin.post("/admin/login", form);
      localStorage.setItem("adminToken", res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        {/* Emoji Header */}
        <div className="text-center mb-3">
          <div className="emoji">🛡️</div>
          <h4 className="fw-bold mb-1">Admin Login</h4>
          <p className="text-muted small">
            Manage AI StudyPulse like a boss 😎
          </p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 text-center small">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email</label>
            <input
              type="email"
              name="email"
              className="form-control fancy-input"
              placeholder="admin@studypulse.com"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">Password</label>
            <input
              type="password"
              name="password"
              className="form-control fancy-input"
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn fancy-btn w-100"
            disabled={loading}
          >
            {loading ? "Logging in..." : "🚀 Login"}
          </button>
        </form>

        <div className="text-center mt-3">
          <small className="text-muted">
            AI StudyPulse Admin Panel
          </small>
        </div>
      </div>

      {/* Styling */}
      <style>{`
        .login-bg {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: radial-gradient(circle at top, #5398a5ff, #fbc2eb);
        }

        .login-card {
          width: 380px;
          background: #fff;
          padding: 28px;
          border-radius: 18px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.15);
          animation: pop 0.4s ease;
        }

        @keyframes pop {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .emoji {
          font-size: 48px;
          margin-bottom: 6px;
        }

        .fancy-input {
          border-radius: 12px;
          padding: 12px 14px;
          border: 1px solid #ddd;
          transition: 0.2s;
        }

        .fancy-input:focus {
          border-color: #7b2ff7;
          box-shadow: 0 0 0 3px rgba(123,47,247,0.15);
        }

        .fancy-btn {
          background: linear-gradient(135deg, #7b2ff7, #f107a3);
          color: #fff;
          font-weight: 600;
          padding: 12px;
          border-radius: 14px;
          border: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .fancy-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(241,7,163,0.35);
        }
      `}</style>
    </div>
  );
}

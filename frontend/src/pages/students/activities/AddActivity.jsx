// src/pages/AddActivity.jsx
import React, { useState } from "react";
import api from "../../../services/api";
import { useNavigate, Link } from "react-router-dom";
import Stars from "../../../components/Stars";

export default function AddActivity() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: "",
    topic: "",
    durationMinutes: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/activities", form);
      alert("Activity added successfully!");
      navigate("/activities");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add activity.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 add-activity-bg d-flex align-items-center justify-content-center p-3">
      <Stars />

      <div className="page-top-bar">
        <h3 className="page-title">Add New Activity</h3>
        <Link to="/dashboard" className="btn btn-outline-light">
          Back to Dashboard
        </Link>
      </div>

      <div className="activity-page">
        <div className="card activity-card shadow-lg p-4 animate-card">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Subject</label>
              <input
                type="text"
                name="subject"
                className="form-control form-input"
                value={form.subject}
                onChange={onChange}
                required
                placeholder="e.g., Math"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Topic</label>
              <input
                type="text"
                name="topic"
                className="form-control form-input"
                value={form.topic}
                onChange={onChange}
                required
                placeholder="e.g., Algebra"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Duration (minutes)</label>
              <input
                type="number"
                name="durationMinutes"
                className="form-control form-input"
                value={form.durationMinutes}
                onChange={onChange}
                placeholder="e.g., 60"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Notes (optional)</label>
              <textarea
                name="notes"
                className="form-control form-input"
                value={form.notes}
                onChange={onChange}
                rows={3}
                placeholder="Add any notes..."
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 btn-add"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Activity"}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .add-activity-bg {
          background: linear-gradient(180deg,
            #080e18ff 0%,     
            #122138ff 25%,   
            #1e3652ff 50%,    
            #28507eff 75%,    
            #5a77a3ff 100%     
          );
        }

        .page-top-bar {
        backdrop-filter: blur(6px);
  position: absolute;
  top: 24px;
  left: 0;
  width: 100%;
  padding: 0 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}

        .activity-page {
          margin-top: 100px;
          width: 100%;
          max-width: 560px;
          position: relative;
          z-index: 1;
        }


       .page-title {
  color: #ffffff;
  font-weight: 700;
  margin: 0;
}

        /* ===== CARD ===== */
        .activity-card {
          border-radius: 16px;
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
          transition: transform 0.4s, box-shadow 0.4s;
        }

        .activity-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 25px 50px rgba(0,0,0,0.25);
        }

        .form-label {
  font-weight: 600;
  color: #2c3e50;
}
        /* ===== INPUTS ===== */
        .form-input {
          border-radius: 10px;
          padding: 12px 14px;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .form-input:focus {
          border-color: #007bff;
          box-shadow: 0 0 12px rgba(0,123,255,0.4);
          outline: none;
        }

        /* ===== BUTTON ===== */
        .btn-add {
          background: linear-gradient(135deg, #0066ff, #00c6ff);
          border: none;
          font-weight: 600;
          transition: transform 0.3s, box-shadow: 0 8px 20px rgba(0,102,255,0.35);
        }

        .btn-add:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 15px 35px rgba(0,0,0,0.25);
          background: linear-gradient(135deg, #005ce6, #00bfff);
        }

        .btn-add:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ===== ANIMATION ===== */
        .animate-card {
          animation: fadeInUp 0.8s ease forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

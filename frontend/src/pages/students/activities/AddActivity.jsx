import React, { useState } from "react";
import api from "../../../services/api";
import { useNavigate, Link } from "react-router-dom";
import Stars from "../../../components/Stars";
import Toast from "../../../components/Toast";
import BackButton from "../../../components/BackButton";

export default function AddActivity() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: "",
    topic: "",
    durationMinutes: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.subject || !form.topic) {
      setToast({ message: "Subject and Topic are required!", type: "error" });
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        ...form,
        durationMinutes: parseFloat(form.durationMinutes) || 0,
      };
      await api.post("/activities", payload);
      setToast({ message: "Activity added successfully! 🎉", type: "success" });
      setForm({ subject: "", topic: "", durationMinutes: "", notes: "" });
      
      setTimeout(() => {
        navigate("/activities");
      }, 1500);
    } catch (err) {
      console.error(err);
      setToast({ 
        message: err.response?.data?.message || "Failed to add activity", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 add-activity-bg d-flex align-items-center justify-content-center p-3 position-relative">
      <Stars />
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: "", type: "success" })} 
      />

      <div className="activity-page" style={{ width: "100%", maxWidth: "560px" }}>
        {/* Back Button */}
        <BackButton to="/dashboard" label="← Back to Dashboard" />
        
        <div className="card activity-card shadow-lg p-4 animate-card">
          <h3 className="text-center mb-4 fw-bold text-success">📚 Add New Activity</h3>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Subject *</label>
              <input
                type="text"
                name="subject"
                className="form-control form-input"
                value={form.subject}
                onChange={onChange}
                required
                placeholder="e.g., Mathematics"
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Topic *</label>
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
              <label className="form-label fw-semibold">Duration (minutes)</label>
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
              <label className="form-label fw-semibold">Notes (optional)</label>
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
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Adding...
                </>
              ) : (
                "➕ Add Activity"
              )}
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

        .activity-card {
          border-radius: 20px;
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

        .form-input {
          border-radius: 12px;
          padding: 12px 14px;
          transition: border-color 0.3s, box-shadow 0.3s;
          border: 1px solid #ddd;
        }

        .form-input:focus {
          border-color: #007bff;
          box-shadow: 0 0 12px rgba(0,123,255,0.4);
          outline: none;
        }

        .btn-add {
          background: linear-gradient(135deg, #0066ff, #00c6ff);
          border: none;
          font-weight: 600;
          padding: 12px;
          border-radius: 12px;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .btn-add:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,102,255,0.35);
          background: linear-gradient(135deg, #005ce6, #00bfff);
        }

        .btn-add:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .animate-card {
          animation: fadeInUp 0.8s ease forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .activity-page {
            padding: 0 16px;
          }
          
          .activity-card {
            padding: 20px 16px !important;
          }
          
          .form-input {
            font-size: 14px;
            padding: 10px 12px;
          }
        }
      `}</style>
    </div>
  );
}
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import Stars from "../../../components/Stars";
import BackButton from "../../../components/BackButton";
import Toast from "../../../components/Toast";

export default function JoinClass() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!code.trim()) {
      setToast({ message: "Please enter class code", type: "error" });
      return;
    }
    setLoading(true);
    try {
      await api.post("/student/classes/join", { code: code.trim().toUpperCase() });
      setToast({ message: "Class joined successfully!", type: "success" });
      setTimeout(() => navigate("/classes"), 1500);
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to join class", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-bg min-vh-100 position-relative d-flex align-items-center">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container" style={{ maxWidth: "450px" }}>
        <BackButton to="/classes" label="← Back to My Classes" />

        <div className="card join-card shadow-sm mx-auto p-4">
          <h4 className="mb-3 text-white text-center">📥 Join Class</h4>
          <input
            type="text"
            placeholder="Enter class code"
            className="form-control join-input mb-3"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button className="btn btn-gradient w-100" onClick={handleJoin} disabled={loading}>
            {loading ? "Joining..." : "Join Class"}
          </button>
        </div>
      </div>

      <style>{`
        .join-bg {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #5a77a3 100%);
        }
        .join-card {
          border-radius: 20px;
          background: rgba(24,34,52,0.85);
          backdrop-filter: blur(10px);
        }
        .join-input {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          border-radius: 12px;
          padding: 12px;
        }
        .join-input::placeholder { color: rgba(255,255,255,0.6); }
        .join-input:focus { background: rgba(255,255,255,0.15); color: white; }
        .btn-gradient { background: linear-gradient(135deg, #4f46e5, #6366f1); border: none; color: white; }
      `}</style>
    </div>
  );
}
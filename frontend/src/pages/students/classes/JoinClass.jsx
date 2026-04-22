import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import Stars from "../../../components/Stars";

export default function JoinClass() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleJoin = async () => {
    if (!code.trim()) return alert("Enter class code");

    try {
      await api.post("/student/classes/join", {
        code: code.trim().toUpperCase(),
      });
      alert("Class joined successfully!");
      navigate("/classes");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to join class");
    }
  };

  return (
    <div className="join-bg min-vh-100 position-relative d-flex align-items-center">
      <Stars />
      <div className="container">
        <div
          className="card join-card shadow-sm mx-auto p-4"
          style={{ maxWidth: 400 }}
        >
          <h4 className="mb-3 text-white text-center">📥 Join Class</h4>
          <input
            type="text"
            placeholder="Enter class code"
            className="form-control join-input mb-3"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button className="btn btn-gradient w-100" onClick={handleJoin}>
            Join Class
          </button>
        </div>
      </div>

      <style>{`
        .join-bg {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #5a77a3 100%);
          position: relative;
          overflow: hidden;
        }
        .join-card {
          border-radius: 16px;
          background: rgba(24,34,52,0.85);
          color: #fff;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .join-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.25);
        }
          .join-input {
            background-color: rgba(24,34,52,0.9);
            color: #fff !important;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 10px 12px;
            transition: all 0.3s ease;
           }
        .join-input::placeholder {
          color: rgba(255,255,255,0.6) !important;
        }
        .join-input:focus {
          background-color: rgba(24,34,52,1) !important;
          border-color: #6366f1;
          box-shadow: 0 0 10px rgba(99,102,241,0.5);
          color: #fff !important;
          outline: none;
        }

        .btn-gradient {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          color: white;
          font-weight: 600;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .btn-gradient:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 12px 25px rgba(0,0,0,0.25);
          background: linear-gradient(135deg, #5b4be8, #7b66f3);
        }
        .form-control.bg-dark {
          background-color: rgba(24,34,52,0.9);
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.3);
        }
        .form-control.bg-dark:focus {
          background-color: rgba(24,34,52,1);
          color: #fff;
          border-color: #6366f1;
          box-shadow: 0 0 0 0.2rem rgba(99,102,241,0.25);
        }
      `}</style>
    </div>
  );
}

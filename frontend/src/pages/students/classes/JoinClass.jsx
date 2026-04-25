import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import Toast from "../../../components/Toast";
import { FaArrowLeft, FaUserPlus, FaSpinner } from "react-icons/fa";

export default function JoinClass() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const handleJoin = async () => {
    if (!code.trim()) {
      setToast({ message: "Please enter a class code", type: "error" });
      return;
    }

    setLoading(true);
    try {
      await api.post("/student/classes/join", { code: code.trim().toUpperCase() });
      setToast({ message: "Class joined successfully! 🎉", type: "success" });
      setTimeout(() => navigate("/classes"), 1500);
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to join class",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-root">
      {/* Background */}
      <div className="join-bg" />
      <div className="join-grid" />
      <div className="join-orb join-orb-a" />
      <div className="join-orb join-orb-b" />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      {/* Main Content */}
      <main className="join-main">
        <div className="join-container">
          {/* Back Button */}
          <button className="join-back-btn" onClick={() => navigate("/classes")}>
            <FaArrowLeft /> Back to Classes
          </button>

          {/* Card */}
          <div className="join-card">
            <div className="join-card-glow" />
            
            <div className="join-header">
              <div className="join-icon">
                <FaUserPlus />
              </div>
              <h1 className="join-title">Join a <span className="join-grad">Class</span></h1>
              <p className="join-subtitle">Enter the class code provided by your teacher</p>
            </div>

            <div className="join-form">
              <div className="join-input-group">
                <label className="join-label">Class Code</label>
                <input
                  type="text"
                  className="join-input"
                  placeholder="e.g., MATH101"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === "Enter" && handleJoin()}
                  autoFocus
                />
                <p className="join-hint">Enter the 6-8 character code exactly as shown</p>
              </div>

              <button
                className={`join-submit ${loading ? "loading" : ""}`}
                onClick={handleJoin}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner" /> Joining Class...
                  </>
                ) : (
                  <>
                    <FaUserPlus /> Join Class
                  </>
                )}
              </button>
            </div>

            <div className="join-footer">
              <p>Don't have a class code? <span>Contact your teacher</span></p>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .join-root {
          --bg: #0a0c12;
          --surface: #111318;
          --border: rgba(88, 130, 255, 0.12);
          --border-h: rgba(88, 130, 255, 0.28);
          --accent: #5882ff;
          --accent2: #20e6d0;
          --violet: #9b7aff;
          --text: #edf2ff;
          --muted: #8e9cc4;
          --faint: #49587a;
          --fd: 'Syne', sans-serif;
          --fb: 'Inter', sans-serif;
        }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .join-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }

        .join-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background */
        .join-bg {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.08) 0%, transparent 60%);
        }
        .join-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image: linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .join-orb {
          position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .join-orb-a { width: 400px; height: 400px; top: -100px; left: 50%; transform: translateX(-50%); background: rgba(88, 130, 255, 0.06); animation: orbFloat 12s infinite; }
        .join-orb-b { width: 250px; height: 250px; bottom: 10%; right: -5%; background: rgba(32, 230, 208, 0.04); animation: orbFloat2 10s infinite; }
        @keyframes orbFloat { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.1); } }
        @keyframes orbFloat2 { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }

        /* Main Content */
        .join-main {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 90px 2rem 3rem;
        }

        .join-container {
          max-width: 500px;
          width: 100%;
          margin: 0 auto;
        }

        /* Back Button */
        .join-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(88, 130, 255, 0.1);
          border: 1px solid var(--border);
          color: var(--accent);
          padding: 8px 20px;
          border-radius: 40px;
          font-size: 0.85rem;
          cursor: pointer;
          margin-bottom: 1.5rem;
          transition: all 0.2s;
        }
        .join-back-btn:hover {
          background: rgba(88, 130, 255, 0.2);
          transform: translateX(-4px);
        }

        /* Card */
        .join-card {
          background: rgba(17, 19, 24, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 28px;
          padding: 2.5rem;
          position: relative;
          transition: all 0.3s;
        }
        .join-card:hover {
          border-color: var(--border-h);
          transform: translateY(-4px);
        }
        .join-card-glow {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 180px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(88, 130, 255, 0.1), transparent);
          filter: blur(60px);
          pointer-events: none;
        }

        /* Header */
        .join-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .join-icon {
          width: 70px;
          height: 70px;
          background: rgba(88, 130, 255, 0.1);
          border: 1px solid rgba(88, 130, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin: 0 auto 1rem;
          color: var(--accent);
        }
        .join-title {
          font-family: var(--fd);
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .join-subtitle {
          color: var(--muted);
          font-size: 0.85rem;
        }

        /* Form */
        .join-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .join-input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .join-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--muted);
        }
        .join-input {
          width: 100%;
          padding: 14px 18px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 14px;
          color: var(--text);
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          text-align: center;
          transition: all 0.2s;
        }
        .join-input:focus {
          outline: none;
          border-color: var(--accent);
          background: rgba(88, 130, 255, 0.05);
          box-shadow: 0 0 0 3px rgba(88, 130, 255, 0.1);
        }
        .join-input::placeholder {
          color: var(--faint);
          font-size: 0.85rem;
          letter-spacing: normal;
          text-transform: none;
        }
        .join-hint {
          font-size: 0.7rem;
          color: var(--faint);
          text-align: center;
        }

        /* Submit Button */
        .join-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          border: none;
          border-radius: 48px;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(88, 130, 255, 0.35);
        }
        .join-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(88, 130, 255, 0.5);
        }
        .join-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .join-submit.loading {
          opacity: 0.8;
        }
        .spinner {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Footer */
        .join-footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .join-footer p {
          font-size: 0.8rem;
          color: var(--faint);
        }
        .join-footer span {
          color: var(--accent);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .join-main { padding: 80px 1rem 2rem; }
          .join-card { padding: 1.75rem; }
          .join-title { font-size: 1.5rem; }
          .join-icon { width: 55px; height: 55px; font-size: 1.5rem; }
          .join-back-btn { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
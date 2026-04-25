import React, { useState, useEffect } from "react";
import api from "../../../services/api";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";

export default function AddActivity() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    subject: "",
    topic: "",
    durationMinutes: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [focused, setFocused] = useState("");
  const toastTimer = null;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 5000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.subject || !form.topic) {
      showToast("Subject and Topic are required!", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        durationMinutes: parseFloat(form.durationMinutes) || 0,
      };
      await api.post("/activities", payload);
      showToast("Activity added successfully! 🎉", "success");
      setForm({ subject: "", topic: "", durationMinutes: "", notes: "" });

      setTimeout(() => {
        navigate("/activities");
      }, 1500);
    } catch (err) {
      console.error(err);
      showToast(
        err.response?.data?.message || "Failed to add activity",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addact-root">
      {/* Background */}
      <div className="addact-bg" />
      <div className="addact-grid" />
      <div className="addact-orb addact-orb-a" />
      <div className="addact-orb addact-orb-b" />

      {/* Toast */}
      {toast.message && (
        <div className={`addact-toast addact-toast-${toast.type}`}>
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.message}
        </div>
      )}

      {/* Navbar */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="addact-main">
        <div className="addact-container">
          {/* Header */}
          <div className="addact-header">
            <div>
              <h1 className="addact-title">
                Add <span className="addact-grad">Activity</span>
              </h1>
              <p className="addact-sub">Track your study session</p>
            </div>
            <Link to="/activities" className="addact-back-btn">
              ← Back to Activities
            </Link>
          </div>

          {/* Form Card */}
          <div className="addact-card">
            <div className="addact-card-glow" />

            <form onSubmit={handleSubmit} className="addact-form">
              {/* Subject Field */}
              <div
                className={`addact-field ${focused === "subject" ? "addact-field-focus" : ""}`}
              >
                <label className="addact-label" htmlFor="subject">
                  Subject *
                </label>
                <div className="addact-input-wrap">
                  <svg
                    className="addact-input-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M2 3h12v10H2V3z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      fill="none"
                    />
                    <path
                      d="M5 6h6M5 9h4"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={form.subject}
                    onChange={onChange}
                    onFocus={() => setFocused("subject")}
                    onBlur={() => setFocused("")}
                    className="addact-input"
                    placeholder="e.g., Mathematics"
                    required
                  />
                </div>
              </div>

              {/* Topic Field */}
              <div
                className={`addact-field ${focused === "topic" ? "addact-field-focus" : ""}`}
              >
                <label className="addact-label" htmlFor="topic">
                  Topic *
                </label>
                <div className="addact-input-wrap">
                  <svg
                    className="addact-input-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M8 4v4l2 2"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    id="topic"
                    name="topic"
                    type="text"
                    value={form.topic}
                    onChange={onChange}
                    onFocus={() => setFocused("topic")}
                    onBlur={() => setFocused("")}
                    className="addact-input"
                    placeholder="e.g., Algebra"
                    required
                  />
                </div>
              </div>

              {/* Duration Field */}
              <div
                className={`addact-field ${focused === "duration" ? "addact-field-focus" : ""}`}
              >
                <label className="addact-label" htmlFor="durationMinutes">
                  Duration (minutes)
                </label>
                <div className="addact-input-wrap">
                  <svg
                    className="addact-input-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="currentColor"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M8 4v4l3 2"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    id="durationMinutes"
                    name="durationMinutes"
                    type="number"
                    value={form.durationMinutes}
                    onChange={onChange}
                    onFocus={() => setFocused("duration")}
                    onBlur={() => setFocused("")}
                    className="addact-input"
                    placeholder="e.g., 60"
                  />
                </div>
              </div>

              {/* Notes Field */}
              <div
                className={`addact-field ${focused === "notes" ? "addact-field-focus" : ""}`}
              >
                <label className="addact-label" htmlFor="notes">
                  Notes (optional)
                </label>
                <div className="addact-input-wrap">
                  <svg
                    className="addact-input-icon addact-textarea-icon"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M2 3h12v10H2V3z"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      fill="none"
                    />
                    <path
                      d="M4 6h8M4 9h6"
                      stroke="currentColor"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="4"
                    value={form.notes}
                    onChange={onChange}
                    onFocus={() => setFocused("notes")}
                    onBlur={() => setFocused("")}
                    className="addact-textarea"
                    placeholder="Add any notes about your study session..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`addact-submit ${loading ? "addact-submit-loading" : ""}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="addact-spinner" />
                    Adding Activity...
                  </>
                ) : (
                  <>
                    <span>📚</span> Add Activity
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .addact-root {
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
          --success: #10b981;
          --error: #ef4444;
        }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .addact-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .addact-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background */
        .addact-bg {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.1) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 90% 70%, rgba(32, 230, 208, 0.05) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 10% 80%, rgba(155, 122, 255, 0.05) 0%, transparent 55%);
        }
        .addact-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 80%);
        }
        .addact-orb {
          position: fixed; border-radius: 50%; filter: blur(90px);
          pointer-events: none; z-index: 0;
        }
        .addact-orb-a {
          width: 460px; height: 460px; top: -140px; left: 50%;
          transform: translateX(-50%);
          background: rgba(88, 130, 255, 0.08);
          animation: orbA 9s ease-in-out infinite;
        }
        .addact-orb-b {
          width: 280px; height: 280px; bottom: 10%; right: -3%;
          background: rgba(32, 230, 208, 0.05);
          animation: orbB 11s 2s ease-in-out infinite;
        }
        @keyframes orbA {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.06); }
        }
        @keyframes orbB {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.09); }
        }

        /* Toast */
        .addact-toast {
          position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
          z-index: 300; display: flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 40px; font-size: 0.8rem; font-weight: 500;
          background: var(--surface); border: 1px solid;
          animation: toastIn 0.3s ease;
        }
        .addact-toast-success {
          border-color: var(--success);
          color: var(--success);
        }
        .addact-toast-error {
          border-color: var(--error);
          color: var(--error);
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        /* Main Content */
        .addact-main {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 90px 2rem 3rem;
        }

        .addact-container {
          max-width: 550px;
          width: 100%;
          margin: 0 auto;
        }

        /* Header */
        .addact-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .addact-title {
          font-family: var(--fd);
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.25rem;
        }
        .addact-sub {
          color: var(--muted);
          font-size: 0.85rem;
        }
        .addact-back-btn {
          background: rgba(88, 130, 255, 0.1);
          border: 1px solid var(--border);
          color: var(--accent);
          padding: 8px 18px;
          border-radius: 40px;
          text-decoration: none;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .addact-back-btn:hover {
          background: rgba(88, 130, 255, 0.2);
          transform: translateX(-2px);
        }

        /* Card */
        .addact-card {
          background: rgba(17, 19, 24, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 28px;
          padding: 2rem;
          position: relative;
          transition: all 0.3s;
        }
        .addact-card:hover {
          border-color: var(--border-h);
          transform: translateY(-4px);
        }
        .addact-card-glow {
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

        /* Form */
        .addact-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .addact-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .addact-label {
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--muted);
          transition: color 0.2s;
        }
        .addact-field-focus .addact-label {
          color: var(--accent);
        }
        .addact-input-wrap {
          position: relative;
          display: flex;
          align-items: flex-start;
        }
        .addact-input-icon {
          position: absolute;
          left: 13px;
          top: 12px;
          color: var(--faint);
          pointer-events: none;
          transition: color 0.2s;
        }
        .addact-textarea-icon {
          top: 14px;
        }
        .addact-field-focus .addact-input-icon {
          color: var(--accent);
        }
        .addact-input {
          width: 100%;
          font-family: var(--fb);
          font-size: 0.9rem;
          color: var(--text);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 11px 14px 11px 40px;
          outline: none;
          transition: all 0.2s;
        }
        .addact-input:focus {
          border-color: rgba(88, 130, 255, 0.5);
          background: rgba(88, 130, 255, 0.04);
          box-shadow: 0 0 0 3px rgba(88, 130, 255, 0.1);
        }
        .addact-input::placeholder {
          color: var(--faint);
          font-size: 0.85rem;
        }
        .addact-textarea {
          width: 100%;
          font-family: var(--fb);
          font-size: 0.9rem;
          color: var(--text);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 11px 14px 11px 40px;
          outline: none;
          resize: vertical;
          transition: all 0.2s;
        }
        .addact-textarea:focus {
          border-color: rgba(88, 130, 255, 0.5);
          background: rgba(88, 130, 255, 0.04);
          box-shadow: 0 0 0 3px rgba(88, 130, 255, 0.1);
        }
        .addact-textarea::placeholder {
          color: var(--faint);
          font-size: 0.85rem;
        }

        /* Submit Button */
        .addact-submit {
          margin-top: 0.5rem;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-family: var(--fb);
          font-size: 0.95rem;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 48px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          border: none;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(88, 130, 255, 0.35);
        }
        .addact-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(88, 130, 255, 0.5);
        }
        .addact-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .addact-spinner {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .addact-main {
            padding: 80px 1rem 2rem;
          }
          .addact-card {
            padding: 1.5rem;
          }
          .addact-title {
            font-size: 1.4rem;
          }
          .addact-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .addact-back-btn {
            width: 100%;
            text-align: center;
          }
          .addact-input, .addact-textarea {
            font-size: 0.85rem;
          }
        }
        @media (max-width: 480px) {
          .addact-card {
            padding: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
}
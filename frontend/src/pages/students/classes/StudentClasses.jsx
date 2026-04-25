import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import Toast from "../../../components/Toast";
import { FaUsers, FaBookOpen, FaChalkboardTeacher, FaSignOutAlt, FaPlus } from "react-icons/fa";

export default function StudentClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedClassName, setSelectedClassName] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get("/student/classes");
      setClasses(res.data);
    } catch (err) {
      setToast({ message: "Failed to load classes", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const openLeaveModal = (classId, className, e) => {
    e.stopPropagation();
    setSelectedClassId(classId);
    setSelectedClassName(className);
    setShowModal(true);
  };

  const confirmLeave = async () => {
    try {
      await api.delete(`/student/classes/${selectedClassId}/leave`);
      setClasses((prev) => prev.filter((cls) => cls._id !== selectedClassId));
      setToast({ message: `Left "${selectedClassName}" successfully!`, type: "success" });
      setShowModal(false);
      setSelectedClassId(null);
      setSelectedClassName("");
    } catch (err) {
      setToast({ message: "Failed to leave class", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="sc-loading">
        <div className="sc-spinner" />
        <p>Loading your classes...</p>
        <style>{`
          .sc-loading {
            position: fixed; inset: 0;
            background: #0a0c12;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            z-index: 1000;
          }
          .sc-spinner {
            width: 48px; height: 48px;
            border: 3px solid rgba(88,130,255,0.2);
            border-top-color: #5882ff;
            border-radius: 50%;
            animation: sc-spin 0.8s linear infinite;
          }
          @keyframes sc-spin { to { transform: rotate(360deg); } }
          .sc-loading p { margin-top: 14px; color: #8e9cc4; font-family: sans-serif; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="sc-root">
      {/* Decorative background */}
      <div className="sc-bg" />
      <div className="sc-gridlines" />
      <div className="sc-orb sc-orb-a" />
      <div className="sc-orb sc-orb-b" />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      <main className="sc-main">
        <div className="sc-container">

          {/* ── Header ── */}
          <div className="sc-header">
            <div>
              <h1 className="sc-title">
                My <span className="sc-grad">Classes</span>
              </h1>
              <p className="sc-subtitle">Manage and track all your enrolled classes</p>
            </div>
            <button className="sc-join-btn" onClick={() => navigate("/classes/join")}>
              <FaPlus /> Join New Class
            </button>
          </div>

          {/* ── Empty state ── */}
          {classes.length === 0 ? (
            <div className="sc-empty">
              <div className="sc-empty-icon">📚</div>
              <h3>No Classes Yet</h3>
              <p>You haven't joined any classes yet. Join a class to get started!</p>
              <button className="sc-join-btn" onClick={() => navigate("/classes/join")}>
                Join Your First Class
              </button>
            </div>
          ) : (
            /* ── Cards grid ── */
            <div className="sc-cards">
              {classes.map((cls) => (
                <div
                  key={cls._id}
                  className="sc-card"
                  onClick={() => navigate(`/student/class/${cls._id}`)}
                >
                  <div className="sc-card-top">
                    <div className="sc-card-icon">
                      <FaBookOpen />
                    </div>
                    <button
                      className="sc-leave-btn"
                      onClick={(e) => openLeaveModal(cls._id, cls.name, e)}
                      title="Leave Class"
                    >
                      <FaSignOutAlt /> Leave
                    </button>
                  </div>

                  <h3 className="sc-class-name">{cls.name}</h3>
                  <div className="sc-class-subject">{cls.subject}</div>

                  <div className="sc-class-meta">
                    <span className="sc-class-teacher">
                      <FaChalkboardTeacher /> {cls.teacher?.name}
                    </span>
                    <span className="sc-class-code">
                      <span className="sc-code-label">Code</span>
                      <span className="sc-code-val">{cls.code}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── Leave modal ── */}
      {showModal && (
        <div className="sc-overlay" onClick={() => setShowModal(false)}>
          <div className="sc-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sc-modal-icon">⚠️</div>
            <h3>Leave Class?</h3>
            <p>
              Are you sure you want to leave{" "}
              <strong>"{selectedClassName}"</strong>?
            </p>
            <p className="sc-modal-warn">
              This action cannot be undone. You will lose access to all class
              materials and announcements.
            </p>
            <div className="sc-modal-btns">
              <button className="sc-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="sc-confirm" onClick={confirmLeave}>
                Yes, Leave Class
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        /* ── Tokens ── */
        .sc-root {
          --bg:      #0a0c12;
          --surface: #111318;
          --border:  rgba(88,130,255,0.12);
          --border-h:rgba(88,130,255,0.28);
          --accent:  #5882ff;
          --accent2: #20e6d0;
          --violet:  #9b7aff;
          --text:    #edf2ff;
          --muted:   #8e9cc4;
          --faint:   #49587a;
          font-family: 'Inter', sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;   /* KEY: no horizontal scroll */
          position: relative;
        }

        /* Gradient text */
        .sc-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Decorative bg ── */
        .sc-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background: radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88,130,255,0.08) 0%, transparent 60%);
        }
        /* KEY FIX: renamed from .classes-grid to .sc-gridlines so it doesn't
           conflict with the cards grid layout */
        .sc-gridlines {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(88,130,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(88,130,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .sc-orb {
          position: fixed; border-radius: 50%;
          filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .sc-orb-a {
          width: 400px; height: 400px; top: -100px; left: 50%;
          transform: translateX(-50%);
          background: rgba(88,130,255,0.06);
          animation: scOrbA 12s ease-in-out infinite;
        }
        .sc-orb-b {
          width: 250px; height: 250px; bottom: 10%; right: -5%;
          background: rgba(32,230,208,0.04);
          animation: scOrbB 10s ease-in-out infinite;
        }
        @keyframes scOrbA { 0%,100%{transform:translateX(-50%) scale(1)} 50%{transform:translateX(-50%) scale(1.1)} }
        @keyframes scOrbB { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }

        /* ── Layout ── */
        .sc-main {
          position: relative;
          z-index: 10;
          padding: 90px 2rem 3rem;
          min-height: 100vh;
        }
        .sc-container {
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        /* ── Page header ── */
        .sc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .sc-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.4rem, 4vw, 1.9rem);
          font-weight: 700;
          margin-bottom: 4px;
        }
        .sc-subtitle {
          color: var(--muted);
          font-size: 0.85rem;
        }

        /* ── Shared button style ── */
        .sc-join-btn {
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: #fff;
          padding: 10px 24px;
          border-radius: 40px;
          border: none;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.2s, opacity 0.2s;
          white-space: nowrap;
        }
        .sc-join-btn:hover { transform: translateY(-2px); opacity: 0.9; }

        /* ── Empty state ── */
        .sc-empty {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(17,19,24,0.6);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .sc-empty-icon { font-size: 3.5rem; opacity: 0.5; }
        .sc-empty h3 { font-size: 1.1rem; }
        .sc-empty p { color: var(--muted); font-size: 0.85rem; max-width: 340px; }

        /* ── Cards grid ── */
        /* KEY FIX: unique class name .sc-cards — no conflict with bg grid */
        .sc-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
          width: 100%;
        }

        /* ── Single card ── */
        .sc-card {
          background: rgba(17,19,24,0.65);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1.4rem;
          cursor: pointer;
          transition: border-color 0.25s, transform 0.25s, background 0.25s;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          /* KEY: min-width 0 so cards don't blow out the grid */
          min-width: 0;
        }
        .sc-card:hover {
          border-color: var(--border-h);
          transform: translateY(-4px);
          background: rgba(88,130,255,0.05);
        }

        /* Card top row: icon + leave button */
        .sc-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .sc-card-icon {
          font-size: 1.8rem;
          color: var(--accent);
          line-height: 1;
        }

        .sc-class-name {
          font-family: 'Syne', sans-serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sc-class-subject {
          font-size: 0.83rem;
          color: var(--muted);
        }

        /* Meta row: teacher + code */
        .sc-class-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 4px;
        }
        .sc-class-teacher {
          font-size: 0.78rem;
          color: var(--faint);
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .sc-class-code {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.05);
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 0.7rem;
        }
        .sc-code-label { color: var(--faint); }
        .sc-code-val {
          font-family: monospace;
          font-weight: 700;
          letter-spacing: 1px;
          color: var(--muted);
        }

        /* Leave button — now in flow, not absolute positioned */
        .sc-leave-btn {
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.28);
          color: #f87171;
          padding: 5px 12px;
          border-radius: 30px;
          font-size: 0.7rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: background 0.2s, color 0.2s;
          flex-shrink: 0;
          font-family: inherit;
        }
        .sc-leave-btn:hover {
          background: #ef4444;
          color: #fff;
          border-color: #ef4444;
        }

        /* ── Modal ── */
        .sc-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 500;
          padding: 1rem;
        }
        .sc-modal {
          background: var(--surface);
          border: 1px solid var(--border-h);
          border-radius: 24px;
          padding: 2rem 1.75rem;
          width: 100%;
          max-width: 420px;
          text-align: center;
          animation: scPop 0.25s ease;
        }
        @keyframes scPop {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .sc-modal-icon { font-size: 2.8rem; margin-bottom: 0.75rem; }
        .sc-modal h3 { font-size: 1.2rem; margin-bottom: 0.4rem; }
        .sc-modal p  { font-size: 0.83rem; color: var(--muted); margin-bottom: 0.25rem; }
        .sc-modal-warn { color: #f87171; font-size: 0.78rem; margin-top: 0.25rem; }
        .sc-modal-btns {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
          flex-wrap: wrap;
        }
        .sc-cancel {
          flex: 1;
          min-width: 100px;
          padding: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: 40px;
          color: var(--text);
          cursor: pointer;
          font-weight: 500;
          font-family: inherit;
          transition: background 0.2s;
        }
        .sc-cancel:hover { background: rgba(255,255,255,0.1); }
        .sc-confirm {
          flex: 1;
          min-width: 100px;
          padding: 10px;
          background: #ef4444;
          border: none;
          border-radius: 40px;
          color: #fff;
          cursor: pointer;
          font-weight: 500;
          font-family: inherit;
          transition: background 0.2s;
        }
        .sc-confirm:hover { background: #dc2626; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .sc-main { padding: 80px 1rem 2rem; }
          .sc-header { flex-direction: column; align-items: flex-start; }
          .sc-join-btn { width: 100%; justify-content: center; }
          .sc-cards { grid-template-columns: 1fr; }
        }

        @media (max-width: 400px) {
          .sc-modal { padding: 1.5rem 1.25rem; }
          .sc-modal-btns { flex-direction: column; }
          .sc-cancel, .sc-confirm { width: 100%; }
        }
      `}</style>
    </div>
  );
}
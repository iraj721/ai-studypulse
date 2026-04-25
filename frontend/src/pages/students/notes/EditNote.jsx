import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import ReactMarkdown from "react-markdown";
import Toast from "../../../components/Toast";
import { 
  FaArrowLeft, FaSave, FaEye, FaTimes, FaSpinner,
  FaMarkdown
} from "react-icons/fa";

export default function EditNote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: "", topic: "", content: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${id}`);
        setForm(res.data);
      } catch (err) {
        setToast({ message: "Failed to load note", type: "error" });
        navigate("/notes");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/notes/${id}`, form);
      setToast({ message: "Note updated successfully!", type: "success" });
      setTimeout(() => navigate("/notes"), 1000);
    } catch (err) {
      setToast({ message: "Failed to update note", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-loading">
        <div className="edit-spinner"></div>
        <p>Loading note...</p>
      </div>
    );
  }

  return (
    <div className="edit-root">
      {/* Background */}
      <div className="edit-bg" />
      <div className="edit-grid" />
      <div className="edit-orb edit-orb-a" />
      <div className="edit-orb edit-orb-b" />

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      {/* Main Content */}
      <main className="edit-main">
        <div className="edit-container">
          {/* Back Button */}
          <button className="edit-back" onClick={() => navigate("/notes")}>
            <FaArrowLeft /> Back to Notes
          </button>

          {/* Card */}
          <div className="edit-card">
            <div className="edit-card-glow" />
            
            {/* Header */}
            <div className="edit-header">
              <div className="edit-icon">
                <FaMarkdown />
              </div>
              <h1 className="edit-title">Edit <span className="edit-grad">Note</span></h1>
              <p className="edit-subtitle">Update your note content with Markdown support</p>
            </div>

            <form onSubmit={handleSubmit} className="edit-form">
              {/* Subject & Topic Row */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Topic</label>
                  <input
                    type="text"
                    className="form-input"
                    name="topic"
                    value={form.topic}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Content Area with Preview Toggle */}
              <div className="form-group">
                <div className="content-header">
                  <label className="form-label">Content (Markdown supported)</label>
                  <button 
                    type="button"
                    className={`preview-toggle ${showPreview ? "active" : ""}`}
                    onClick={() => setShowPreview(!showPreview)}
                  >
                    {showPreview ? <FaEye /> : <FaMarkdown />}
                    {showPreview ? " Hide Preview" : " Show Preview"}
                  </button>
                </div>
                
                {!showPreview ? (
                  <textarea
                    className="form-textarea"
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    rows={12}
                    required
                  />
                ) : (
                  <div className="preview-content">
                    <div className="preview-header">
                      <FaEye /> Preview
                      <button 
                        type="button"
                        className="preview-close"
                        onClick={() => setShowPreview(false)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="preview-body">
                      <ReactMarkdown>{form.content}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <FaSpinner className="spinner" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => navigate("/notes")}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .edit-root {
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

        .edit-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }

        .edit-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background */
        .edit-bg {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.08) 0%, transparent 60%);
        }
        .edit-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image: linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .edit-orb {
          position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .edit-orb-a { width: 400px; height: 400px; top: -100px; left: 50%; transform: translateX(-50%); background: rgba(88, 130, 255, 0.06); animation: orbFloat 12s infinite; }
        .edit-orb-b { width: 250px; height: 250px; bottom: 10%; right: -5%; background: rgba(32, 230, 208, 0.04); animation: orbFloat2 10s infinite; }
        @keyframes orbFloat { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.1); } }
        @keyframes orbFloat2 { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }

        /* Loading */
        .edit-loading {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: #0a0c12;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .edit-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(88, 130, 255, 0.2);
          border-top-color: #5882ff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .edit-loading p { margin-top: 15px; color: #8e9cc4; }

        /* Main Content */
        .edit-main {
          position: relative;
          z-index: 10;
          max-width: 900px;
          margin: 0 auto;
          padding: 90px 2rem 3rem;
          min-height: 100vh;
        }

        /* Back Button */
        .edit-back {
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
        .edit-back:hover {
          background: rgba(88, 130, 255, 0.2);
          transform: translateX(-4px);
        }

        /* Card */
        .edit-card {
          background: rgba(17, 19, 24, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 28px;
          padding: 2rem;
          position: relative;
          transition: all 0.3s;
        }
        .edit-card:hover {
          border-color: var(--border-h);
          transform: translateY(-4px);
        }
        .edit-card-glow {
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
        .edit-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .edit-icon {
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
        .edit-title {
          font-family: var(--fd);
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .edit-subtitle {
          color: var(--muted);
          font-size: 0.85rem;
        }

        /* Form */
        .edit-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--muted);
        }
        .form-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .form-input:focus {
          outline: none;
          border-color: var(--accent);
          background: rgba(88, 130, 255, 0.05);
        }
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-size: 0.9rem;
          resize: vertical;
          font-family: monospace;
          transition: all 0.2s;
          min-height: 300px;
        }
        .form-textarea:focus {
          outline: none;
          border-color: var(--accent);
          background: rgba(88, 130, 255, 0.05);
        }

        /* Content Header */
        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .preview-toggle {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(88, 130, 255, 0.1);
          border: 1px solid var(--border);
          border-radius: 30px;
          color: var(--accent);
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .preview-toggle:hover {
          background: rgba(88, 130, 255, 0.2);
        }
        .preview-toggle.active {
          background: rgba(88, 130, 255, 0.2);
          border-color: var(--accent);
        }

        /* Preview */
        .preview-content {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        }
        .preview-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(88, 130, 255, 0.08);
          border-bottom: 1px solid var(--border);
          font-size: 0.85rem;
          font-weight: 500;
        }
        .preview-close {
          margin-left: auto;
          background: none;
          border: none;
          color: var(--muted);
          cursor: pointer;
          transition: color 0.2s;
        }
        .preview-close:hover {
          color: #f87171;
        }
        .preview-body {
          padding: 1.5rem;
          max-height: 400px;
          overflow-y: auto;
          line-height: 1.6;
        }
        .preview-body h1, .preview-body h2, .preview-body h3 {
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: var(--text);
        }
        .preview-body p {
          margin-bottom: 0.75rem;
          color: var(--muted);
        }
        .preview-body pre {
          background: rgba(0, 0, 0, 0.4);
          padding: 1rem;
          border-radius: 12px;
          overflow-x: auto;
          font-size: 0.8rem;
        }
        .preview-body code {
          background: rgba(0, 0, 0, 0.3);
          padding: 2px 6px;
          border-radius: 6px;
          font-size: 0.85rem;
        }
        .preview-body ul, .preview-body ol {
          padding-left: 1.5rem;
          margin-bottom: 0.75rem;
        }

        /* Action Buttons */
        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 0.5rem;
        }
        .submit-btn {
          flex: 2;
          padding: 12px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          border: none;
          border-radius: 48px;
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(88, 130, 255, 0.35);
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(88, 130, 255, 0.5);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .cancel-btn {
          flex: 1;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          border-radius: 48px;
          color: var(--muted);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .cancel-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text);
        }
        .spinner {
          animation: spin 0.8s linear infinite;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .edit-main { padding: 80px 1rem 2rem; }
          .form-row { grid-template-columns: 1fr; }
          .edit-card { padding: 1.5rem; }
          .edit-title { font-size: 1.5rem; }
          .edit-icon { width: 55px; height: 55px; font-size: 1.5rem; }
          .edit-back { width: 100%; justify-content: center; }
          .form-actions { flex-direction: column; }
          .preview-body { padding: 1rem; }
          .content-header { flex-direction: column; align-items: flex-start; }
          .preview-toggle { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import ReactMarkdown from "react-markdown";
import BackButton from "../../../components/BackButton";
import Toast from "../../../components/Toast";
import Stars from "../../../components/Stars";

export default function EditNote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: "", topic: "", content: "" });
  const [loading, setLoading] = useState(true);
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
    try {
      await api.put(`/notes/${id}`, form);
      setToast({ message: "Note updated successfully!", type: "success" });
      setTimeout(() => navigate("/notes"), 1000);
    } catch (err) {
      setToast({ message: "Failed to update note", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="notes-bg min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-white fs-4">Loading note...</div>
      </div>
    );
  }

  return (
    <div className="notes-bg min-vh-100 position-relative py-5">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container">
        <BackButton to="/notes" label="← Back to Notes" />

        <div className="card shadow-lg border-0 p-4 notes-card">
          <h2 className="fw-bold text-center mb-4">✏️ Edit Note</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-control input-field"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Topic</label>
              <input
                type="text"
                className="form-control input-field"
                name="topic"
                value={form.topic}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Content (Markdown supported)</label>
              <textarea
                className="form-control input-field textarea-field"
                name="content"
                value={form.content}
                onChange={handleChange}
                rows={10}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Preview</label>
              <div className="card p-3 preview-card">
                <ReactMarkdown>{form.content}</ReactMarkdown>
              </div>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <button type="submit" className="btn btn-gradient">💾 Save Changes</button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate("/notes")}>Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .notes-bg {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%);
        }
        .notes-card {
          background: rgba(24, 34, 52, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 20px;
        }
        .form-label { color: #e5e7eb; font-weight: 600; }
        .input-field {
          border-radius: 12px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
        }
        .input-field:focus { background: rgba(255,255,255,0.15); color: white; }
        .preview-card { background: rgba(255,255,255,0.08); color: white; border-radius: 12px; }
        .btn-gradient { background: linear-gradient(135deg, #4f46e5, #6366f1); border: none; color: white; }
        @media (max-width: 768px) { .d-flex.gap-2 { flex-direction: column; } }
      `}</style>
    </div>
  );
}
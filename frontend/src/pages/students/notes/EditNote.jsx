import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../../services/api";
import ReactMarkdown from "react-markdown";

export default function EditNote({ user, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ subject: "", topic: "", content: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/notes/${id}`);
        setForm(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load note");
        navigate("/notes");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/notes/${id}`, form);
      alert("Note updated successfully");
      navigate("/notes");
    } catch (err) {
      console.error(err);
      alert("Failed to update note");
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
    <div className="notes-bg min-vh-100 position-relative">
      <div className="container py-5">
        <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h2 className="fw-bold text-white">✏️ Edit Note</h2>
          <Link to="/notes" className="btn btn-outline-light">
            ← Back
          </Link>
        </div>

        <div className="card shadow-lg border-0 p-4 notes-card">
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
              <label className="form-label">Content</label>
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
              <button type="submit" className="btn btn-gradient">
                💾 Save Changes
              </button>
              <button
                type="button"
                className="btn btn-outline-light"
                onClick={() => navigate("/notes")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* STYLES */}
      <style>{`
        .notes-bg {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%);
          min-height: 100vh;
          color: #fff;
          position: relative;
        }

        .notes-card {
          background: rgba(24, 34, 52, 0.85);
          border-radius: 16px;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .notes-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .form-label {
          font-weight: 600;
          color: #e5e7eb;
        }

        .input-field {
          border-radius: 12px;
          border: none;
          padding: 10px 14px;
          background: rgba(255,255,255,0.05);
          color: #fff;
          transition: all 0.3s;
        }
        .input-field:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.2);
          background: rgba(255,255,255,0.1);
        }
        .textarea-field {
          font-family: monospace;
        }

        .preview-card {
          background: rgba(255,255,255,0.08);
          color: #fff;
          border-radius: 12px;
          min-height: 120px;
          overflow-wrap: break-word;
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

        .btn-outline-light {
          border: 1px solid #fff;
          color: #fff;
          background: transparent;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .btn-outline-light:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 20px rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.1);
        }

        @media (max-width: 768px) {
          .d-flex.gap-2.flex-wrap { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}

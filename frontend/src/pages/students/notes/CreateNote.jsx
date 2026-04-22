// src/pages/CreateNote.jsx
import React, { useState } from "react";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";
import Stars from "../../../components/Stars";

export default function CreateNote() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: "",
    topic: "",
    instructions: "",
  });
  const [generating, setGenerating] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.topic)
      return alert("Subject and topic are required.");
    try {
      setGenerating(true);
      await api.post("/notes", {
        subject: form.subject,
        topic: form.topic,
        instructions: form.instructions,
      });
      navigate("/notes");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create note");
    } finally {
      setGenerating(false);
    }
  };
  

  return (
    <div className="create-note-bg min-vh-100 d-flex align-items-center justify-content-center py-5 position-relative">
      <Stars />
      <div className="container">
        <div className="text-center mb-4">
          <h2 className="fw-bold text-light">📝 Create AI Note</h2>
          <p className="text-light-opacity">
            Generate structured study notes with AI assistance
          </p>
        </div>

        <div className="card shadow-lg p-4 mx-auto create-note-card">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Subject</label>
              <input
                name="subject"
                className="form-control input-field"
                placeholder="Physics, Math, Chemistry..."
                value={form.subject}
                onChange={onChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Topic</label>
              <input
                name="topic"
                className="form-control input-field"
                placeholder="Newton's Laws, Quadratic Equations..."
                value={form.topic}
                onChange={onChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Optional Instructions
              </label>
              <textarea
                name="instructions"
                className="form-control input-field"
                placeholder="Formatting, depth, examples..."
                rows={4}
                value={form.instructions}
                onChange={onChange}
              />
            </div>

            <div className="d-flex gap-2 justify-content-end">
              <button
                className="btn btn-gradient btn-lg"
                type="submit"
                disabled={generating}
              >
                {generating ? "Generating..." : "Generate & Save Note"}
              </button>
              <button
                type="button"
                className="btn btn-outline-light btn-lg"
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
        .create-note-bg {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #5a77a3 100%);
          position: relative;
          overflow: hidden;
        }
        .text-light-opacity { color: rgba(255,255,255,0.7); }
        .create-note-card {
          max-width: 600px;
          border-radius: 20px;
          background: linear-gradient(145deg, #ffffff, #f8f9fa); /* Login card color */
          color: #000;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .create-note-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.25);
        }
        .input-field {
          border-radius: 12px;
          padding: 12px 14px;
          border: 1px solid #ddd;
          color: #000;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .input-field::placeholder { color: #888; }
        .input-field:focus {
          border-color: #6366f1;
          box-shadow: 0 0 12px rgba(99,102,241,0.3);
          outline: none;
        }
        .btn-gradient {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
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
          border-radius: 12px;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.7);
          transition: background 0.3s, transform 0.3s;
        }
        .btn-outline-light:hover {
          background: rgba(255,255,255,0.1);
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}

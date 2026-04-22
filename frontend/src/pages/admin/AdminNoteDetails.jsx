import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";
import { marked } from "marked";

export default function AdminNoteDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [expandedNote, setExpandedNote] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await apiAdmin.get(`/admin/users/${id}`);
        setNotes(res.data.notes || []);
      } catch (err) {
        alert("Failed to fetch notes");
        navigate("/admin/dashboard");
      }
    };
    fetchNotes();
  }, [id, navigate]);

  const toggleNote = (noteId) => {
    setExpandedNote(expandedNote === noteId ? null : noteId);
  };

  return (
    <div className="container mt-4">
      <button
        className="btn btn-secondary btn-sm mb-3"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h4 className="mb-3">📒 User Notes</h4>

      {notes.length ? notes.map((n) => (
        <div
          key={n._id}
          className="card mb-3 shadow-sm hover-card"
          style={{ transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }}
        >
          <div
            className="card-header d-flex justify-content-between align-items-center"
            style={{ backgroundColor: "#f8f9fa", fontWeight: "600" }}
          >
            <span>{n.subject} — {n.topic}</span>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => toggleNote(n._id)}
            >
              {expandedNote === n._id ? "Hide Note" : "View Note"}
            </button>
          </div>

          {expandedNote === n._id && (
            <div className="card-body">
              {n.instructions && (
                <p className="mb-2"><strong>Instructions:</strong> {n.instructions}</p>
              )}
              <div
                className="note-content"
                dangerouslySetInnerHTML={{ __html: marked(n.content )}}
              />
              {n.createdAt && (
                <p className="text-muted small mt-3">
                  Created on: {new Date(n.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      )) : (
        <div className="text-center text-muted py-4">
          No notes found for this user.
        </div>
      )}

      <style>{`
        .hover-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        }

        /* Proper note content styling */
        .note-content {
          line-height: 1.6;
          white-space: pre-wrap; /* preserve line breaks */
        }
        .note-content strong {
          font-weight: 600;
        }
        .note-content em {
          font-style: italic;
        }
        .note-content p {
          margin-bottom: 0.8rem;
        }
        .note-content ul {
          padding-left: 1.2rem;
          margin-bottom: 0.8rem;
        }
        .note-content li {
          margin-bottom: 0.4rem;
        }
      `}</style>
    </div>
  );
}

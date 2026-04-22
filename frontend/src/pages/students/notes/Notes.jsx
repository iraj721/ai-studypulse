import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { Link, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Stars from "../../../components/Stars";

export default function Notes() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const res = await api.get("/notes");
    setNotes(res.data);
  };

  const deleteNote = async (id) => {
    if (!window.confirm("Delete note?")) return;
    await api.delete(`/notes/${id}`);
    if (selected?._id === id) setSelected(null);
    fetchNotes();
  };

  const downloadPDF = async (note) => {
    const el = document.createElement("div");
    el.style.padding = "30px";
    el.style.background = "#fff";
    el.innerHTML = `
      <h2>${note.subject}</h2>
      <h4>${note.topic}</h4>
      <hr/>
      ${note.content.replace(/\n/g, "<br/>")}
    `;
    document.body.appendChild(el);

    const canvas = await html2canvas(el, { scale: 2 });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(img, "PNG", 0, 0, w, h);
    pdf.save(`${note.subject}.pdf`);
    document.body.removeChild(el);
  };

  const filtered = notes.filter(
    (n) =>
      n.subject.toLowerCase().includes(search.toLowerCase()) ||
      n.topic.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="notes-bg min-vh-100 py-5 position-relative">
      <Stars />
      <div className="container">
        {/* HEADER */}
        <div className="notes-header mb-4">
          <div>
            <h2 className="fw-bold text-light">📝 My Notes</h2>
            <p className="text-light-opacity">Manage your notes</p>
          </div>
          <div>
            <Link to="/notes/create" className="btn btn-gradient">
              ➕ Create
            </Link>
          </div>
        </div>

        <div className="row g-4">
          {/* LEFT LIST */}
          <div className="col-md-4">
            <input
              className="form-control search-input mb-3"
              placeholder="🔍 Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="notes-list">
              {filtered.map((note) => (
                <div
                  key={note._id}
                  className={`note-tile ${selected?._id === note._id ? "active" : ""}`}
                  onClick={() => setSelected(note)}
                >
                  <div>
                    <h6 className="mb-0">{note.subject}</h6>
                    <small className="note-topic">{note.topic}</small>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note._id);
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT VIEW */}
          <div className="col-md-8">
            {selected ? (
              <div className="card note-view shadow-lg border-0">
                <div className="note-view-header">
                  <div>
                    <h4>{selected.subject}</h4>
                    <span>{selected.topic}</span>
                  </div>
                  <button
                    className="btn-close"
                    onClick={() => setSelected(null)}
                  />
                </div>

                <div className="note-actions">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => navigate(`/notes/edit/${selected._id}`)}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => downloadPDF(selected)}
                  >
                    📄 PDF
                  </button>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => deleteNote(selected._id)}
                  >
                    ❌ Delete
                  </button>
                </div>

                <div className="note-content">
                  <ReactMarkdown>{selected.content}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <h5>Select a note</h5>
                <p>Choose a note from the left</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STYLES */}
      <style>{`
        .notes-bg {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #5a77a3 100%);
          position: relative;
          overflow: hidden;
        }
        .text-light-opacity { color: rgba(255,255,255,0.7); }
        .notes-header { display:flex; justify-content:space-between; align-items:center; }
        .search-input { border-radius:20px; padding:10px 14px; }
        .notes-list { max-height:70vh; overflow-y:auto; }
        
        /* LEFT LIST CARDS - subtle off-white gradient like login page */
        .note-tile {
          background: linear-gradient(145deg, #fdfdfd, #f5f5f5);
          padding:14px; border-radius:14px;
          margin-bottom:10px; display:flex; justify-content:space-between;
          align-items:center; cursor:pointer;
          box-shadow:0 4px 10px rgba(0,0,0,.1);
          transition:.3s;
          color:#111;
        }
        .note-tile:hover { transform:translateY(-2px); background: linear-gradient(145deg, #f5f5f5, #f0f0f0); }
        .note-tile.active { background: linear-gradient(135deg,#4f46e5,#6366f1); color:white; }
        .note-topic { color: rgba(0,0,0,0.6); } /* dark gray for subtle visibility */

        /* RIGHT VIEW CARD - same subtle color like login card */
        .note-view { border-radius:18px; overflow:hidden; background: linear-gradient(145deg, #fdfdfd, #f5f5f5); color:#111; }
        .note-view-header {
          background: linear-gradient(135deg,#4f46e5,#6366f1);
          color:white; padding:16px;
          display:flex; justify-content:space-between;
        }
        .note-actions {
          padding:12px; display:flex; gap:10px;
          background: #f8f9fa; border-bottom:1px solid #e5e7eb;
        }
        .note-content { padding:20px; line-height:1.7; }
        .empty-state { height:300px; display:flex; flex-direction:column;
          justify-content:center; align-items:center; color:#6b7280; }
        .btn-gradient {
          background: linear-gradient(135deg, #0066ff, #00c6ff);
          border: none;
          color: white;
          font-weight: 600;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .btn-gradient:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 12px 25px rgba(0,0,0,0.25);
          background: linear-gradient(135deg, #005ce6, #00bfff);
        }
          /* Mobile Responsive - Notes */
@media (max-width: 768px) {
  .notes-bg .container {
    padding-left: 16px;
    padding-right: 16px;
  }
  
  .notes-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .row.g-4 {
    flex-direction: column;
  }
  
  .row.g-4 .col-md-4,
  .row.g-4 .col-md-8 {
    width: 100%;
  }
  
  .notes-list {
    max-height: 300px;
    margin-bottom: 16px;
  }
  
  .note-tile {
    padding: 12px;
  }
  
  .note-view-header {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
  
  .note-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .note-actions button {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .note-content {
    padding: 12px;
    font-size: 13px;
  }
  
  .empty-state {
    padding: 40px 16px;
    text-align: center;
  }
}
      `}</style>
    </div>
  );
}

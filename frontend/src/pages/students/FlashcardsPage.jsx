import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/Toast";
import {
  FaArrowLeft, FaSync, FaArrowLeft as FaPrev, FaArrowRight as FaNext,
  FaSpinner, FaTrash, FaEye, FaTimes, FaPlus, FaBookOpen
} from "react-icons/fa";

export default function FlashcardsPage() {
  const navigate = useNavigate();
  const [flashcardGroups, setFlashcardGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [currentFlashcards, setCurrentFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchFlashcardGroups();
    fetchNotes();
  }, []);

  const fetchFlashcardGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get("/student/flashcards/groups");
      setFlashcardGroups(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await api.get("/notes");
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateFromNote = async () => {
    if (!selectedNoteId) {
      setToast({ message: "Please select a note", type: "error" });
      return;
    }
    setGenerating(true);
    try {
      await api.post("/student/flashcards/generate", { noteId: selectedNoteId, numCards: 10 });
      setToast({ message: "Flashcards generated successfully!", type: "success" });
      fetchFlashcardGroups();
      setSelectedNoteId("");
    } catch (err) {
      setToast({ message: "Failed to generate flashcards", type: "error" });
    } finally {
      setGenerating(false);
    }
  };

  const viewFlashcards = async (group) => {
    try {
      const res = await api.get(`/student/flashcards/groups/${group.noteId}`);
      setCurrentFlashcards(res.data);
      setSelectedGroup(group);
      setCurrentIndex(0);
      setIsFlipped(false);
      setShowModal(true);
    } catch (err) {
      setToast({ message: "Failed to load flashcards", type: "error" });
    }
  };

  const nextCard = () => {
    if (currentIndex + 1 < currentFlashcards.length) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex - 1 >= 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const confirmDelete = (groupId, groupTopic) => {
    setDeleteTarget({ groupId, groupTopic });
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/student/flashcards/groups/${deleteTarget.groupId}`);
      setToast({ message: `"${deleteTarget.groupTopic}" flashcards deleted!`, type: "success" });
      fetchFlashcardGroups();
      if (selectedGroup?.noteId === deleteTarget.groupId) {
        setSelectedGroup(null);
        setCurrentFlashcards([]);
        setShowModal(false);
      }
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      setToast({ message: "Failed to delete", type: "error" });
    }
  };

  const currentCard = currentFlashcards[currentIndex];

  if (loading) {
    return (
      <div className="fc-loading">
        <div className="fc-spinner-el" />
        <p>Loading flashcards...</p>
        <style>{`
          .fc-loading { position:fixed;inset:0;background:#0a0c12;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:1000; }
          .fc-spinner-el { width:48px;height:48px;border:3px solid rgba(88,130,255,0.2);border-top-color:#5882ff;border-radius:50%;animation:fc-spin 0.8s linear infinite; }
          @keyframes fc-spin { to { transform:rotate(360deg); } }
          .fc-loading p { margin-top:14px;color:#8e9cc4;font-family:sans-serif; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="fc-root">
      <div className="fc-bg" />
      <div className="fc-gridlines" />
      <div className="fc-orb fc-orb-a" />
      <div className="fc-orb fc-orb-b" />

      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      {/* ── Delete modal ── */}
      {showDeleteModal && deleteTarget && (
        <div className="fc-overlay fc-overlay-del" onClick={() => setShowDeleteModal(false)}>
          <div className="fc-modal fc-del-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fc-modal-icon">⚠️</div>
            <h3>Delete Flashcards?</h3>
            <p>
              Are you sure you want to delete all flashcards for{" "}
              <strong>"{deleteTarget.groupTopic}"</strong>?
            </p>
            <p className="fc-warn">This action cannot be undone.</p>
            <div className="fc-modal-btns">
              <button className="fc-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="fc-confirm" onClick={executeDelete}>Delete All</button>
            </div>
          </div>
        </div>
      )}

      {/* ── View modal ── */}
      {showModal && selectedGroup && (
        <div className="fc-overlay" onClick={() => setShowModal(false)}>
          {/*
            KEY FIX: modal is a flex column with fixed max-height.
            Header and footer are flex-shrink:0, body takes remaining space.
            No overflow:hidden on the wrapper — only overflow-y:auto on body if needed.
          */}
          <div className="fc-view-modal" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="fc-view-head">
              <div className="fc-view-head-info">
                <span className="fc-badge">{selectedGroup.noteSubject}</span>
                <h3>{selectedGroup.noteTopic}</h3>
                <p className="fc-modal-stats">{currentFlashcards.length} flashcards</p>
              </div>
              <button className="fc-close-btn" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            {/* Body — card + controls, scrollable if ever needed */}
            <div className="fc-view-body">
              {currentFlashcards.length > 0 && (
                <>
                  {/* Flashcard */}
                  <div className="fc-card" onClick={() => setIsFlipped(!isFlipped)}>
                    <div className={`fc-card-inner ${isFlipped ? "flipped" : ""}`}>
                      <div className="fc-front">
                        <p>{currentCard?.front}</p>
                        <small>🔁 Click to flip</small>
                      </div>
                      <div className="fc-back">
                        <p>{currentCard?.back}</p>
                        <small>✅ Correct answer</small>
                      </div>
                    </div>
                  </div>

                  {/* Controls — always visible, never cut */}
                  <div className="fc-controls">
                    <button
                      className="fc-nav-btn"
                      onClick={prevCard}
                      disabled={currentIndex === 0}
                    >
                      <FaPrev /> Prev
                    </button>
                    <span className="fc-counter">
                      {currentIndex + 1} / {currentFlashcards.length}
                    </span>
                    <button
                      className="fc-nav-btn"
                      onClick={nextCard}
                      disabled={currentIndex === currentFlashcards.length - 1}
                    >
                      Next <FaNext />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="fc-view-foot">
              <button
                className="fc-del-btn"
                onClick={() => confirmDelete(selectedGroup.noteId, selectedGroup.noteTopic)}
              >
                <FaTrash /> Delete All Flashcards
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main page ── */}
      <main className="fc-main">
        <div className="fc-container">

          <button className="fc-back-btn" onClick={() => navigate("/dashboard")}>
            <FaArrowLeft /> Back to Dashboard
          </button>

          <div className="fc-page-header">
            <div className="fc-header-icon"><FaBookOpen /></div>
            <div>
              <h1 className="fc-title">Smart <span className="fc-grad">Flashcards</span></h1>
              <p className="fc-subtitle">Generate AI-powered flashcards from your notes</p>
            </div>
          </div>

          {/* Generate section */}
          <div className="fc-gen-card">
            <h3 className="fc-gen-title">✨ Generate New Flashcards</h3>
            <div className="fc-gen-form">
              <select
                className="fc-select"
                value={selectedNoteId}
                onChange={(e) => setSelectedNoteId(e.target.value)}
              >
                <option value="">Select a note to generate flashcards...</option>
                {notes.map((note) => (
                  <option key={note._id} value={note._id}>
                    📘 {note.subject} - {note.topic}
                  </option>
                ))}
              </select>
              <button className="fc-gen-btn" onClick={generateFromNote} disabled={generating}>
                {generating ? (
                  <><FaSpinner className="fc-spin" /> Generating...</>
                ) : (
                  <><FaSync /> Generate Flashcards</>
                )}
              </button>
            </div>
          </div>

          {/* Groups */}
          {flashcardGroups.length === 0 ? (
            <div className="fc-empty">
              <div className="fc-empty-icon">🃏</div>
              <h3>No Flashcards Yet</h3>
              <p>Select a note above to generate AI-powered flashcards!</p>
            </div>
          ) : (
            <div className="fc-groups">
              {flashcardGroups.map((group, idx) => (
                <div key={idx} className="fc-group-card">
                  <div className="fc-group-top">
                    <span className="fc-badge">📚 {group.noteSubject}</span>
                    <h5 className="fc-group-topic">{group.noteTopic}</h5>
                  </div>
                  <div className="fc-group-stats">📊 {group.count} flashcards</div>
                  <div className="fc-group-btns">
                    <button className="fc-view-btn" onClick={() => viewFlashcards(group)}>
                      <FaEye /> View
                    </button>
                    <button className="fc-group-del-btn" onClick={() => confirmDelete(group.noteId, group.noteTopic)}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

        .fc-root {
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
          overflow-x: hidden;
        }

        .fc-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Decorative bg */
        .fc-bg {
          position:fixed; inset:0; z-index:0; pointer-events:none;
          background: radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88,130,255,0.08) 0%, transparent 60%);
        }
        .fc-gridlines {
          position:fixed; inset:0; z-index:0; pointer-events:none;
          background-image:
            linear-gradient(rgba(88,130,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(88,130,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .fc-orb { position:fixed; border-radius:50%; filter:blur(80px); pointer-events:none; z-index:0; }
        .fc-orb-a { width:400px; height:400px; top:-100px; left:50%; transform:translateX(-50%); background:rgba(88,130,255,0.06); animation:fcOrbA 12s ease-in-out infinite; }
        .fc-orb-b { width:250px; height:250px; bottom:10%; right:-5%; background:rgba(32,230,208,0.04); animation:fcOrbB 10s ease-in-out infinite; }
        @keyframes fcOrbA { 0%,100%{transform:translateX(-50%) scale(1)} 50%{transform:translateX(-50%) scale(1.1)} }
        @keyframes fcOrbB { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }

        /* Layout */
        .fc-main {
          position:relative; z-index:10;
          padding: 90px 2rem 3rem;
          min-height:100vh;
        }
        .fc-container {
          max-width:1000px;
          margin:0 auto;
          width:100%;
        }

        /* Back button */
        .fc-back-btn {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(88,130,255,0.1); border:1px solid var(--border);
          color:var(--accent); padding:8px 20px; border-radius:40px;
          font-size:0.85rem; cursor:pointer; margin-bottom:1.5rem;
          transition:all 0.2s; font-family:inherit;
        }
        .fc-back-btn:hover { background:rgba(88,130,255,0.2); transform:translateX(-4px); }

        /* Page header */
        .fc-page-header {
          display:flex; align-items:center; gap:1rem; margin-bottom:2rem;
          flex-wrap:wrap;
        }
        .fc-header-icon {
          width:56px; height:56px; background:rgba(88,130,255,0.1);
          border-radius:50%; display:flex; align-items:center;
          justify-content:center; font-size:1.6rem; color:var(--accent);
          flex-shrink:0;
        }
        .fc-title {
          font-family:'Syne',sans-serif;
          font-size:clamp(1.4rem,4vw,1.9rem); font-weight:700; margin-bottom:4px;
        }
        .fc-subtitle { color:var(--muted); font-size:0.85rem; }

        /* Generate card */
        .fc-gen-card {
          background:rgba(17,19,24,0.65); backdrop-filter:blur(12px);
          border:1px solid var(--border); border-radius:20px;
          padding:1.4rem; margin-bottom:2rem;
        }
        .fc-gen-title { font-size:1rem; font-weight:600; margin-bottom:1rem; }
        .fc-gen-form {
          display:flex; gap:1rem; flex-wrap:wrap;
        }
        .fc-select {
          flex:2; min-width:0;
          padding:11px 16px;
          background:rgba(255,255,255,0.04);
          border:1px solid var(--border); border-radius:12px;
          color:var(--text); font-size:0.85rem; cursor:pointer;
          font-family:inherit;
        }
        .fc-select:focus { outline:none; border-color:var(--accent); }
        .fc-gen-btn {
          padding:11px 22px; flex-shrink:0;
          background:linear-gradient(135deg,var(--accent),#3a61e0);
          border:none; border-radius:40px; color:#fff;
          font-weight:600; cursor:pointer;
          display:flex; align-items:center; gap:8px;
          transition:all 0.2s; font-family:inherit;
          white-space:nowrap;
        }
        .fc-gen-btn:hover:not(:disabled) { transform:translateY(-2px); opacity:0.9; }
        .fc-gen-btn:disabled { opacity:0.65; cursor:not-allowed; }
        .fc-spin { animation:fcOrbB 0.8s linear infinite; }
        @keyframes fcSpin { to { transform:rotate(360deg); } }
        .fc-spin { animation:fcSpin 0.8s linear infinite; }

        /* Empty */
        .fc-empty {
          text-align:center; padding:4rem 2rem;
          background:rgba(17,19,24,0.6); backdrop-filter:blur(12px);
          border:1px solid var(--border); border-radius:24px;
        }
        .fc-empty-icon { font-size:3.5rem; margin-bottom:1rem; opacity:0.5; }
        .fc-empty h3 { margin-bottom:0.5rem; }
        .fc-empty p { color:var(--muted); font-size:0.85rem; }

        /* Groups grid */
        .fc-groups {
          display:grid;
          grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));
          gap:1.25rem;
          width:100%;
        }
        .fc-group-card {
          background:rgba(17,19,24,0.65); backdrop-filter:blur(12px);
          border:1px solid var(--border); border-radius:20px;
          padding:1.25rem; transition:all 0.25s;
          display:flex; flex-direction:column; gap:0.6rem;
          min-width:0;
        }
        .fc-group-card:hover { border-color:var(--border-h); transform:translateY(-4px); }
        .fc-badge {
          display:inline-block;
          background:rgba(88,130,255,0.15); color:var(--accent);
          padding:3px 10px; border-radius:20px;
          font-size:0.68rem; font-weight:600;
        }
        .fc-group-top { display:flex; flex-direction:column; gap:6px; }
        .fc-group-topic { font-size:0.95rem; font-weight:700; }
        .fc-group-stats {
          font-size:0.75rem; color:var(--faint);
          padding-bottom:0.6rem; border-bottom:1px solid var(--border);
        }
        .fc-group-btns { display:flex; gap:0.6rem; }
        .fc-view-btn {
          flex:1; padding:8px;
          background:rgba(88,130,255,0.15); border:1px solid rgba(88,130,255,0.3);
          color:var(--accent); border-radius:12px; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:6px;
          font-size:0.83rem; font-family:inherit; transition:all 0.2s;
        }
        .fc-view-btn:hover { background:var(--accent); color:#fff; }
        .fc-group-del-btn {
          flex:1; padding:8px;
          background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.28);
          color:#f87171; border-radius:12px; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:6px;
          font-size:0.83rem; font-family:inherit; transition:all 0.2s;
        }
        .fc-group-del-btn:hover { background:#ef4444; color:#fff; border-color:#ef4444; }

        /* ── Overlay ── */
        .fc-overlay {
          position:fixed;
          /* KEY FIX: top starts below navbar (64px), not at 0 */
          top:64px;
          left:0; right:0; bottom:0;
          background:rgba(0,0,0,0.82);
          backdrop-filter:blur(4px);
          display:flex; align-items:center; justify-content:center;
          z-index:200;
          /* padding so modal never touches screen edges */
          padding:1rem;
        }
        .fc-overlay-del { z-index:300; }

        /* ── VIEW MODAL ── */
        .fc-view-modal {
          background:var(--surface);
          border:1px solid var(--border-h);
          border-radius:20px;
          width:100%;
          max-width:560px;
          /* KEY: height constrained to remaining space below navbar */
          max-height: calc(100vh - 64px - 2rem);
          display:flex;
          flex-direction:column;
          overflow:hidden;
          animation:fcPop 0.25s ease;
        }
        @keyframes fcPop {
          from { opacity:0; transform:scale(0.95); }
          to   { opacity:1; transform:scale(1); }
        }

        /* Header — fixed height */
        .fc-view-head {
          display:flex; justify-content:space-between; align-items:flex-start;
          padding:1.25rem 1.5rem;
          background:rgba(88,130,255,0.08);
          border-bottom:1px solid var(--border);
          flex-shrink:0;           /* KEY: never compress */
          gap:12px;
        }
        .fc-view-head-info { display:flex; flex-direction:column; gap:4px; min-width:0; }
        .fc-view-head-info h3 { font-size:1.1rem; }
        .fc-modal-stats { font-size:0.68rem; color:var(--muted); }
        .fc-close-btn {
          background:none; border:none; color:var(--muted);
          font-size:1.1rem; cursor:pointer; padding:4px;
          flex-shrink:0; transition:color 0.2s;
        }
        .fc-close-btn:hover { color:var(--text); }

        /* Body — scrollable, takes remaining space */
        .fc-view-body {
          flex:1;
          overflow-y:auto;         /* KEY: scrolls if content taller than available */
          overflow-x:hidden;
          padding:1.5rem;
          display:flex;
          flex-direction:column;
          gap:1.25rem;
          min-height:0;            /* KEY: flex child needs this to shrink */
        }

        /* Footer — fixed height */
        .fc-view-foot {
          padding:1rem 1.5rem;
          border-top:1px solid var(--border);
          display:flex; justify-content:flex-end;
          flex-shrink:0;           /* KEY: never compress */
        }
        .fc-del-btn {
          background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.28);
          color:#f87171; padding:8px 20px; border-radius:30px;
          cursor:pointer; display:flex; align-items:center; gap:8px;
          font-size:0.83rem; font-family:inherit; transition:all 0.2s;
        }
        .fc-del-btn:hover { background:#ef4444; color:#fff; border-color:#ef4444; }

        /* Flashcard — smaller so controls are always visible */
        .fc-card {
          width:100%;
          aspect-ratio: 16 / 7;    /* wider, shorter — controls always fit */
          min-height:140px;
          max-height:200px;
          perspective:1000px;
          cursor:pointer;
          flex-shrink:0;
        }
        .fc-card-inner {
          position:relative; width:100%; height:100%;
          transition:transform 0.55s;
          transform-style:preserve-3d;
          border-radius:18px;
        }
        .fc-card-inner.flipped { transform:rotateY(180deg); }
        .fc-front, .fc-back {
          position:absolute; inset:0;
          backface-visibility:hidden;
          border-radius:18px;
          display:flex; flex-direction:column;
          justify-content:center; align-items:center;
          padding:1.25rem; text-align:center;
        }
        .fc-front {
          background:var(--surface);
          border:1px solid var(--border);
        }
        .fc-front p { font-size:0.95rem; font-weight:500; line-height:1.55; margin-bottom:0.75rem; }
        .fc-front small { color:var(--faint); font-size:0.68rem; }
        .fc-back {
          background:linear-gradient(135deg, var(--accent), #3a61e0);
          color:#fff;
          transform:rotateY(180deg);
        }
        .fc-back p { font-size:0.9rem; line-height:1.55; }
        .fc-back small { opacity:0.75; font-size:0.65rem; margin-top:0.75rem; display:block; }

        /* Controls — always visible inside scrollable body */
        .fc-controls {
          display:flex; justify-content:center; align-items:center; gap:1.25rem;
          flex-shrink:0;
          padding-bottom:0.25rem;
        }
        .fc-nav-btn {
          background:rgba(255,255,255,0.08); border:1px solid var(--border);
          color:var(--text); padding:8px 18px; border-radius:30px;
          cursor:pointer; display:flex; align-items:center; gap:6px;
          font-size:0.83rem; font-family:inherit; transition:all 0.2s;
          white-space:nowrap;
        }
        .fc-nav-btn:hover:not(:disabled) { background:rgba(88,130,255,0.18); }
        .fc-nav-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .fc-counter { color:var(--muted); font-size:0.83rem; min-width:60px; text-align:center; }

        /* Delete modal */
        .fc-modal {
          background:var(--surface);
          border:1px solid var(--border-h);
          border-radius:24px;
          padding:2rem 1.75rem;
          width:100%; max-width:400px;
          text-align:center;
          animation:fcPop 0.25s ease;
        }
        .fc-modal-icon { font-size:2.8rem; margin-bottom:0.75rem; }
        .fc-modal h3 { font-size:1.1rem; margin-bottom:0.4rem; }
        .fc-modal p { font-size:0.83rem; color:var(--muted); margin-bottom:0.25rem; }
        .fc-warn { color:#f87171; font-size:0.78rem; margin-top:0.25rem; }
        .fc-modal-btns { display:flex; gap:0.75rem; margin-top:1.5rem; flex-wrap:wrap; }
        .fc-cancel {
          flex:1; min-width:90px; padding:10px;
          background:rgba(255,255,255,0.05); border:1px solid var(--border);
          border-radius:40px; color:var(--text); cursor:pointer;
          font-weight:500; font-family:inherit; transition:background 0.2s;
        }
        .fc-cancel:hover { background:rgba(255,255,255,0.1); }
        .fc-confirm {
          flex:1; min-width:90px; padding:10px;
          background:#ef4444; border:none; border-radius:40px;
          color:#fff; cursor:pointer; font-weight:500; font-family:inherit;
          transition:background 0.2s;
        }
        .fc-confirm:hover { background:#dc2626; }

        /* ── Responsive ── */
        @media (max-width:768px) {
          .fc-main { padding:80px 1rem 2rem; }
          .fc-page-header { gap:0.75rem; }
          .fc-header-icon { width:46px; height:46px; font-size:1.3rem; }
          .fc-gen-form { flex-direction:column; }
          .fc-gen-btn { width:100%; justify-content:center; }
          .fc-groups { grid-template-columns:1fr; }
          /* Mobile navbar is ~58px */
          .fc-overlay { top:58px; max-height:calc(100vh - 58px); }
          .fc-view-modal {
            max-height: calc(100vh - 58px - 2rem);
            border-radius:16px;
          }
          .fc-view-body { padding:1rem; gap:0.75rem; }
          .fc-view-head { padding:0.9rem 1rem; }
          .fc-view-foot { padding:0.65rem 1rem; }
          .fc-card { min-height:120px; max-height:170px; }
          .fc-nav-btn { padding:7px 14px; font-size:0.78rem; }
        }

        @media (max-width:400px) {
          .fc-controls { gap:0.75rem; }
          .fc-modal { padding:1.5rem 1.25rem; }
          .fc-modal-btns { flex-direction:column; }
        }
      `}</style>
    </div>
  );
}
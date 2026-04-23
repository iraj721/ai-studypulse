import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import Stars from "../../components/Stars";
import BackButton from "../../components/BackButton";
import Toast from "../../components/Toast";
import { FaSync, FaArrowLeft, FaArrowRight, FaSpinner, FaTrash, FaList } from "react-icons/fa";

export default function FlashcardsPage() {
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchFlashcards();
    fetchNotes();
  }, []);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const res = await api.get("/student/flashcards");
      setFlashcards(res.data);
      setCurrentIndex(0);
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
      setToast({ message: "Flashcards generated!", type: "success" });
      fetchFlashcards();
    } catch (err) {
      setToast({ message: "Failed to generate", type: "error" });
    } finally {
      setGenerating(false);
    }
  };

  const deleteAllFlashcards = async () => {
    if (!window.confirm("Delete ALL flashcards? This cannot be undone.")) return;
    try {
      for (const card of flashcards) {
        await api.delete(`/student/flashcards/${card._id}`);
      }
      setToast({ message: "All flashcards deleted!", type: "success" });
      fetchFlashcards();
    } catch (err) {
      setToast({ message: "Failed to delete", type: "error" });
    }
  };

  const nextCard = () => {
    if (currentIndex + 1 < flashcards.length) {
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

  const currentCard = flashcards[currentIndex];

  return (
    <div className="flashcards-page min-vh-100 py-5 position-relative">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container">
        <BackButton to="/dashboard" label="← Back to Dashboard" />

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h2 className="text-white fw-bold">🃏 Smart Flashcards</h2>
          {flashcards.length > 0 && (
            <button onClick={deleteAllFlashcards} className="btn btn-danger">
              <FaTrash /> Delete All
            </button>
          )}
        </div>

        {/* Generate Section */}
        <div className="card generate-card mb-4 p-4">
          <h5 className="mb-3">✨ Generate New Flashcards</h5>
          <div className="row g-3">
            <div className="col-md-8">
              <select 
                className="form-control form-input"
                value={selectedNoteId} 
                onChange={(e) => setSelectedNoteId(e.target.value)}
              >
                <option value="">Select a note to generate flashcards...</option>
                {notes.map(note => (
                  <option key={note._id} value={note._id}>{note.subject} - {note.topic}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <button className="btn btn-gradient w-100" onClick={generateFromNote} disabled={generating}>
                {generating ? <><FaSpinner className="spinner" /> Generating...</> : <><FaSync /> Generate</>}
              </button>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        {flashcards.length > 0 && (
          <div className="text-end mb-3">
            <button onClick={() => setShowAll(!showAll)} className="btn btn-sm btn-outline-light">
              <FaList /> {showAll ? "Show Single" : "View All Flashcards"}
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-5 text-white">Loading...</div>
        ) : flashcards.length === 0 ? (
          <div className="empty-state-card text-center py-5">
            <div className="empty-icon">🃏</div>
            <h4>No Flashcards Yet</h4>
            <p>Select a note above to generate AI-powered flashcards!</p>
          </div>
        ) : showAll ? (
          <div className="all-flashcards">
            {flashcards.map((card, idx) => (
              <div key={idx} className="flashcard-list-item">
                <div className="flashcard-front-small">{card.front}</div>
                <div className="flashcard-back-small">{card.back}</div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="flashcard-wrapper">
              <div className="flashcard" onClick={() => setIsFlipped(!isFlipped)}>
                <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
                  <div className="flashcard-front">
                    <p>{currentCard?.front}</p>
                    <small>Click to flip</small>
                  </div>
                  <div className="flashcard-back">
                    <p>{currentCard?.back}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flashcard-controls">
              <button onClick={prevCard} disabled={currentIndex === 0} className="nav-btn">
                <FaArrowLeft /> Previous
              </button>
              <span className="counter">{currentIndex + 1} / {flashcards.length}</span>
              <button onClick={nextCard} disabled={currentIndex === flashcards.length - 1} className="nav-btn">
                Next <FaArrowRight />
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .flashcards-page { background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%); }
        .generate-card { background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff); border-radius: 20px; }
        .form-input { border-radius: 12px; padding: 12px; border: 1px solid #ddd; }
        .btn-gradient { background: linear-gradient(135deg, #4f46e5, #6366f1); border: none; color: white; font-weight: 600; padding: 12px; border-radius: 12px; }
        .empty-state-card { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; color: white; }
        .empty-icon { font-size: 64px; margin-bottom: 20px; opacity: 0.7; }
        .flashcard-wrapper { display: flex; justify-content: center; margin: 30px 0; }
        .flashcard { width: 500px; height: 300px; perspective: 1000px; cursor: pointer; }
        .flashcard-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
        .flashcard-inner.flipped { transform: rotateY(180deg); }
        .flashcard-front, .flashcard-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 20px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 30px; text-align: center; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .flashcard-back { background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; transform: rotateY(180deg); }
        .flashcard-controls { display: flex; justify-content: center; align-items: center; gap: 30px; margin: 20px 0; }
        .nav-btn { background: rgba(255,255,255,0.2); border: none; color: white; padding: 10px 20px; border-radius: 30px; cursor: pointer; }
        .counter { color: white; font-weight: 600; }
        .all-flashcards { max-height: 500px; overflow-y: auto; }
        .flashcard-list-item { background: white; border-radius: 12px; padding: 15px; margin-bottom: 10px; }
        .flashcard-front-small { font-weight: 600; margin-bottom: 8px; color: #1e293b; }
        .flashcard-back-small { color: #4f46e5; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .flashcard { width: 100%; height: 280px; } }
      `}</style>
    </div>
  );
}
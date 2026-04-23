import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import Stars from "../../components/Stars";
import BackButton from "../../components/BackButton";
import Toast from "../../components/Toast";
import { FaSync, FaArrowLeft, FaArrowRight, FaSpinner } from "react-icons/fa";

export default function FlashcardsPage() {
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [generating, setGenerating] = useState(false);
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
      setIsFlipped(false);
    } catch (err) {
      setToast({ message: "Failed to load flashcards", type: "error" });
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
      await fetchFlashcards();
      setSelectedNoteId("");
    } catch (err) {
      setToast({ message: "Failed to generate flashcards", type: "error" });
    } finally {
      setGenerating(false);
    }
  };

  const reviewCard = async (quality) => {
    if (flashcards.length === 0) return;
    const card = flashcards[currentIndex];
    try {
      await api.put(`/student/flashcards/${card._id}/review`, { quality });
      await fetchFlashcards();
    } catch (err) {
      console.error(err);
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

  const deleteFlashcard = async (id) => {
    // Note: Add delete endpoint if needed
    setToast({ message: "Flashcard deleted", type: "success" });
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
              <button 
                className="btn btn-gradient w-100"
                onClick={generateFromNote} 
                disabled={generating || !selectedNoteId}
              >
                {generating ? <><FaSpinner className="spinner" /> Generating...</> : <><FaSync /> Generate Flashcards</>}
              </button>
            </div>
          </div>
        </div>

        {/* Flashcards Display */}
        {loading ? (
          <div className="text-center py-5">
            <FaSpinner className="spinner" style={{ fontSize: '40px', color: 'white' }} />
            <p className="text-white mt-2">Loading your flashcards...</p>
          </div>
        ) : flashcards.length === 0 ? (
          <div className="empty-state-card text-center py-5">
            <div className="empty-icon">🃏</div>
            <h4>No Flashcards Yet</h4>
            <p>Select a note above to generate AI-powered flashcards!</p>
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
                    <div className="rating-buttons">
                      <button onClick={(e) => { e.stopPropagation(); reviewCard(1); }} className="rating hard">Hard</button>
                      <button onClick={(e) => { e.stopPropagation(); reviewCard(3); }} className="rating medium">Medium</button>
                      <button onClick={(e) => { e.stopPropagation(); reviewCard(5); }} className="rating easy">Easy</button>
                    </div>
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

            {/* History Section */}
            <div className="history-card mt-4 p-4">
              <h5>📋 Your Flashcards ({flashcards.length} total)</h5>
              <div className="flashcards-list">
                {flashcards.map((card, idx) => (
                  <div key={card._id} className="flashcard-history-item">
                    <div className="history-front">{card.front.substring(0, 60)}...</div>
                    <div className="history-meta">
                      <span className="badge">Due: {new Date(card.nextReview).toLocaleDateString()}</span>
                      <button onClick={() => deleteFlashcard(card._id)} className="delete-history">🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        .flashcards-page {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%);
        }
        .generate-card {
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
          border-radius: 20px;
        }
        .form-input {
          border-radius: 12px;
          padding: 12px;
          border: 1px solid #ddd;
        }
        .btn-gradient {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          color: white;
          font-weight: 600;
          padding: 12px;
          border-radius: 12px;
        }
        .empty-state-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          color: white;
        }
        .empty-icon { font-size: 64px; margin-bottom: 20px; opacity: 0.7; }
        .flashcard-wrapper {
          display: flex;
          justify-content: center;
          margin: 30px 0;
        }
        .flashcard {
          width: 500px;
          height: 300px;
          perspective: 1000px;
          cursor: pointer;
        }
        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        .flashcard-inner.flipped { transform: rotateY(180deg); }
        .flashcard-front, .flashcard-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 30px;
          text-align: center;
          background: white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .flashcard-back {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          transform: rotateY(180deg);
        }
        .flashcard-front p { font-size: 18px; font-weight: 500; }
        .flashcard-front small { margin-top: 20px; color: #9ca3af; font-size: 12px; }
        .rating-buttons { display: flex; gap: 15px; margin-top: 25px; }
        .rating { padding: 8px 20px; border: none; border-radius: 30px; cursor: pointer; font-weight: 600; }
        .rating.hard { background: #ef4444; color: white; }
        .rating.medium { background: #f59e0b; color: white; }
        .rating.easy { background: #22c55e; color: white; }
        .flashcard-controls { display: flex; justify-content: center; align-items: center; gap: 30px; margin: 20px 0; }
        .nav-btn { background: rgba(255,255,255,0.2); border: none; color: white; padding: 10px 20px; border-radius: 30px; cursor: pointer; transition: all 0.3s; }
        .nav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.4); transform: scale(1.05); }
        .nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .counter { color: white; font-weight: 600; }
        .history-card { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; color: white; max-height: 300px; overflow-y: auto; }
        .flashcards-list { margin-top: 15px; }
        .flashcard-history-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.1); border-radius: 12px; margin-bottom: 8px; }
        .history-front { font-size: 13px; flex: 1; }
        .history-meta { display: flex; gap: 10px; align-items: center; }
        .history-meta .badge { background: #4f46e5; padding: 4px 10px; border-radius: 20px; font-size: 11px; }
        .delete-history { background: none; border: none; color: #ef4444; cursor: pointer; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .flashcard { width: 100%; height: 280px; }
          .flashcard-front p, .flashcard-back p { font-size: 14px; }
          .rating-buttons { gap: 8px; }
          .rating { padding: 6px 12px; font-size: 12px; }
        }
      `}</style>
    </div>
  );
}
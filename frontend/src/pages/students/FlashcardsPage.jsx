import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import Stars from "../../components/Stars";
import BackButton from "../../components/BackButton";
import Toast from "../../components/Toast";
import { FaSync, FaArrowLeft, FaArrowRight, FaSpinner, FaTrash, FaEye, FaTimes } from "react-icons/fa";

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
      setToast({ message: "Flashcards generated!", type: "success" });
      fetchFlashcardGroups();
      setSelectedNoteId("");
    } catch (err) {
      setToast({ message: "Failed to generate", type: "error" });
    } finally {
      setGenerating(false);
    }
  };

  const deleteGroup = async (groupId, groupTopic) => {
    if (!window.confirm(`Delete all flashcards for "${groupTopic}"?`)) return;
    try {
      await api.delete(`/student/flashcards/groups/${groupId}`);
      setToast({ message: "Flashcards deleted!", type: "success" });
      fetchFlashcardGroups();
      if (selectedGroup?.noteId === groupId) {
        setSelectedGroup(null);
        setCurrentFlashcards([]);
      }
    } catch (err) {
      setToast({ message: "Failed to delete", type: "error" });
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

  const currentCard = currentFlashcards[currentIndex];

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
              <button className="btn btn-gradient w-100" onClick={generateFromNote} disabled={generating}>
                {generating ? <><FaSpinner className="spinner" /> Generating...</> : <><FaSync /> Generate</>}
              </button>
            </div>
          </div>
        </div>

        {/* Flashcards Cards */}
        {loading ? (
          <div className="text-center py-5 text-white">Loading...</div>
        ) : flashcardGroups.length === 0 ? (
          <div className="empty-state-card text-center py-5">
            <div className="empty-icon">🃏</div>
            <h4>No Flashcards Yet</h4>
            <p>Select a note above to generate AI-powered flashcards!</p>
          </div>
        ) : (
          <div className="flashcard-groups-grid">
            {flashcardGroups.map((group, idx) => (
              <div key={idx} className="flashcard-group-card">
                <div className="group-header">
                  <h4>{group.noteSubject}</h4>
                  <h5>{group.noteTopic}</h5>
                </div>
                <div className="group-stats">
                  <span>📊 {group.count} flashcards</span>
                </div>
                <div className="group-actions">
                  <button onClick={() => viewFlashcards(group)} className="btn-view">
                    <FaEye /> View
                  </button>
                  <button onClick={() => deleteGroup(group.noteId, group.noteTopic)} className="btn-delete-group">
                    <FaTrash /> Delete All
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for viewing flashcards */}
      {showModal && selectedGroup && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedGroup.noteSubject} - {selectedGroup.noteTopic}</h3>
              <button onClick={() => setShowModal(false)} className="modal-close"><FaTimes /></button>
            </div>
            <div className="modal-body">
              {currentFlashcards.length > 0 && (
                <>
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
                  <div className="flashcard-controls">
                    <button onClick={prevCard} disabled={currentIndex === 0} className="nav-btn">
                      <FaArrowLeft /> Previous
                    </button>
                    <span className="counter">{currentIndex + 1} / {currentFlashcards.length}</span>
                    <button onClick={nextCard} disabled={currentIndex === currentFlashcards.length - 1} className="nav-btn">
                      Next <FaArrowRight />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .flashcards-page { background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%); }
        .generate-card { background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff); border-radius: 20px; }
        .form-input { border-radius: 12px; padding: 12px; border: 1px solid #ddd; }
        .btn-gradient { background: linear-gradient(135deg, #4f46e5, #6366f1); border: none; color: white; font-weight: 600; padding: 12px; border-radius: 12px; }
        .empty-state-card { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; color: white; text-align: center; padding: 50px; }
        .empty-icon { font-size: 64px; margin-bottom: 20px; opacity: 0.7; }
        .flashcard-groups-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .flashcard-group-card { background: white; border-radius: 20px; padding: 20px; transition: all 0.3s; }
        .flashcard-group-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
        .group-header h4 { font-size: 1rem; color: #4f46e5; margin-bottom: 5px; }
        .group-header h5 { font-size: 1.1rem; font-weight: 600; color: #1e293b; }
        .group-stats { margin: 15px 0; color: #64748b; font-size: 0.9rem; }
        .group-actions { display: flex; gap: 10px; }
        .btn-view { flex: 1; background: #4f46e5; color: white; border: none; padding: 8px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; }
        .btn-delete-group { flex: 1; background: #ef4444; color: white; border: none; padding: 8px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; border-radius: 24px; width: 90%; max-width: 600px; max-height: 80vh; overflow: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid #eee; }
        .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; }
        .modal-body { padding: 30px; }
        .flashcard { width: 100%; height: 300px; perspective: 1000px; cursor: pointer; margin-bottom: 20px; }
        .flashcard-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
        .flashcard-inner.flipped { transform: rotateY(180deg); }
        .flashcard-front, .flashcard-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 16px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; text-align: center; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
        .flashcard-back { background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; transform: rotateY(180deg); }
        .flashcard-controls { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 20px; }
        .nav-btn { background: #4f46e5; color: white; border: none; padding: 8px 20px; border-radius: 30px; cursor: pointer; }
        .counter { color: #64748b; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .flashcard-groups-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import Stars from "../../components/Stars";
import BackButton from "../../components/BackButton";
import Toast from "../../components/Toast";
import {
  FaSync,
  FaArrowLeft,
  FaArrowRight,
  FaSpinner,
  FaTrash,
  FaEye,
  FaTimes,
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
      await api.post("/student/flashcards/generate", {
        noteId: selectedNoteId,
        numCards: 10,
      });
      setToast({ message: "Flashcards generated!", type: "success" });
      fetchFlashcardGroups();
      setSelectedNoteId("");
    } catch (err) {
      setToast({ message: "Failed to generate", type: "error" });
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
      setToast({
        message: `"${deleteTarget.groupTopic}" flashcards deleted!`,
        type: "success",
      });
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

  return (
    <div className="flashcards-page min-vh-100 py-5 position-relative">
      <Stars />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

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
                <option value="">
                  Select a note to generate flashcards...
                </option>
                {notes.map((note) => (
                  <option key={note._id} value={note._id}>
                    📘 {note.subject} - {note.topic}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-gradient w-100"
                onClick={generateFromNote}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <FaSpinner className="spinner" /> Generating...
                  </>
                ) : (
                  <>
                    <FaSync /> Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Flashcards Cards */}
        {loading ? (
          <div className="text-center py-5 text-white">
            <FaSpinner className="spinner" style={{ fontSize: "32px" }} />
            <p className="mt-2">Loading flashcards...</p>
          </div>
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
                  <span className="group-badge">📚 {group.noteSubject}</span>
                  <h5 className="group-topic">{group.noteTopic}</h5>
                </div>
                <div className="group-stats">
                  <span>📊 {group.count} flashcards</span>
                </div>
                <div className="group-actions">
                  <button
                    onClick={() => viewFlashcards(group)}
                    className="btn-view"
                  >
                    <FaEye /> View
                  </button>
                  <button
                    onClick={() => confirmDelete(group.noteId, group.noteTopic)}
                    className="btn-delete-group"
                  >
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
              <div>
                <span className="modal-badge">{selectedGroup.noteSubject}</span>
                <h3>{selectedGroup.noteTopic}</h3>
                <p className="modal-stats">
                  {currentFlashcards.length} flashcards
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              {currentFlashcards.length > 0 && (
                <>
                  <div
                    className="flashcard"
                    onClick={() => setIsFlipped(!isFlipped)}
                  >
                    <div
                      className={`flashcard-inner ${isFlipped ? "flipped" : ""}`}
                    >
                      <div className="flashcard-front">
                        <p>{currentCard?.front}</p>
                        <small>🔁 Click to flip</small>
                      </div>
                      <div className="flashcard-back">
                        <p>{currentCard?.back}</p>
                        <small>✅ Correct answer</small>
                      </div>
                    </div>
                  </div>
                  <div className="flashcard-controls">
                    <button
                      onClick={prevCard}
                      disabled={currentIndex === 0}
                      className="nav-btn"
                    >
                      <FaArrowLeft /> Previous
                    </button>
                    <span className="counter">
                      {currentIndex + 1} / {currentFlashcards.length}
                    </span>
                    <button
                      onClick={nextCard}
                      disabled={currentIndex === currentFlashcards.length - 1}
                      className="nav-btn"
                    >
                      Next <FaArrowRight />
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={() =>
                  confirmDelete(selectedGroup.noteId, selectedGroup.noteTopic)
                }
                className="modal-delete-btn"
              >
                <FaTrash /> Delete All Flashcards
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Beautiful Delete Confirmation Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="delete-modal-icon">⚠️</div>
            <h3>Delete Flashcards?</h3>
            <p>
              Are you sure you want to delete all flashcards for{" "}
              <strong>"{deleteTarget.groupTopic}"</strong>?
            </p>
            <p className="delete-warning">
              This action cannot be undone. All {deleteTarget.groupTopic}{" "}
              flashcards will be permanently removed.
            </p>
            <div className="delete-modal-actions">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button onClick={executeDelete} className="btn-confirm-delete">
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .flashcards-page { background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%); min-height: 100vh; }
        
        /* Generate Card */
        .generate-card { background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff); border-radius: 24px; border: none; }
        .form-input { border-radius: 12px; padding: 12px 16px; border: 1px solid #e2e8f0; font-size: 14px; }
        .form-input:focus { border-color: #6366f1; outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,0.2); }
        .btn-gradient { background: linear-gradient(135deg, #4f46e5, #6366f1); border: none; color: white; font-weight: 600; padding: 12px; border-radius: 12px; transition: all 0.3s; }
        .btn-gradient:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79,70,229,0.35); }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        /* Empty State */
        .empty-state-card { background: rgba(255,255,255,0.08); backdrop-filter: blur(10px); border-radius: 24px; padding: 60px 20px; text-align: center; }
        .empty-icon { font-size: 64px; margin-bottom: 20px; opacity: 0.5; }
        .empty-state-card h4 { color: white; margin-bottom: 10px; }
        .empty-state-card p { color: rgba(255,255,255,0.7); }
        
        /* Flashcards Grid */
        .flashcard-groups-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; }
        .flashcard-group-card { background: white; border-radius: 20px; padding: 20px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .flashcard-group-card:hover { transform: translateY(-5px); box-shadow: 0 12px 25px rgba(0,0,0,0.15); }
        .group-header { margin-bottom: 15px; }
        .group-badge { display: inline-block; background: #e0e7ff; color: #4f46e5; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 10px; }
        .group-topic { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0; }
        .group-stats { color: #64748b; font-size: 0.85rem; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0; }
        .group-actions { display: flex; gap: 12px; }
        .btn-view { flex: 1; background: #4f46e5; color: white; border: none; padding: 10px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 500; transition: all 0.2s; }
        .btn-view:hover { background: #4338ca; transform: scale(1.02); }
        .btn-delete-group { flex: 1; background: #fee2e2; color: #dc2626; border: none; padding: 10px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 500; transition: all 0.2s; }
        .btn-delete-group:hover { background: #fecaca; transform: scale(1.02); }
        
        /* View Modal */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; border-radius: 28px; width: 90%; max-width: 650px; max-height: 85vh; overflow: hidden; animation: modalPop 0.3s ease; }
        @keyframes modalPop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .modal-header { padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: flex-start; }
        .modal-badge { display: inline-block; background: #e0e7ff; color: #4f46e5; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 8px; }
        .modal-header h3 { margin: 0 0 4px 0; font-size: 1.3rem; color: #1e293b; }
        .modal-stats { color: #64748b; font-size: 12px; margin: 0; }
        .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: #94a3b8; transition: all 0.2s; }
        .modal-close:hover { color: #ef4444; transform: scale(1.1); }
        .modal-body { padding: 30px; }
        .modal-footer { padding: 16px 24px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; }
        .modal-delete-btn { background: #fee2e2; color: #dc2626; border: none; padding: 10px 20px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 500; transition: all 0.2s; }
        .modal-delete-btn:hover { background: #fecaca; transform: scale(1.02); }
        
        /* Flashcard */
        .flashcard { width: 100%; height: 320px; perspective: 1000px; cursor: pointer; margin-bottom: 20px; }
        .flashcard-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; border-radius: 20px; }
        .flashcard-inner.flipped { transform: rotateY(180deg); }
        .flashcard-front, .flashcard-back { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: 20px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 30px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .flashcard-front { background: white; border: 1px solid #e2e8f0; }
        .flashcard-front p { font-size: 1.1rem; font-weight: 500; color: #1e293b; margin: 0 0 15px 0; line-height: 1.5; }
        .flashcard-front small { color: #94a3b8; font-size: 12px; }
        .flashcard-back { background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; transform: rotateY(180deg); }
        .flashcard-back p { font-size: 1rem; margin: 0; line-height: 1.5; }
        .flashcard-back small { opacity: 0.8; font-size: 11px; margin-top: 15px; display: block; }
        
        .flashcard-controls { display: flex; justify-content: center; align-items: center; gap: 20px; margin-top: 20px; }
        .nav-btn { background: #f1f5f9; color: #475569; border: none; padding: 10px 24px; border-radius: 40px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
        .nav-btn:hover:not(:disabled) { background: #4f46e5; color: white; transform: scale(1.02); }
        .nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .counter { color: #64748b; font-weight: 500; }
        
        /* Delete Modal */
        .delete-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1100; }
        .delete-modal { background: white; border-radius: 28px; padding: 32px; width: 90%; max-width: 420px; text-align: center; animation: modalPop 0.3s ease; }
        .delete-modal-icon { font-size: 56px; margin-bottom: 16px; }
        .delete-modal h3 { font-size: 1.5rem; margin: 0 0 12px 0; color: #1e293b; }
        .delete-modal p { color: #475569; margin-bottom: 8px; line-height: 1.5; }
        .delete-warning { color: #dc2626; font-size: 13px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
        .delete-modal-actions { display: flex; gap: 16px; margin-top: 24px; }
        .btn-cancel { flex: 1; background: #f1f5f9; color: #475569; border: none; padding: 12px; border-radius: 14px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .btn-cancel:hover { background: #e2e8f0; }
        .btn-confirm-delete { flex: 1; background: #dc2626; color: white; border: none; padding: 12px; border-radius: 14px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
        .btn-confirm-delete:hover { background: #b91c1c; transform: scale(1.02); }
        
        @media (max-width: 768px) {
          .flashcard-groups-grid { grid-template-columns: 1fr; }
          .flashcard { height: 280px; }
          .flashcard-front p, .flashcard-back p { font-size: 0.9rem; }
          .modal-body { padding: 20px; }
          .delete-modal { padding: 24px; }
        }
      `}</style>
    </div>
  );
}
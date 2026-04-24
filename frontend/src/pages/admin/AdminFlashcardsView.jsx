import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";
import BackButton from "../../components/BackButton";

export default function AdminFlashcardsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFlashcard, setSelectedFlashcard] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const res = await apiAdmin.get(`/admin/students/${id}/flashcards`);
      setFlashcards(res.data);
    } catch (err) {
      console.error("Error fetching flashcards:", err);
    } finally {
      setLoading(false);
    }
  };

  const openFlashcard = (card) => {
    setSelectedFlashcard(card);
    setIsFlipped(false);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100 py-4">
        <div className="container text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        <BackButton to={`/admin/users/${id}`} label="← Back to User Details" />
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">🃏 Student Flashcards</h3>
          <span className="badge bg-primary fs-6">{flashcards.length} Flashcards</span>
        </div>

        {flashcards.length === 0 ? (
          <div className="alert alert-info text-center py-5">
            <div className="fs-1 mb-3">🃏</div>
            <h5>No Flashcards Found</h5>
            <p>This student hasn't created any flashcards yet.</p>
          </div>
        ) : (
          <div className="row g-4">
            {flashcards.map((card, idx) => (
              <div key={card._id} className="col-md-4 col-lg-3">
                <div className="flashcard-admin-card" onClick={() => openFlashcard(card)}>
                  <div className="flashcard-number">#{idx + 1}</div>
                  <div className="flashcard-question">{card.front?.substring(0, 80)}...</div>
                  <div className="flashcard-answer-preview">{card.back?.substring(0, 60)}...</div>
                  <div className="flashcard-date">
                    {new Date(card.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flashcard Modal */}
      {showModal && selectedFlashcard && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>📖 Flashcard</h4>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>
            <div className="flashcard-modal" onClick={() => setIsFlipped(!isFlipped)}>
              <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
                <div className="flashcard-front-modal">
                  <div className="flashcard-label">Question</div>
                  <p>{selectedFlashcard.front}</p>
                  <small>Click to flip</small>
                </div>
                <div className="flashcard-back-modal">
                  <div className="flashcard-label">Answer</div>
                  <p>{selectedFlashcard.back}</p>
                  <small>Click to flip back</small>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <small className="text-muted">Created: {new Date(selectedFlashcard.createdAt).toLocaleString()}</small>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .flashcard-admin-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          position: relative;
          overflow: hidden;
          height: 100%;
        }
        .flashcard-admin-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 25px rgba(0,0,0,0.15);
        }
        .flashcard-number {
          position: absolute;
          top: 10px;
          right: 15px;
          font-size: 12px;
          color: #94a3b8;
        }
        .flashcard-question {
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 12px;
          color: #1e293b;
          padding-right: 30px;
        }
        .flashcard-answer-preview {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 12px;
          padding-top: 8px;
          border-top: 1px solid #e2e8f0;
        }
        .flashcard-date {
          font-size: 10px;
          color: #94a3b8;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
        }
        .modal-content {
          background: white;
          border-radius: 24px;
          width: 90%;
          max-width: 500px;
          overflow: hidden;
          animation: modalPop 0.3s ease;
        }
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e2e8f0;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
        }
        .flashcard-modal {
          height: 300px;
          perspective: 1000px;
          cursor: pointer;
          margin: 20px;
        }
        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        .flashcard-inner.flipped {
          transform: rotateY(180deg);
        }
        .flashcard-front-modal, .flashcard-back-modal {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 30px;
          text-align: center;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
        }
        .flashcard-back-modal {
          transform: rotateY(180deg);
          background: linear-gradient(135deg, #10b981, #059669);
        }
        .flashcard-label {
          font-size: 12px;
          opacity: 0.8;
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        .flashcard-front-modal p, .flashcard-back-modal p {
          font-size: 18px;
          margin: 0 0 20px 0;
          line-height: 1.5;
        }
        .flashcard-front-modal small, .flashcard-back-modal small {
          font-size: 11px;
          opacity: 0.6;
        }
        .modal-footer {
          padding: 16px 20px;
          border-top: 1px solid #e2e8f0;
        }
        @media (max-width: 768px) {
          .flashcard-modal { height: 250px; }
          .flashcard-front-modal p, .flashcard-back-modal p { font-size: 14px; }
        }
      `}</style>
    </div>
  );
}
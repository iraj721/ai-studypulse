import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";
// import BackButton from "../../components/BackButton";
import { FaArrowLeft, FaArrowRight, FaSpinner } from "react-icons/fa";

export default function AdminFlashcardsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAll, setShowAll] = useState(false);

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

  if (loading) {
    return (
      <div className="bg-light min-vh-100 py-4">
        <div className="container text-center py-5">
          <FaSpinner className="spinner" style={{ fontSize: '40px', color: '#4f46e5' }} />
          <p className="mt-3">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-flashcards-page bg-light min-vh-100 py-4">
      <div className="container">
        <BackButton to={`/admin/users/${id}`} label="← Back to User Details" />
        
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h3 className="fw-bold">🃏 Student Flashcards</h3>
          <div className="d-flex gap-2">
            <span className="badge bg-primary fs-6">{flashcards.length} Flashcards</span>
            <button onClick={() => setShowAll(!showAll)} className="btn btn-sm btn-outline-secondary">
              {showAll ? "Card View" : "List View"}
            </button>
          </div>
        </div>

        {flashcards.length === 0 ? (
          <div className="alert alert-info text-center py-5">
            <div className="fs-1 mb-3">🃏</div>
            <h5>No Flashcards Found</h5>
            <p>This student hasn't created any flashcards yet.</p>
          </div>
        ) : showAll ? (
          // List View - All flashcards
          <div className="row g-3">
            {flashcards.map((card, idx) => (
              <div key={card._id} className="col-md-6 col-lg-4">
                <div className="flashcard-list-card">
                  <div className="card-header">
                    <span className="card-number">#{idx + 1}</span>
                    <span className="card-date">{new Date(card.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="card-question">
                    <strong>Question:</strong>
                    <p>{card.front}</p>
                  </div>
                  <div className="card-answer">
                    <strong>Answer:</strong>
                    <p>{card.back}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Single Card Flip View - Like Student Side
          <div className="flashcard-viewer">
            <div className="flashcard-wrapper">
              <div className="flashcard" onClick={() => setIsFlipped(!isFlipped)}>
                <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
                  <div className="flashcard-front">
                    <div className="flashcard-label">📖 Question</div>
                    <p>{currentCard?.front}</p>
                    <small>Click to flip</small>
                  </div>
                  <div className="flashcard-back">
                    <div className="flashcard-label">✅ Answer</div>
                    <p>{currentCard?.back}</p>
                    <small>Click to flip back</small>
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
          </div>
        )}
      </div>

      <style>{`
        .admin-flashcards-page {
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
          min-height: 100vh;
        }
        .flashcard-viewer {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 30px;
        }
        .flashcard-wrapper {
          display: flex;
          justify-content: center;
          margin: 20px 0;
          width: 100%;
        }
        .flashcard {
          width: 600px;
          height: 350px;
          perspective: 1000px;
          cursor: pointer;
        }
        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s;
          transform-style: preserve-3d;
          border-radius: 20px;
        }
        .flashcard-inner.flipped {
          transform: rotateY(180deg);
        }
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
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .flashcard-front {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
        }
        .flashcard-back {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          transform: rotateY(180deg);
        }
        .flashcard-label {
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 3px;
        }
        .flashcard-front p, .flashcard-back p {
          font-size: 20px;
          margin: 0 0 25px 0;
          line-height: 1.5;
          font-weight: 500;
        }
        .flashcard-front small, .flashcard-back small {
          font-size: 12px;
          opacity: 0.7;
        }
        .flashcard-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 30px;
          margin-top: 30px;
        }
        .nav-btn {
          background: #4f46e5;
          color: white;
          border: none;
          padding: 10px 25px;
          border-radius: 40px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s;
        }
        .nav-btn:hover:not(:disabled) {
          transform: scale(1.05);
          background: #4338ca;
        }
        .nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .counter {
          font-size: 16px;
          font-weight: 600;
          color: #475569;
        }
        .flashcard-list-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: all 0.3s;
          height: 100%;
        }
        .flashcard-list-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        .card-number {
          font-size: 12px;
          color: #4f46e5;
          font-weight: 600;
        }
        .card-date {
          font-size: 10px;
          color: #94a3b8;
        }
        .card-question, .card-answer {
          margin-bottom: 10px;
        }
        .card-question strong, .card-answer strong {
          font-size: 12px;
          color: #64748b;
        }
        .card-question p, .card-answer p {
          margin: 5px 0 0 0;
          font-size: 13px;
          color: #1e293b;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .flashcard { width: 100%; height: 280px; }
          .flashcard-front p, .flashcard-back p { font-size: 14px; }
          .nav-btn { padding: 6px 15px; font-size: 12px; }
        }
      `}</style>
    </div>
  );
}
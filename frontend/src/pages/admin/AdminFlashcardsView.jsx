import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";
import Stars from "../../components/Stars";
import BackButton from "../../components/BackButton";

export default function AdminFlashcardsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const res = await apiAdmin.get(`/admin/students/${id}/flashcards`);
      setFlashcards(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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
        <h3 className="mb-4 fw-bold">🃏 Student Flashcards</h3>
        <p className="text-muted mb-4">Total: {flashcards.length} flashcards</p>
        
        {flashcards.length === 0 ? (
          <div className="alert alert-info text-center">No flashcards found for this student.</div>
        ) : (
          <div className="row g-3">
            {flashcards.map((card, idx) => (
              <div key={card._id} className="col-md-6 col-lg-4">
                <div className="card shadow-sm h-100 border-0 hover-card">
                  <div className="card-body">
                    <div className="badge bg-primary mb-2">Flashcard #{idx + 1}</div>
                    <div className="mb-3">
                      <div className="fw-bold text-primary mb-1">📖 Front:</div>
                      <p className="mb-0">{card.front}</p>
                    </div>
                    <div>
                      <div className="fw-bold text-success mb-1">📝 Back:</div>
                      <p className="mb-0">{card.back}</p>
                    </div>
                    <hr />
                    <small className="text-muted">
                      Created: {new Date(card.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .hover-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }
      `}</style>
    </div>
  );
}
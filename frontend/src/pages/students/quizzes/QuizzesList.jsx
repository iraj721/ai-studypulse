import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { Link } from "react-router-dom";
import Stars from "../../../components/Stars";
import BackButton from "../../../components/BackButton";
import Toast from "../../../components/Toast";

export default function QuizzesList() {
  const [quizzes, setQuizzes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get("/quizzes");
      setQuizzes(res.data);
    } catch (err) {
      setToast({ message: "Failed to fetch quizzes", type: "error" });
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/quizzes/${selectedQuizId}`);
      setQuizzes((prev) => prev.filter((q) => q._id !== selectedQuizId));
      setToast({ message: "Quiz deleted successfully!", type: "success" });
      setShowModal(false);
      setSelectedQuizId(null);
    } catch (err) {
      setToast({ message: "Failed to delete quiz", type: "error" });
    }
  };

  const openDeleteModal = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedQuizId(id);
    setShowModal(true);
  };

  return (
    <div className="min-vh-100 quizzes-bg d-flex justify-content-center align-items-start pt-5 pb-5 position-relative">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container" style={{ maxWidth: "900px" }}>
        <BackButton to="/dashboard" label="← Back to Dashboard" />

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h3 className="fw-bold text-light">📋 Your Quizzes</h3>
          <Link to="/quizzes/generate" className="btn btn-gradient">
            + Generate New Quiz
          </Link>
        </div>

        {quizzes.length === 0 ? (
          <div className="alert alert-info text-center bg-transparent text-light border-light">
            No quizzes yet — generate your first quiz!
          </div>
        ) : (
          <div className="quiz-list">
            {quizzes.map((q) => (
              <Link
                key={q._id}
                to={`/quizzes/${q._id}`}
                className="quiz-item d-flex justify-content-between align-items-center p-4 mb-3 shadow-sm rounded-3 text-decoration-none"
              >
                <div>
                  <strong className="fs-5">{q.topic}</strong>
                  <div className="text-muted small mt-1">
                    Created: {new Date(q.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <span className={`badge ${q.score === null ? "bg-secondary" : "bg-success"} fs-6 px-3 py-2`}>
                    {q.score === null ? "Not taken" : Math.round(q.score) + "%"}
                  </span>
                  <button className="btn btn-sm btn-outline-danger" onClick={(e) => openDeleteModal(q._id, e)}>
                    🗑 Delete
                  </button>
                  <span className="text-muted">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="custom-modal">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow p-3">
              <div className="modal-header pb-2">
                <h5 className="modal-title text-danger fw-bold">⚠️ Delete Quiz?</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body py-3">
                <p>Are you sure you want to delete this quiz?</p>
                <span className="text-danger fw-semibold">This action cannot be undone.</span>
              </div>
              <div className="modal-footer pt-2 d-flex gap-2">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={confirmDelete}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .quizzes-bg {
          background: linear-gradient(180deg, #080e18ff 0%, #122138ff 25%, #1e3652ff 50%, #28507eff 75%, #5a77a3ff 100%);
        }
        .btn-gradient {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          color: white;
        }
        .quiz-item {
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
          transition: all 0.3s ease;
        }
        .quiz-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 25px rgba(0,0,0,0.2);
        }
        .custom-modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
        }
        .custom-modal .modal-content { background: white; width: 400px; max-width: 90%; }
        @media (max-width: 768px) {
          .quiz-item { flex-direction: column; text-align: center; gap: 12px; }
          .d-flex.align-items-center { justify-content: center; }
        }
      `}</style>
    </div>
  );
}
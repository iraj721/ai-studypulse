import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { Link } from "react-router-dom";
import Stars from "../../../components/Stars";

export default function QuizzesList() {
  const [quizzes, setQuizzes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get("/quizzes");
      setQuizzes(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch quizzes");
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/quizzes/${selectedQuizId}`);
      setQuizzes((prev) => prev.filter((q) => q._id !== selectedQuizId));
      setShowModal(false);
      setSelectedQuizId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete quiz");
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
      <div className="container" style={{ maxWidth: "800px" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold text-light">Your Quizzes</h3>
          <Link to="/quizzes/generate" className="btn btn-gradient">
            Generate Quiz
          </Link>
        </div>

        {/* Quiz List */}
        {quizzes.length === 0 ? (
          <div className="alert alert-info text-center">
            No quizzes yet — generate one!
          </div>
        ) : (
          <div className="list-group quiz-list">
            {quizzes.map((q) => (
              <Link
                key={q._id}
                to={`/quizzes/${q._id}`}
                className="list-group-item list-group-item-action quiz-item d-flex justify-content-between align-items-center p-4 mb-3 shadow-sm rounded-3"
              >
                <div>
                  <strong className="fs-5">{q.topic}</strong>
                  <div className="text-muted small mt-1">
                    Created: {new Date(q.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span
                    className={`badge ${
                      q.score === null ? "bg-secondary" : "bg-success"
                    } fs-6`}
                  >
                    {q.score === null ? "Not taken" : Math.round(q.score) + "%"}
                  </span>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={(e) => openDeleteModal(q._id, e)}
                  >
                    Delete
                  </button>
                  <span className="text-muted fw-semibold">View →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
        {showModal && (
          <div className="custom-modal">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content rounded-4 shadow p-3">
                <div className="modal-header pb-2">
                  <h5 className="modal-title text-danger fw-bold">
                    Delete Quiz?
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedQuizId(null);
                    }}
                  ></button>
                </div>

                <div className="modal-body py-4 px-4">
                  <p className="mb-0 fs-6 lh-lg">
                    Are you sure you want to delete this quiz?
                    <br />
                    <span className="text-danger fw-semibold">
                      This action cannot be undone.
                    </span>
                  </p>
                </div>

                <div className="modal-footer pt-2 px-4 flex gap-3">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedQuizId(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={confirmDelete}>
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
           .quizzes-bg {
          background: linear-gradient(180deg,
            #080e18ff 0%,
            #122138ff 25%,
            #1e3652ff 50%,
            #28507eff 75%,
            #5a77a3ff 100%);
          position: relative;
          overflow: hidden;
        }
.btn-gradient {
  position: relative;     
  z-index: 5;              
  cursor: pointer;       
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
         .quiz-item {
          background: rgba(255,255,255,0.95);
          transition: transform 0.3s, box-shadow 0.3s, background 0.3s;
        }
         .quiz-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 35px rgba(0,0,0,0.2);
          background: rgba(240, 248, 255, 0.9);
        }
        .quiz-list .badge {
          min-width: 80px;
          text-align: center;
        }
           .alert-info {
          background: rgba(255,255,255,0.85);
          color: #333;
        }

        .custom-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.custom-modal .modal-content {
background: #ffffff;
  color: #212529;
  z-index: 1051;
  pointer-events: auto;
}

      `}</style>
    </div>
  );
}

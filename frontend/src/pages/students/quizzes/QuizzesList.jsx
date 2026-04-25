import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { Link } from "react-router-dom";
import Toast from "../../../components/Toast";
import { 
  FaArrowLeft, FaPlus, FaTrash, FaChartLine, 
  FaSpinner, FaFileAlt, FaClock
} from "react-icons/fa";

export default function QuizzesList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [selectedQuizTopic, setSelectedQuizTopic] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await api.get("/quizzes");
      setQuizzes(res.data);
    } catch (err) {
      setToast({ message: "Failed to fetch quizzes", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (id, topic, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedQuizId(id);
    setSelectedQuizTopic(topic);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedQuizId) return;
    try {
      await api.delete(`/quizzes/${selectedQuizId}`);
      setQuizzes((prev) => prev.filter((q) => q._id !== selectedQuizId));
      setToast({ message: "Quiz deleted successfully!", type: "success" });
      setShowModal(false);
      setSelectedQuizId(null);
      setSelectedQuizTopic("");
    } catch (err) {
      setToast({ message: "Failed to delete quiz", type: "error" });
    }
  };

  const getScoreColor = (score) => {
    if (score === null) return "#49587a";
    if (score >= 80) return "#10b981";
    if (score >= 60) return "#f59e0b";
    return "#ef4444";
  };

  if (loading) {
    return (
      <div className="quiz-loading">
        <div className="quiz-spinner"></div>
        <p>Loading your quizzes...</p>
      </div>
    );
  }

  return (
    <div className="quiz-root">
      {/* Background */}
      <div className="quiz-bg" />
      <div className="quiz-grid" />
      <div className="quiz-orb quiz-orb-a" />
      <div className="quiz-orb quiz-orb-b" />

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      {/* Delete Modal */}
      {showModal && (
        <div className="delete-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">⚠️</div>
            <h3>Delete Quiz?</h3>
            <p>Are you sure you want to delete <strong>"{selectedQuizTopic}"</strong>?</p>
            <p className="delete-warning">This action cannot be undone. All progress will be lost.</p>
            <div className="delete-modal-actions">
              <button className="delete-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="delete-confirm" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="quiz-main">
        <div className="quiz-container">
          {/* Header */}
          <div className="quiz-header">
            <div>
              <h1 className="quiz-title">My <span className="quiz-grad">Quizzes</span></h1>
              <p className="quiz-subtitle">Track your quiz performance and generate new challenges</p>
            </div>
            <Link to="/quizzes/generate" className="quiz-generate-btn">
              <FaPlus /> Generate New Quiz
            </Link>
          </div>

          {/* Quizzes List */}
          {quizzes.length === 0 ? (
            <div className="quiz-empty">
              <div className="quiz-empty-icon">📝</div>
              <h3>No Quizzes Yet</h3>
              <p>Generate your first AI-powered quiz to test your knowledge!</p>
              <Link to="/quizzes/generate" className="quiz-empty-btn">
                <FaPlus /> Generate Quiz
              </Link>
            </div>
          ) : (
            <div className="quiz-list">
              {quizzes.map((quiz) => (
                <Link
                  key={quiz._id}
                  to={`/quizzes/${quiz._id}`}
                  className="quiz-card"
                >
                  <div className="quiz-card-header">
                    <div className="quiz-icon">
                      <FaFileAlt />
                    </div>
                    <div className="quiz-info">
                      <h3 className="quiz-topic">{quiz.topic}</h3>
                      <div className="quiz-meta">
                        <span className="quiz-date">
                          <FaClock /> {new Date(quiz.createdAt).toLocaleDateString()}
                        </span>
                        <span className="quiz-questions">
                          {quiz.questions?.length || 0} questions
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="quiz-card-footer">
                    {quiz.score !== null ? (
                      <div className="quiz-score">
                        <div className="score-circle" style={{ borderColor: getScoreColor(quiz.score) }}>
                          <span className="score-value">{Math.round(quiz.score)}%</span>
                        </div>
                        <div className="score-label">Last Score</div>
                      </div>
                    ) : (
                      <div className="quiz-not-taken">
                        <div className="pending-icon">⏳</div>
                        <div className="pending-text">Not taken yet</div>
                      </div>
                    )}
                    <button
                      className="quiz-delete-btn"
                      onClick={(e) => openDeleteModal(quiz._id, quiz.topic, e)}
                      title="Delete quiz"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .quiz-root {
          --bg: #0a0c12;
          --surface: #111318;
          --border: rgba(88, 130, 255, 0.12);
          --border-h: rgba(88, 130, 255, 0.28);
          --accent: #5882ff;
          --accent2: #20e6d0;
          --violet: #9b7aff;
          --text: #edf2ff;
          --muted: #8e9cc4;
          --faint: #49587a;
          --fd: 'Syne', sans-serif;
          --fb: 'Inter', sans-serif;
          --success: #10b981;
          --warning: #f59e0b;
          --error: #ef4444;
        }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .quiz-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }

        .quiz-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background */
        .quiz-bg {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.08) 0%, transparent 60%);
        }
        .quiz-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image: linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .quiz-orb {
          position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .quiz-orb-a { width: 400px; height: 400px; top: -100px; left: 50%; transform: translateX(-50%); background: rgba(88, 130, 255, 0.06); animation: orbFloat 12s infinite; }
        .quiz-orb-b { width: 250px; height: 250px; bottom: 10%; right: -5%; background: rgba(32, 230, 208, 0.04); animation: orbFloat2 10s infinite; }
        @keyframes orbFloat { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.1); } }
        @keyframes orbFloat2 { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }

        /* Loading */
        .quiz-loading {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: #0a0c12;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .quiz-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(88, 130, 255, 0.2);
          border-top-color: #5882ff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .quiz-loading p { margin-top: 15px; color: #8e9cc4; }

        /* Main Content */
        .quiz-main {
          position: relative;
          z-index: 10;
          max-width: 900px;
          margin: 0 auto;
          padding: 90px 2rem 3rem;
          min-height: 100vh;
        }

        /* Header */
        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .quiz-title {
          font-family: var(--fd);
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .quiz-subtitle {
          color: var(--muted);
          font-size: 0.85rem;
        }
        .quiz-generate-btn {
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: white;
          padding: 10px 24px;
          border-radius: 40px;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .quiz-generate-btn:hover {
          transform: translateY(-2px);
          opacity: 0.9;
        }

        /* Empty State */
        .quiz-empty {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(17, 19, 24, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 24px;
        }
        .quiz-empty-icon { font-size: 4rem; margin-bottom: 1rem; opacity: 0.5; }
        .quiz-empty h3 { margin-bottom: 0.5rem; color: var(--text); }
        .quiz-empty p { color: var(--muted); margin-bottom: 1.5rem; }
        .quiz-empty-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: white;
          padding: 10px 24px;
          border-radius: 40px;
          text-decoration: none;
          font-weight: 600;
        }

        /* Quiz List */
        .quiz-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .quiz-card {
          background: rgba(17, 19, 24, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1.25rem;
          transition: all 0.3s;
          text-decoration: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .quiz-card:hover {
          border-color: var(--border-h);
          transform: translateX(4px);
          background: rgba(88, 130, 255, 0.05);
        }
        .quiz-card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }
        .quiz-icon {
          width: 50px;
          height: 50px;
          background: rgba(88, 130, 255, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: var(--accent);
        }
        .quiz-info {
          flex: 1;
        }
        .quiz-topic {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: var(--text);
        }
        .quiz-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.7rem;
          color: var(--faint);
        }
        .quiz-date, .quiz-questions {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .quiz-card-footer {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .quiz-score {
          text-align: center;
          min-width: 70px;
        }
        .score-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 3px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 4px;
        }
        .score-value {
          font-size: 0.85rem;
          font-weight: 700;
        }
        .score-label {
          font-size: 0.65rem;
          color: var(--muted);
        }
        .quiz-not-taken {
          text-align: center;
          min-width: 70px;
        }
        .pending-icon {
          font-size: 1.5rem;
          margin-bottom: 2px;
        }
        .pending-text {
          font-size: 0.65rem;
          color: var(--muted);
        }
        .quiz-delete-btn {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 8px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .quiz-delete-btn:hover {
          background: #ef4444;
          color: white;
        }

        /* Delete Modal */
        .delete-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .delete-modal-content {
          background: var(--surface);
          border-radius: 24px;
          padding: 2rem;
          width: 90%;
          max-width: 400px;
          text-align: center;
          border: 1px solid var(--border);
          animation: modalPop 0.3s ease;
        }
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .delete-modal-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .delete-modal-content h3 {
          margin-bottom: 0.5rem;
        }
        .delete-modal-content p {
          color: var(--muted);
          margin-bottom: 0.5rem;
        }
        .delete-warning {
          color: #f87171;
          font-size: 0.8rem;
        }
        .delete-modal-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .delete-cancel {
          flex: 1;
          padding: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: 40px;
          color: var(--text);
          cursor: pointer;
        }
        .delete-confirm {
          flex: 1;
          padding: 10px;
          background: #ef4444;
          border: none;
          border-radius: 40px;
          color: white;
          cursor: pointer;
        }
        .delete-confirm:hover {
          background: #dc2626;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .quiz-main { padding: 80px 1rem 2rem; }
          .quiz-title { font-size: 1.5rem; }
          .quiz-header { flex-direction: column; align-items: flex-start; }
          .quiz-generate-btn { width: 100%; justify-content: center; }
          .quiz-card { flex-direction: column; align-items: flex-start; }
          .quiz-card-footer { width: 100%; justify-content: space-between; }
          .quiz-delete-btn { padding: 6px 12px; }
        }
      `}</style>
    </div>
  );
}
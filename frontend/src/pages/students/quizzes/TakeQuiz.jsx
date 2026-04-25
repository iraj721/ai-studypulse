import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import Toast from "../../../components/Toast";
import { 
  FaArrowLeft, FaSpinner, FaCheckCircle, FaTimesCircle,
  FaClock, FaChartLine, FaRedo, FaEye
} from "react-icons/fa";

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showCorrectOnly, setShowCorrectOnly] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/quizzes/${id}`);
      if (!res.data || !res.data.questions) throw new Error("Invalid quiz data");
      setQuiz(res.data);
      setAnswers(new Array(res.data.questions.length).fill(null));
    } catch (err) {
      setToast({ message: "Failed to load quiz", type: "error" });
      navigate("/quizzes");
    }
  };

  const choose = (qIndex, option) => {
    if (result) return;
    const copy = [...answers];
    copy[qIndex] = option;
    setAnswers(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const unansweredCount = answers.filter(a => a === null).length;
    if (unansweredCount > 0) {
      if (!window.confirm(`You have ${unansweredCount} unanswered question(s). Submit anyway?`)) return;
    }
    setLoading(true);
    try {
      const res = await api.post(`/quizzes/${id}/submit`, { answers });
      setResult({ ...res.data, userAnswers: [...answers] });
      setToast({
        message: `Quiz submitted! Score: ${res.data.scorePercent}%`,
        type: "success",
      });
    } catch (err) {
      setToast({ message: "Failed to submit quiz", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const retakeQuiz = () => {
    setAnswers(new Array(quiz.questions.length).fill(null));
    setResult(null);
    setShowCorrectOnly(false);
    setTimeSpent(0);
  };

  const getScoreColor = (percent) => {
    if (percent >= 80) return "#10b981";
    if (percent >= 60) return "#f59e0b";
    return "#ef4444";
  };

  if (!quiz) {
    return (
      <div className="take-loading">
        <div className="take-spinner"></div>
        <p>Loading quiz...</p>
      </div>
    );
  }

  const totalQuestions = quiz.questions?.length || 0;
  const answeredCount = answers.filter(a => a !== null).length;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  return (
    <div className="take-root">
      {/* Background */}
      <div className="take-bg" />
      <div className="take-grid" />
      <div className="take-orb take-orb-a" />
      <div className="take-orb take-orb-b" />

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      {/* Main Content */}
      <main className="take-main">
        <div className="take-container">
          {/* Back Button */}
          <button className="take-back" onClick={() => navigate("/quizzes")}>
            <FaArrowLeft /> Back to Quizzes
          </button>

          {/* Quiz Header */}
          <div className="take-header">
            <div>
              <h1 className="take-title">{quiz.topic}</h1>
              <div className="take-meta">
                <span className="take-questions">{totalQuestions} Questions</span>
                {!result && (
                  <span className="take-progress-badge">
                    {answeredCount} / {totalQuestions} Answered
                  </span>
                )}
              </div>
            </div>
            {result && (
              <div className="take-score-card">
                <div className="score-circle" style={{ borderColor: getScoreColor(result.scorePercent) }}>
                  <span className="score-value">{Math.round(result.scorePercent)}%</span>
                </div>
                <div className="score-details">
                  <span className="score-raw">{result.scoreRaw} / {result.total}</span>
                  <span className="score-label">Correct Answers</span>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {!result && (
            <div className="take-progress">
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <div className="progress-text">{answeredCount} of {totalQuestions} answered</div>
            </div>
          )}

          {/* Result Actions */}
          {result && (
            <div className="take-result-actions">
              <button className="retake-btn" onClick={retakeQuiz}>
                <FaRedo /> Retake Quiz
              </button>
              <button className="show-answers-btn" onClick={() => setShowCorrectOnly(!showCorrectOnly)}>
                <FaEye /> {showCorrectOnly ? "Hide Correct Answers" : "Show Correct Answers"}
              </button>
            </div>
          )}

          {/* Questions */}
          <form onSubmit={handleSubmit} className="take-form">
            {quiz.questions.map((q, i) => {
              const correctAnswer = q.answer ? q.answer.trim() : "";
              const userAnswer = result ? result.userAnswers[i]?.trim() : "";
              const isCorrect = result && userAnswer === correctAnswer;
              const isIncorrect = result && userAnswer && userAnswer !== correctAnswer;
              const isUnanswered = result && !userAnswer;

              return (
                <div key={i} className={`take-question-card ${result ? "completed" : ""}`}>
                  <div className="question-header">
                    <span className="question-number">Question {i + 1}</span>
                    {result && (
                      <span className={`question-status ${isCorrect ? "correct" : isIncorrect ? "incorrect" : "unanswered"}`}>
                        {isCorrect && <FaCheckCircle />}
                        {isIncorrect && <FaTimesCircle />}
                        {isUnanswered && "❓"}
                        {isCorrect ? " Correct" : isIncorrect ? " Incorrect" : " Unanswered"}
                      </span>
                    )}
                  </div>
                  
                  <div className="question-text">{q.question}</div>
                  
                  <div className="options-group">
                    {q.options.map((opt, idx) => {
                      const optionTrimmed = opt.trim();
                      let optionClass = "";
                      let icon = "";
                      
                      if (result && !showCorrectOnly) {
                        if (optionTrimmed === correctAnswer) {
                          optionClass = "correct-option";
                          icon = "✅";
                        } else if (optionTrimmed === userAnswer) {
                          optionClass = "incorrect-option";
                          icon = "❌";
                        }
                      } else if (result && showCorrectOnly && optionTrimmed === correctAnswer) {
                        optionClass = "correct-option";
                        icon = "✅";
                      }
                      
                      return (
                        <label
                          key={idx}
                          className={`option-label ${optionClass} ${answers[i] === opt ? "selected" : ""}`}
                        >
                          <input
                            type="radio"
                            className="option-radio"
                            name={`q${i}`}
                            checked={answers[i] === opt}
                            disabled={!!result}
                            onChange={() => choose(i, opt)}
                          />
                          <span className="option-text">{opt}</span>
                          {icon && <span className="option-icon">{icon}</span>}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {!result && (
              <button
                type="submit"
                className="take-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner" /> Submitting...
                  </>
                ) : (
                  <>
                    Submit Quiz
                  </>
                )}
              </button>
            )}
          </form>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .take-root {
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
          --error: #ef4444;
        }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .take-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }

        /* Background */
        .take-bg {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.08) 0%, transparent 60%);
        }
        .take-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image: linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .take-orb {
          position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .take-orb-a { width: 400px; height: 400px; top: -100px; left: 50%; transform: translateX(-50%); background: rgba(88, 130, 255, 0.06); animation: orbFloat 12s infinite; }
        .take-orb-b { width: 250px; height: 250px; bottom: 10%; right: -5%; background: rgba(32, 230, 208, 0.04); animation: orbFloat2 10s infinite; }
        @keyframes orbFloat { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.1); } }
        @keyframes orbFloat2 { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }

        /* Loading */
        .take-loading {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: #0a0c12;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .take-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(88, 130, 255, 0.2);
          border-top-color: #5882ff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .take-loading p { margin-top: 15px; color: #8e9cc4; }

        /* Main Content */
        .take-main {
          position: relative;
          z-index: 10;
          max-width: 900px;
          margin: 0 auto;
          padding: 90px 2rem 3rem;
          min-height: 100vh;
        }

        /* Back Button */
        .take-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(88, 130, 255, 0.1);
          border: 1px solid var(--border);
          color: var(--accent);
          padding: 8px 20px;
          border-radius: 40px;
          font-size: 0.85rem;
          cursor: pointer;
          margin-bottom: 1.5rem;
          transition: all 0.2s;
        }
        .take-back:hover {
          background: rgba(88, 130, 255, 0.2);
          transform: translateX(-4px);
        }

        /* Header */
        .take-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .take-title {
          font-family: var(--fd);
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .take-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          color: var(--muted);
        }
        .take-progress-badge {
          background: rgba(88, 130, 255, 0.15);
          padding: 4px 12px;
          border-radius: 20px;
          color: var(--accent);
        }
        .take-score-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: rgba(17, 19, 24, 0.6);
          padding: 0.75rem 1.5rem;
          border-radius: 20px;
          border: 1px solid var(--border);
        }
        .score-circle {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 3px solid;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .score-value {
          font-size: 1.1rem;
          font-weight: 700;
        }
        .score-details {
          text-align: center;
        }
        .score-raw {
          font-size: 1rem;
          font-weight: 600;
          display: block;
        }
        .score-label {
          font-size: 0.7rem;
          color: var(--muted);
        }

        /* Progress Bar */
        .take-progress {
          margin-bottom: 1.5rem;
        }
        .progress-bar-container {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          height: 6px;
          overflow: hidden;
        }
        .progress-bar {
          background: linear-gradient(90deg, var(--accent), var(--accent2));
          height: 100%;
          transition: width 0.3s;
        }
        .progress-text {
          text-align: center;
          font-size: 0.7rem;
          color: var(--muted);
          margin-top: 0.5rem;
        }

        /* Result Actions */
        .take-result-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .retake-btn, .show-answers-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: 40px;
          color: var(--text);
          cursor: pointer;
          transition: all 0.2s;
        }
        .retake-btn:hover, .show-answers-btn:hover {
          background: rgba(88, 130, 255, 0.1);
          border-color: var(--accent);
        }

        /* Questions */
        .take-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .take-question-card {
          background: rgba(17, 19, 24, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1.5rem;
          transition: all 0.3s;
        }
        .take-question-card:hover {
          border-color: var(--border-h);
        }
        .take-question-card.completed {
          border-left: 3px solid var(--accent);
        }
        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .question-number {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent);
        }
        .question-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 500;
        }
        .question-status.correct {
          color: #34d399;
        }
        .question-status.incorrect {
          color: #f87171;
        }
        .question-status.unanswered {
          color: var(--faint);
        }
        .question-text {
          font-size: 1rem;
          font-weight: 500;
          margin-bottom: 1rem;
          line-height: 1.4;
        }
        .options-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .option-label {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .option-label:hover:not(.correct-option):not(.incorrect-option) {
          background: rgba(88, 130, 255, 0.08);
          border-color: var(--accent);
        }
        .option-label.selected {
          background: rgba(88, 130, 255, 0.15);
          border-color: var(--accent);
        }
        .option-label.correct-option {
          background: rgba(16, 185, 129, 0.15);
          border-color: #10b981;
        }
        .option-label.incorrect-option {
          background: rgba(239, 68, 68, 0.15);
          border-color: #ef4444;
        }
        .option-radio {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--accent);
        }
        .option-text {
          flex: 1;
          font-size: 0.9rem;
        }
        .option-icon {
          font-size: 0.9rem;
        }

        /* Submit Button */
        .take-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--success), #059669);
          border: none;
          border-radius: 48px;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s;
          margin-top: 1rem;
        }
        .take-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          opacity: 0.9;
        }
        .take-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .spinner {
          animation: spin 0.8s linear infinite;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .take-main { padding: 80px 1rem 2rem; }
          .take-title { font-size: 1.3rem; }
          .take-header { flex-direction: column; align-items: flex-start; }
          .take-score-card { width: 100%; justify-content: center; }
          .take-result-actions { flex-direction: column; }
          .retake-btn, .show-answers-btn { width: 100%; justify-content: center; }
          .take-question-card { padding: 1rem; }
          .question-text { font-size: 0.9rem; }
          .option-text { font-size: 0.85rem; }
          .option-label { padding: 8px 12px; }
          .take-back { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
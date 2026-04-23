import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import Stars from "../../../components/Stars";
import BackButton from "../../../components/BackButton";
import Toast from "../../../components/Toast";

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showCorrectOnly, setShowCorrectOnly] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/quizzes/${id}`);
      if (!res.data || !res.data.questions)
        throw new Error("Invalid quiz data");
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
    if (answers.some((a) => a === null)) {
      if (!window.confirm("Some questions unanswered. Submit anyway?")) return;
    }
    setLoading(true);
    try {
      const res = await api.post(`/quizzes/${id}/submit`, { answers });
      setResult({ ...res.data, userAnswers: [...answers] });
      setShowCorrectOnly(false);
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

  if (!quiz) {
    return (
      <div className="min-vh-100 quiz-page-bg d-flex align-items-center justify-content-center">
        <div className="text-light fs-4">Loading quiz...</div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 quiz-page-bg position-relative py-5">
      <Stars />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      <div className="container">
        <BackButton to="/quizzes" label="← Back to Quizzes" />

        <h3 className="text-light fw-bold text-center mb-4">{quiz.topic}</h3>

        <form onSubmit={handleSubmit}>
          {quiz.questions.map((q, i) => {
            const correctAnswer = q.answer ? q.answer.trim() : "";
            const userAnswer = result ? result.userAnswers[i]?.trim() : "";

            return (
              <div className="quiz-card mb-4 p-4 shadow-sm" key={i}>
                <div className="fw-semibold mb-3 text-light">
                  Q{i + 1}. {q.question}
                </div>
                <div className="d-flex flex-column gap-2">
                  {!showCorrectOnly ? (
                    q.options.map((opt, idx) => {
                      const optionTrimmed = opt.trim();
                      let highlightClass = "";
                      let icon = "";
                      if (result) {
                        if (optionTrimmed === correctAnswer) {
                          highlightClass = "bg-success text-white";
                          icon = "✅";
                        } else if (optionTrimmed === userAnswer) {
                          highlightClass = "bg-danger text-white";
                          icon = "❌";
                        }
                      }
                      return (
                        <label
                          key={idx}
                          className={`option-label p-2 rounded ${highlightClass}`}
                        >
                          <input
                            type="radio"
                            className="form-check-input me-2"
                            name={`q${i}`}
                            checked={answers[i] === opt}
                            disabled={!!result}
                            onChange={() => choose(i, opt)}
                          />
                          <span>{opt}</span>
                          {icon && <span className="ms-2">{icon}</span>}
                        </label>
                      );
                    })
                  ) : (
                    <div className="correct-answer p-2 bg-success text-white rounded">
                      Correct Answer: {correctAnswer} ✅
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {!result && (
            <button
              type="submit"
              className="btn btn-gradient w-100 py-2 mb-3"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </form>

        {result && (
          <>
            <div className="alert alert-info mt-3 text-center">
              <strong>Score: {result.scorePercent}%</strong> ({result.scoreRaw}/
              {result.total})
            </div>
            <div className="d-flex justify-content-center gap-2 mt-3 flex-wrap">
              <button
                className="btn btn-outline-light"
                onClick={() => {
                  setAnswers(new Array(quiz.questions.length).fill(null));
                  setResult(null);
                  setShowCorrectOnly(false);
                }}
              >
                Retake Quiz
              </button>
              <button
                className="btn btn-outline-success"
                onClick={() => setShowCorrectOnly(true)}
              >
                Show Correct Answers
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .quiz-page-bg {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #5a77a3 100%);
        }
        .quiz-card {
            background: rgba(255, 255, 255, 0.95) !important; /* ✅ Light background */
  backdrop-filter: blur(12px);
  border-radius: 20px;
  color: #1a2a3d !important;
        }
        .quiz-card .fw-semibold {
  color: #1a2a3d !important;
}
        .option-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: 0.2s;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
        }
          .option-label {
  background: rgba(0, 0, 0, 0.05) !important;
  color: #1a2a3d !important;
}
  .option-label:hover {
  background: rgba(0, 0, 0, 0.1) !important;
}
        .option-label:hover { transform: scale(1.02); background: rgba(255,255,255,0.15); }
        .btn-gradient { background: linear-gradient(135deg, #0066ff, #00c6ff); border: none; color: white; font-weight: 600; }
        @media (max-width: 768px) { .d-flex.gap-2 { flex-direction: column; } .d-flex.gap-2 button { width: 100%; } }
      `}</style>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { useParams, useNavigate } from "react-router-dom";
import Stars from "../../../components/Stars";

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [showCorrectOnly, setShowCorrectOnly] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await api.get(`/quizzes/${id}`);
      if (!res.data || !res.data.questions) {
        throw new Error("Invalid quiz data");
      }
      setQuiz(res.data);
      setAnswers(new Array(res.data.questions.length).fill(null));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to load quiz");
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
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to submit quiz");
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
    <div className="min-vh-100 quiz-page-bg position-relative">
      <div className="container py-5 d-flex flex-column align-items-center">
        <h3 className="text-light fw-bold mb-4">{quiz.topic}</h3>

        <form className="w-100" onSubmit={handleSubmit}>
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
                          {icon && (
                            <span className="ms-2 icon animate-icon">
                              {icon}
                            </span>
                          )}
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
            <div className="d-flex justify-content-center gap-2 mt-3">
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
          background: linear-gradient(180deg,
            #080e18 0%,
            #122138 25%,
            #1e3652 50%,
            #28507e 75%,
            #5a77a3 100%);
          position: relative;
          overflow: hidden;
          min-height: 100vh;
        }

        .quiz-card {
  background: rgba(255,255,255,0.08); /* slightly brighter for readability */
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
  color: #fff; /* default text white */
}

        .quiz-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.25);
}

        .option-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.2s, background 0.2s;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(255,255,255,0.05); /* subtle background for options */
  color: #fff; /* light text */
}

        .option-label:hover {
  transform: scale(1.02);
  background: rgba(255,255,255,0.15); /* slightly brighter on hover */
}

        .option-label input[type="radio"] {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
}

.bg-success { background: #28a745 !important; color: #fff !important; }
.bg-danger { background: #dc3545 !important; color: #fff !important; }

        .icon {
          font-size: 1.3rem;
          opacity: 0;
          transform: scale(0);
          display: inline-block;
        }

        .animate-icon {
          animation: popIcon 0.5s forwards;
        }

        @keyframes popIcon {
          0% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1.5); }
          100% { opacity: 1; transform: scale(1); }
        }

        .correct-answer {
          font-weight: 600;
          font-size: 1rem;
        }

        .btn-gradient {
          background: linear-gradient(135deg, #0066ff, #00c6ff);
          color: white;
          font-weight: 600;
          border: none;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .btn-gradient:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 12px 25px rgba(0,0,0,0.3);
          background: linear-gradient(135deg, #005ce6, #00bfff);
        }

        .btn-outline-light {
          border: 1px solid #fff;
          color: #fff;
          background: transparent;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .btn-outline-light:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 8px 20px rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.1);
        }
      `}</style>
    </div>
  );
}

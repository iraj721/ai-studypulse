import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";

export default function AdminQuizDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [expandedQuiz, setExpandedQuiz] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await apiAdmin.get(`/admin/users/${id}`);
        setQuizzes(res.data.quizzes || []);
      } catch (err) {
        alert("Failed to fetch quizzes");
        navigate("/admin/dashboard");
      }
    };
    fetchQuizzes();
  }, [id, navigate]);

  const toggleExpand = (quizId) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
  };

  return (
    <div className="container mt-4">
      <button
        className="btn btn-secondary btn-sm mb-3"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h4 className="mb-3">📝 Quizzes</h4>

      {quizzes.length ? quizzes.map((q) => (
        <div
          key={q._id}
          className="card mb-3 shadow-sm hover-card"
          style={{ transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer" }}
        >
          <div
            className="card-header d-flex justify-content-between align-items-center"
            style={{ backgroundColor: "#f8f9fa", color: "#343a40", fontWeight: "600" }}
          >
            <span>{q.topic}</span>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => toggleExpand(q._id)}
            >
              {expandedQuiz === q._id ? "Hide Quiz" : "View Quiz"}
            </button>
          </div>

          {expandedQuiz === q._id && (
            <div className="card-body">
              {q.questions.map((ques, i) => (
                <div key={i} className="mb-3">
                  <strong>Q{i + 1}: {ques.question}</strong>
                  <ul className="list-group list-group-flush mt-1">
                    {ques.options.map((op, idx) => (
                      <li
                        key={idx}
                        className={`list-group-item ${
                          op === ques.answer ? "list-group-item-success fw-bold" : ""
                        }`}
                      >
                        {op}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {q.score !== undefined && (
                <p className="mt-2 fw-bold">
                  Score: {q.score} / {q.totalMarks || 100}
                </p>
              )}

              {q.createdAt && (
                <p className="text-muted small">
                  Created on: {new Date(q.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>
      )) : (
        <div className="text-center text-muted py-4">
          No quizzes found for this user.
        </div>
      )}

      <style>{`
        .hover-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        }
      `}</style>
    </div>
  );
}

// src/pages/quizzes/GenerateQuiz.jsx
import React, { useState } from "react";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";


export default function GenerateQuiz() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [num, setNum] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return alert("Please enter a topic");
    setLoading(true);
    try {
      const res = await api.post("/quizzes/generate", { topic, numQuestions: Number(num) });
      navigate(`/quizzes/${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-start generate-bg pt-5 pb-5 position-relative">

      <div className="card generate-card p-5 shadow-lg animate-card">
        <h3 className="text-center mb-4 fw-bold">Generate Quiz</h3>
        <form onSubmit={handleGenerate}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Topic</label>
            <input
              type="text"
              className="form-control form-input"
              placeholder="Enter quiz topic"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Number of Questions</label>
            <input
              type="number"
              className="form-control form-input"
              min={1}
              max={50}
              value={num}
              onChange={e => setNum(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 btn-generate"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Quiz"}
          </button>
        </form>
      </div>

      <style>{`
        .generate-bg {
          background: linear-gradient(180deg,
            #080e18ff 0%,
            #122138ff 25%,
            #1e3652ff 50%,
            #28507eff 75%,
            #5a77a3ff 100%);
          position: relative;
          overflow: hidden;
        }

        .generate-card {
          width: 100%;
          max-width: 500px;
          border-radius: 16px;
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
          box-shadow: 0 20px 40px rgba(0,0,0,0.25);
          transition: transform 0.4s, box-shadow 0.4s;
        }

        .generate-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 25px 50px rgba(0,0,0,0.3);
        }

        .form-input {
          border-radius: 10px;
          padding: 12px 14px;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .form-input:focus {
          border-color: #007bff;
          box-shadow: 0 0 12px rgba(0,123,255,0.4);
          outline: none;
        }

        .btn-generate {
          background: linear-gradient(135deg, #0066ff, #00c6ff);
          border: none;
          font-weight: 600;
          transition: transform 0.3s, box-shadow 0.3s, background 0.3s;
        }

        .btn-generate:hover:not(:disabled) {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 15px 35px rgba(0,0,0,0.25);
          background: linear-gradient(135deg, #005ce6, #00bfff);
        }

        .animate-card {
          animation: fadeInUp 0.8s ease forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

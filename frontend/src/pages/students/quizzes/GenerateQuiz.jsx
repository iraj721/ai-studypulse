import React, { useState } from "react";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";
import Toast from "../../../components/Toast";
import { 
  FaArrowLeft, FaFileUpload, FaSpinner, FaMagic,
  FaQuestionCircle, FaSlidersH, FaFileAlt
} from "react-icons/fa";

export default function GenerateQuiz() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [num, setNum] = useState(5);
  const [difficulty, setDifficulty] = useState("mixed");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = [
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain', 
        'image/jpeg', 
        'image/png', 
        'image/jpg'
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        setToast({ 
          message: "Invalid file type. Allowed: PDF, DOCX, PPTX, TXT, JPG, PNG", 
          type: "error" 
        });
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setToast({ message: "File too large. Max 10MB", type: "error" });
        return;
      }
      setFile(selectedFile);
      setFilePreview(selectedFile.name);
      setTopic(""); // Clear topic when file is selected
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!topic.trim() && !file) {
      setToast({ message: "Please enter a topic OR upload a file", type: "error" });
      return;
    }
    
    setLoading(true);
    try {
      let response;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("numQuestions", num);
        formData.append("difficulty", difficulty);
        response = await api.post("/quizzes/generate", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/quizzes/generate", {
          topic: topic.trim(),
          numQuestions: Number(num),
          difficulty: difficulty,
        });
      }
      
      setToast({ message: "Quiz generated successfully!", type: "success" });
      setTimeout(() => navigate(`/quizzes/${response.data._id}`), 1000);
    } catch (err) {
      setToast({ 
        message: err.response?.data?.message || "Failed to generate quiz", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyLabel = (value) => {
    switch(value) {
      case "easy": return "Easy";
      case "mixed": return "Mixed (Easy/Medium/Hard)";
      case "hard": return "Hard";
      default: return "Mixed";
    }
  };

  return (
    <div className="gen-root">
      {/* Background */}
      <div className="gen-bg" />
      <div className="gen-grid" />
      <div className="gen-orb gen-orb-a" />
      <div className="gen-orb gen-orb-b" />

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      {/* Main Content */}
      <main className="gen-main">
        <div className="gen-container">
          {/* Back Button */}
          <button className="gen-back" onClick={() => navigate("/quizzes")}>
            <FaArrowLeft /> Back to Quizzes
          </button>

          {/* Card */}
          <div className="gen-card">
            <div className="gen-card-glow" />
            
            {/* Header */}
            <div className="gen-header">
              <div className="gen-icon">
                <FaMagic />
              </div>
              <h1 className="gen-title">Generate <span className="gen-grad">Quiz</span></h1>
              <p className="gen-subtitle">Upload a file OR enter a topic → AI creates MCQs</p>
            </div>

            <form onSubmit={handleGenerate} className="gen-form">
              {/* Topic Input */}
              <div className="form-group">
                <label className="form-label">
                  <FaQuestionCircle /> Enter Topic
                </label>
                <input
                  type="text"
                  className={`form-input ${file ? "disabled" : ""}`}
                  placeholder="e.g., Artificial Intelligence, Calculus, World War II..."
                  value={topic}
                  onChange={(e) => { 
                    setTopic(e.target.value); 
                    if (e.target.value) {
                      setFile(null); 
                      setFilePreview(null);
                    }
                  }}
                  disabled={!!file}
                />
              </div>

              {/* OR Divider */}
              <div className="form-divider">
                <span>OR</span>
              </div>

              {/* File Upload */}
              <div className="form-group">
                <label className="form-label">
                  <FaFileAlt /> Upload File
                </label>
                <div 
                  className={`file-upload-area ${topic ? "disabled" : ""}`}
                  onClick={() => !topic && document.getElementById("fileInput").click()}
                  style={{ opacity: topic ? 0.5 : 1, cursor: topic ? "not-allowed" : "pointer" }}
                >
                  <input
                    type="file"
                    id="fileInput"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.pptx,.txt,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    disabled={!!topic}
                  />
                  <FaFileUpload className="upload-icon" />
                  <p className="upload-text">{filePreview ? filePreview : "Click to upload file"}</p>
                  <small className="upload-hint">AI will read your file and create questions ONLY from it</small>
                </div>
              </div>

              {/* Settings Row */}
              <div className="settings-row">
                <div className="form-group half">
                  <label className="form-label">
                    <FaQuestionCircle /> Number of Questions
                  </label>
                  <input
                    type="number"
                    className="form-input"
                    min={1}
                    max={30}
                    value={num}
                    onChange={(e) => setNum(Math.min(30, Math.max(1, parseInt(e.target.value) || 1)))}
                    required
                  />
                  <small className="input-hint">Max 30 questions</small>
                </div>
                <div className="form-group half">
                  <label className="form-label">
                    <FaSlidersH /> Difficulty Level
                  </label>
                  <select
                    className="form-select"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="easy">🟢 Easy</option>
                    <option value="mixed">🟡 Mixed (Easy/Medium/Hard)</option>
                    <option value="hard">🔴 Hard</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="gen-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner" /> Generating Quiz...
                  </>
                ) : (
                  <>
                    <FaMagic /> Generate Quiz
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .gen-root {
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

        .gen-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }

        .gen-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background */
        .gen-bg {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.08) 0%, transparent 60%);
        }
        .gen-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image: linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .gen-orb {
          position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .gen-orb-a { width: 400px; height: 400px; top: -100px; left: 50%; transform: translateX(-50%); background: rgba(88, 130, 255, 0.06); animation: orbFloat 12s infinite; }
        .gen-orb-b { width: 250px; height: 250px; bottom: 10%; right: -5%; background: rgba(32, 230, 208, 0.04); animation: orbFloat2 10s infinite; }
        @keyframes orbFloat { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.1); } }
        @keyframes orbFloat2 { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }

        /* Main Content */
        .gen-main {
          position: relative;
          z-index: 10;
          max-width: 700px;
          margin: 0 auto;
          padding: 90px 2rem 3rem;
          min-height: 100vh;
        }

        /* Back Button */
        .gen-back {
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
        .gen-back:hover {
          background: rgba(88, 130, 255, 0.2);
          transform: translateX(-4px);
        }

        /* Card */
        .gen-card {
          background: rgba(17, 19, 24, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 28px;
          padding: 2rem;
          position: relative;
          transition: all 0.3s;
        }
        .gen-card:hover {
          border-color: var(--border-h);
          transform: translateY(-4px);
        }
        .gen-card-glow {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 180px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(88, 130, 255, 0.1), transparent);
          filter: blur(60px);
          pointer-events: none;
        }

        /* Header */
        .gen-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .gen-icon {
          width: 70px;
          height: 70px;
          background: rgba(88, 130, 255, 0.1);
          border: 1px solid rgba(88, 130, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          margin: 0 auto 1rem;
          color: var(--accent);
        }
        .gen-title {
          font-family: var(--fd);
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .gen-subtitle {
          color: var(--muted);
          font-size: 0.85rem;
        }

        /* Form */
        .gen-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .form-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .form-input:focus {
          outline: none;
          border-color: var(--accent);
          background: rgba(88, 130, 255, 0.05);
        }
        .form-input.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .form-input::placeholder {
          color: var(--faint);
        }
        .form-select {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .form-select:focus {
          outline: none;
          border-color: var(--accent);
        }
        .input-hint {
          font-size: 0.7rem;
          color: var(--faint);
        }

        /* Settings Row */
        .settings-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .half {
          flex: 1;
        }

        /* Divider */
        .form-divider {
          position: relative;
          text-align: center;
          margin: 0.5rem 0;
        }
        .form-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border), transparent);
        }
        .form-divider span {
          position: relative;
          background: rgba(17, 19, 24, 0.7);
          padding: 0 1rem;
          font-size: 0.8rem;
          color: var(--faint);
        }

        /* File Upload */
        .file-upload-area {
          border: 2px dashed var(--border);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          background: rgba(88, 130, 255, 0.02);
        }
        .file-upload-area:hover:not(.disabled) {
          border-color: var(--accent);
          background: rgba(88, 130, 255, 0.05);
        }
        .file-upload-area.disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        .upload-icon {
          font-size: 2.5rem;
          color: var(--accent);
          margin-bottom: 0.5rem;
        }
        .upload-text {
          font-size: 0.85rem;
          color: var(--muted);
          margin-bottom: 0.25rem;
        }
        .upload-hint {
          font-size: 0.7rem;
          color: var(--faint);
        }

        /* Submit Button */
        .gen-submit {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
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
          box-shadow: 0 4px 20px rgba(88, 130, 255, 0.35);
          margin-top: 0.5rem;
        }
        .gen-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(88, 130, 255, 0.5);
        }
        .gen-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .spinner {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .gen-main { padding: 80px 1rem 2rem; }
          .settings-row { grid-template-columns: 1fr; }
          .gen-card { padding: 1.5rem; }
          .gen-title { font-size: 1.5rem; }
          .gen-icon { width: 55px; height: 55px; font-size: 1.5rem; }
          .gen-back { width: 100%; justify-content: center; }
          .file-upload-area { padding: 1.5rem; }
          .form-select, .form-input { font-size: 0.85rem; }
        }
      `}</style>
    </div>
  );
}
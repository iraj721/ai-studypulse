import React, { useState } from "react";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";
import Stars from "../../../components/Stars";
import BackButton from "../../../components/BackButton";
import Toast from "../../../components/Toast";
import { FaFileUpload, FaSpinner } from "react-icons/fa";

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
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'text/plain', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setToast({ message: "Invalid file type. Allowed: PDF, DOCX, PPTX, TXT, JPG, PNG", type: "error" });
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
      setToast({ message: err.response?.data?.message || "Failed to generate quiz", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-start generate-bg pt-5 pb-5 position-relative">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container" style={{ maxWidth: "600px" }}>
        <BackButton to="/quizzes" label="← Back to Quizzes" />

        <div className="card generate-card p-5 shadow-lg animate-card">
          <h3 className="text-center mb-4 fw-bold">✨ Generate Quiz</h3>
          <p className="text-center text-muted mb-4">Upload a file OR enter a topic → AI creates MCQs</p>

          <form onSubmit={handleGenerate}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Enter Topic</label>
              <input type="text" className="form-control form-input" placeholder="e.g., Artificial Intelligence" value={topic} onChange={(e) => { setTopic(e.target.value); if (e.target.value) setFile(null); setFilePreview(null); }} disabled={!!file} />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">OR Upload File (PDF, DOCX, PPTX, TXT, Image)</label>
              <div className="file-upload-area" onClick={() => document.getElementById("fileInput").click()} style={{ opacity: topic ? 0.5 : 1, cursor: topic ? "not-allowed" : "pointer" }}>
                <input type="file" id="fileInput" onChange={handleFileChange} accept=".pdf,.docx,.pptx,.txt,.jpg,.jpeg,.png" style={{ display: "none" }} disabled={!!topic} />
                <FaFileUpload className="upload-icon" />
                <p>{filePreview ? filePreview : "Click to upload file"}</p>
                <small>AI will read your file and create questions ONLY from it</small>
              </div>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Number of Questions (max 30)</label>
                <input type="number" className="form-control form-input" min={1} max={30} value={num} onChange={(e) => setNum(e.target.value)} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Difficulty Level</label>
                <select className="form-control form-input" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="easy">🟢 Easy</option>
                  <option value="mixed">🟡 Mixed (Easy/Medium/Hard)</option>
                  <option value="hard">🔴 Hard</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 btn-generate mt-4" disabled={loading}>
              {loading ? <><FaSpinner className="spinner" /> Generating Quiz...</> : "🎯 Generate Quiz"}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .generate-bg { background: linear-gradient(180deg, #080e18ff 0%, #122138ff 25%, #1e3652ff 50%, #28507eff 75%, #5a77a3ff 100%); }
        .generate-card { border-radius: 20px; background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff); transition: transform 0.4s, box-shadow 0.4s; }
        .generate-card:hover { transform: translateY(-6px); box-shadow: 0 25px 50px rgba(0,0,0,0.25); }
        .form-input { border-radius: 12px; padding: 12px 14px; transition: all 0.3s; border: 1px solid #ddd; }
        .form-input:focus { border-color: #007bff; box-shadow: 0 0 12px rgba(0,123,255,0.4); outline: none; }
        .file-upload-area { border: 2px dashed #6366f1; border-radius: 16px; padding: 30px; text-align: center; transition: all 0.3s; background: rgba(99,102,241,0.05); cursor: pointer; }
        .file-upload-area:hover { background: rgba(99,102,241,0.1); border-color: #4f46e5; }
        .upload-icon { font-size: 40px; color: #6366f1; margin-bottom: 10px; }
        .btn-generate { background: linear-gradient(135deg, #0066ff, #00c6ff); border: none; font-weight: 600; padding: 12px; border-radius: 12px; transition: all 0.3s; }
        .btn-generate:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,102,255,0.35); }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .generate-card { margin: 0 16px; padding: 24px 20px !important; } .row.g-3 { flex-direction: column; } }
      `}</style>
    </div>
  );
}
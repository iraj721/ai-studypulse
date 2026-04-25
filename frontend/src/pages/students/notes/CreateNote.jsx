import React, { useState } from "react";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";
import Toast from "../../../components/Toast";
import { 
  FaArrowLeft, FaFileUpload, FaSpinner, FaMagic,
  FaBookOpen, FaListUl, FaAlignLeft
} from "react-icons/fa";

export default function CreateNote() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: "",
    topic: "",
    instructions: "",
    noteType: "detailed",
    content: "",
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.subject || !form.topic) {
      setToast({ message: "Subject and topic are required!", type: "error" });
      return;
    }
    
    if (!file && !form.content) {
      setToast({ message: "Please provide either a file or text content!", type: "error" });
      return;
    }
    
    setGenerating(true);
    try {
      let response;
      
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("subject", form.subject);
        formData.append("topic", form.topic);
        formData.append("instructions", form.instructions);
        formData.append("noteType", form.noteType);
        response = await api.post("/notes", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/notes", {
          subject: form.subject,
          topic: form.topic,
          instructions: form.instructions,
          noteType: form.noteType,
          content: form.content,
        });
      }
      
      setToast({ message: "Note created successfully! 🎉", type: "success" });
      
      // Ask user if they want to bookmark the note
      setTimeout(async () => {
        const shouldBookmark = window.confirm(
          "Note created successfully! Do you want to bookmark it?"
        );
        if (shouldBookmark && response.data?._id) {
          try {
            await api.post("/student/bookmarks", {
              type: "note",
              itemId: response.data._id,
              collectionName: "Notes",
              title: `${response.data.subject} - ${response.data.topic}`,
              subtitle: response.data.subject
            });
            setToast({ message: "Note bookmarked successfully!", type: "success" });
          } catch (bookmarkErr) {
            console.error("Bookmark error:", bookmarkErr);
          }
        }
        navigate("/notes");
      }, 1000);
      
    } catch (err) {
      setToast({ 
        message: err.response?.data?.message || "Failed to create note", 
        type: "error" 
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="create-note-root">
      {/* Background */}
      <div className="create-note-bg" />
      <div className="create-note-grid" />
      <div className="create-note-orb create-note-orb-a" />
      <div className="create-note-orb create-note-orb-b" />

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      {/* Main Content */}
      <main className="create-note-main">
        <div className="create-note-container">
          {/* Back Button */}
          <button className="create-note-back" onClick={() => navigate("/notes")}>
            <FaArrowLeft /> Back to Notes
          </button>

          {/* Card */}
          <div className="create-note-card">
            <div className="create-note-card-glow" />
            
            {/* Header */}
            <div className="create-note-header">
              <div className="create-note-icon">
                <FaMagic />
              </div>
              <h1 className="create-note-title">Create <span className="create-note-grad">AI Note</span></h1>
              <p className="create-note-subtitle">Upload a file or write text → AI generates structured notes</p>
            </div>

            <form onSubmit={handleSubmit} className="create-note-form">
              {/* Subject & Topic Row */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Subject <span className="required">*</span></label>
                  <input
                    name="subject"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Computer Science"
                    value={form.subject}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Topic <span className="required">*</span></label>
                  <input
                    name="topic"
                    type="text"
                    className="form-input"
                    placeholder="e.g., Neural Networks"
                    value={form.topic}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>

              {/* Note Type */}
              <div className="form-group">
                <label className="form-label">Note Type</label>
                <div className="note-type-group">
                  <label className={`note-type-btn ${form.noteType === "detailed" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="noteType"
                      value="detailed"
                      checked={form.noteType === "detailed"}
                      onChange={onChange}
                    />
                    <FaBookOpen /> Detailed Notes
                  </label>
                  <label className={`note-type-btn ${form.noteType === "summary" ? "active" : ""}`}>
                    <input
                      type="radio"
                      name="noteType"
                      value="summary"
                      checked={form.noteType === "summary"}
                      onChange={onChange}
                    />
                    <FaListUl /> Quick Summary
                  </label>
                </div>
              </div>

              {/* File Upload */}
              <div className="form-group">
                <label className="form-label">Upload File (Optional)</label>
                <div className="file-upload-area" onClick={() => document.getElementById("fileInput").click()}>
                  <input
                    type="file"
                    id="fileInput"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.doc,.pptx,.txt,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                  />
                  <FaFileUpload className="upload-icon" />
                  <p className="upload-text">{filePreview ? filePreview : "Click or drag file here"}</p>
                  <small className="upload-hint">Max 10MB | AI will extract text from your file</small>
                </div>
              </div>

              {/* OR Divider */}
              <div className="form-divider">
                <span>OR</span>
              </div>

              {/* Text Content */}
              <div className="form-group">
                <label className="form-label">Write Text Content</label>
                <textarea
                  name="content"
                  className="form-textarea"
                  rows="5"
                  placeholder="Paste your study material here..."
                  value={form.content}
                  onChange={onChange}
                />
              </div>

              {/* Instructions */}
              <div className="form-group">
                <label className="form-label">Additional Instructions (Optional)</label>
                <div className="instructions-input">
                  <FaAlignLeft className="instructions-icon" />
                  <textarea
                    name="instructions"
                    className="form-textarea instructions"
                    rows="2"
                    placeholder="Focus on examples, include diagrams explanation, etc."
                    value={form.instructions}
                    onChange={onChange}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="create-note-submit"
                disabled={generating}
              >
                {generating ? (
                  <>
                    <FaSpinner className="spinner" /> Generating Notes...
                  </>
                ) : (
                  <>
                    <FaMagic /> Generate Notes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .create-note-root {
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

        .create-note-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }

        .create-note-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background */
        .create-note-bg {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.08) 0%, transparent 60%);
        }
        .create-note-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image: linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .create-note-orb {
          position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .create-note-orb-a { width: 400px; height: 400px; top: -100px; left: 50%; transform: translateX(-50%); background: rgba(88, 130, 255, 0.06); animation: orbFloat 12s infinite; }
        .create-note-orb-b { width: 250px; height: 250px; bottom: 10%; right: -5%; background: rgba(32, 230, 208, 0.04); animation: orbFloat2 10s infinite; }
        @keyframes orbFloat { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.1); } }
        @keyframes orbFloat2 { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }

        /* Main Content */
        .create-note-main {
          position: relative;
          z-index: 10;
          max-width: 700px;
          margin: 0 auto;
          padding: 90px 2rem 3rem;
          min-height: 100vh;
        }

        /* Back Button */
        .create-note-back {
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
        .create-note-back:hover {
          background: rgba(88, 130, 255, 0.2);
          transform: translateX(-4px);
        }

        /* Card */
        .create-note-card {
          background: rgba(17, 19, 24, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 28px;
          padding: 2rem;
          position: relative;
          transition: all 0.3s;
        }
        .create-note-card:hover {
          border-color: var(--border-h);
          transform: translateY(-4px);
        }
        .create-note-card-glow {
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
        .create-note-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .create-note-icon {
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
        .create-note-title {
          font-family: var(--fd);
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .create-note-subtitle {
          color: var(--muted);
          font-size: 0.85rem;
        }

        /* Form */
        .create-note-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
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
        }
        .required {
          color: #ef4444;
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
        .form-input::placeholder {
          color: var(--faint);
        }
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-size: 0.9rem;
          resize: vertical;
          font-family: inherit;
          transition: all 0.2s;
        }
        .form-textarea:focus {
          outline: none;
          border-color: var(--accent);
          background: rgba(88, 130, 255, 0.05);
        }
        .form-textarea::placeholder {
          color: var(--faint);
        }

        /* Note Type */
        .note-type-group {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .note-type-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 40px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.85rem;
        }
        .note-type-btn input {
          display: none;
        }
        .note-type-btn.active {
          background: rgba(88, 130, 255, 0.15);
          border-color: var(--accent);
          color: var(--accent);
        }
        .note-type-btn:hover {
          background: rgba(88, 130, 255, 0.1);
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
        .file-upload-area:hover {
          border-color: var(--accent);
          background: rgba(88, 130, 255, 0.05);
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

        /* Instructions */
        .instructions-input {
          position: relative;
        }
        .instructions-icon {
          position: absolute;
          left: 12px;
          top: 14px;
          color: var(--faint);
        }
        .instructions-input .form-textarea {
          padding-left: 40px;
        }

        /* Submit Button */
        .create-note-submit {
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
        .create-note-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(88, 130, 255, 0.5);
        }
        .create-note-submit:disabled {
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
          .create-note-main { padding: 80px 1rem 2rem; }
          .form-row { grid-template-columns: 1fr; }
          .create-note-card { padding: 1.5rem; }
          .create-note-title { font-size: 1.5rem; }
          .create-note-icon { width: 55px; height: 55px; font-size: 1.5rem; }
          .create-note-back { width: 100%; justify-content: center; }
          .note-type-group { width: 100%; }
          .note-type-btn { flex: 1; justify-content: center; }
          .file-upload-area { padding: 1.5rem; }
        }
      `}</style>
    </div>
  );
}
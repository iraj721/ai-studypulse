import React, { useState } from "react";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";
import Stars from "../../../components/Stars";
import BackButton from "../../../components/BackButton";
import Toast from "../../../components/Toast";
import { FaFileUpload, FaSpinner } from "react-icons/fa";

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
    
    try {
      setGenerating(true);
      
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
      
      // ✅ Ask user if they want to bookmark the note
      setTimeout(async () => {
        const shouldBookmark = window.confirm("Note created successfully! Do you want to bookmark it?");
        if (shouldBookmark && response.data?._id) {
          try {
            await api.post("/student/bookmarks", {
              type: "note",
              itemId: response.data._id,
              collectionName: "Notes"
            });
            setToast({ message: "Note bookmarked successfully!", type: "success" });
          } catch (bookmarkErr) {
            console.error("Bookmark error:", bookmarkErr);
          }
        }
        navigate("/notes");
      }, 1000);
      
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to create note", type: "error" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="create-note-bg min-vh-100 d-flex align-items-center justify-content-center py-5 position-relative">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container" style={{ maxWidth: "700px" }}>
        <BackButton to="/notes" label="← Back to Notes" />

        <div className="card shadow-lg p-4 mx-auto create-note-card">
          <h3 className="text-center mb-2 fw-bold">📝 Create AI Note</h3>
          <p className="text-center text-muted mb-4">Upload a file or write text → AI generates notes</p>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Subject *</label>
                <input name="subject" className="form-control input-field" placeholder="e.g., Computer Science" value={form.subject} onChange={onChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Topic *</label>
                <input name="topic" className="form-control input-field" placeholder="e.g., Neural Networks" value={form.topic} onChange={onChange} required />
              </div>
            </div>

            <div className="mt-3">
              <label className="form-label fw-semibold">Note Type</label>
              <div className="d-flex gap-3">
                <label className="radio-label">
                  <input type="radio" name="noteType" value="detailed" checked={form.noteType === "detailed"} onChange={onChange} />
                  <span>📚 Detailed Notes</span>
                </label>
                <label className="radio-label">
                  <input type="radio" name="noteType" value="summary" checked={form.noteType === "summary"} onChange={onChange} />
                  <span>📋 Quick Summary</span>
                </label>
              </div>
            </div>

            <div className="mt-3">
              <label className="form-label fw-semibold">Upload File (PDF, DOCX, PPTX, TXT, Image)</label>
              <div className="file-upload-area" onClick={() => document.getElementById("fileInput").click()}>
                <input type="file" id="fileInput" onChange={handleFileChange} accept=".pdf,.docx,.pptx,.txt,.jpg,.jpeg,.png" style={{ display: "none" }} />
                <FaFileUpload className="upload-icon" />
                <p>{filePreview ? filePreview : "Click or drag file here"}</p>
                <small>Max 10MB | AI will extract text from your file</small>
              </div>
            </div>

            <div className="mt-3">
              <label className="form-label fw-semibold">OR Write Text Content</label>
              <textarea name="content" className="form-control input-field" rows="4" placeholder="Paste your study material here..." value={form.content} onChange={onChange} />
            </div>

            <div className="mt-3">
              <label className="form-label fw-semibold">Additional Instructions (Optional)</label>
              <textarea name="instructions" className="form-control input-field" rows="2" placeholder="Focus on examples, include diagrams explanation, etc." value={form.instructions} onChange={onChange} />
            </div>

            <button className="btn btn-gradient w-100 mt-4" type="submit" disabled={generating}>
              {generating ? <><FaSpinner className="spinner" /> Generating Notes...</> : "✨ Generate Notes"}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .create-note-bg { background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #5a77a3 100%); }
        .create-note-card { border-radius: 20px; background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff); transition: transform 0.3s, box-shadow 0.3s; }
        .create-note-card:hover { transform: translateY(-6px); box-shadow: 0 25px 50px rgba(0,0,0,0.25); }
        .input-field { border-radius: 12px; padding: 12px 14px; border: 1px solid #ddd; transition: all 0.3s; }
        .input-field:focus { border-color: #6366f1; box-shadow: 0 0 12px rgba(99,102,241,0.3); outline: none; }
        .radio-label { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 8px 16px; background: #f0f0f0; border-radius: 30px; transition: all 0.3s; }
        .radio-label input { margin: 0; cursor: pointer; }
        .radio-label:hover { background: #e0e0e0; }
        .file-upload-area { border: 2px dashed #6366f1; border-radius: 16px; padding: 30px; text-align: center; cursor: pointer; transition: all 0.3s; background: rgba(99,102,241,0.05); }
        .file-upload-area:hover { background: rgba(99,102,241,0.1); border-color: #4f46e5; }
        .upload-icon { font-size: 40px; color: #6366f1; margin-bottom: 10px; }
        .btn-gradient { background: linear-gradient(135deg, #4f46e5, #6366f1); border: none; color: white; font-weight: 600; padding: 12px; border-radius: 12px; transition: all 0.3s; }
        .btn-gradient:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(79,70,229,0.35); }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .row.g-3 { flex-direction: column; } .radio-label { flex: 1; justify-content: center; } }
      `}</style>
    </div>
  );
}
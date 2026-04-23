import React, { useState } from "react";
import api from "../services/api";
import { FaYoutube, FaSpinner, FaDownload, FaTrash } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import Toast from "./Toast";

export default function VideoSummarizer() {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [showSaved, setShowSaved] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const handleSummarize = async () => {
    if (!videoUrl.trim()) {
      setToast({ message: "Please enter a YouTube URL", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/student/video/summarize", { videoUrl });
      setSummary(res.data.summary);
      setToast({ message: res.data.isCached ? "Loaded from cache!" : "Summary generated!", type: "success" });
      fetchSavedSummaries();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to summarize", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedSummaries = async () => {
    try {
      const res = await api.get("/student/video/summaries");
      setSavedSummaries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSummary = async (id) => {
    try {
      await api.delete(`/student/video/summaries/${id}`);
      fetchSavedSummaries();
      setToast({ message: "Deleted successfully", type: "success" });
    } catch (err) {
      setToast({ message: "Failed to delete", type: "error" });
    }
  };

  const downloadSummary = () => {
    const element = document.createElement('a');
    const file = new Blob([summary.summary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${summary.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="video-summarizer-container">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="video-header">
        <h3><FaYoutube /> YouTube Video Summarizer</h3>
        <button onClick={() => { setShowSaved(!showSaved); fetchSavedSummaries(); }} className="btn-saved">
          📚 Saved Summaries ({savedSummaries.length})
        </button>
      </div>

      <div className="video-input">
        <input type="text" placeholder="Paste YouTube URL here..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
        <button onClick={handleSummarize} disabled={loading}>
          {loading ? <FaSpinner className="spinner" /> : "Summarize"}
        </button>
      </div>

      {showSaved && savedSummaries.length > 0 && (
        <div className="saved-summaries">
          <h4>📖 Your Saved Summaries</h4>
          {savedSummaries.map((s) => (
            <div key={s._id} className="saved-summary-item" onClick={() => setSummary(s)}>
              <div className="saved-title">{s.title}</div>
              <div className="saved-meta">{s.author} • {new Date(s.savedAt).toLocaleDateString()}</div>
              <button onClick={(e) => { e.stopPropagation(); deleteSummary(s._id); }} className="delete-btn"><FaTrash /></button>
            </div>
          ))}
        </div>
      )}

      {summary && (
        <div className="summary-result">
          <div className="summary-header">
            <h4>{summary.title}</h4>
            <div className="summary-actions">
              <button onClick={downloadSummary}><FaDownload /> Download</button>
            </div>
          </div>
          <div className="summary-content">
            <ReactMarkdown>{summary.summary}</ReactMarkdown>
          </div>
        </div>
      )}

      <style>{`
        .video-summarizer-container { padding: 20px; background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff); border-radius: 20px; margin-top: 20px; }
        .video-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
        .video-input { display: flex; gap: 12px; margin-bottom: 20px; }
        .video-input input { flex: 1; padding: 12px; border: 1px solid #ddd; border-radius: 12px; font-size: 14px; }
        .video-input button { padding: 12px 24px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; }
        .btn-saved { background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 10px; cursor: pointer; }
        .saved-summaries { margin-bottom: 20px; max-height: 200px; overflow-y: auto; }
        .saved-summary-item { background: white; padding: 12px; border-radius: 12px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s; }
        .saved-summary-item:hover { transform: translateX(4px); background: #f0f0f0; }
        .saved-title { font-weight: 600; font-size: 14px; }
        .saved-meta { font-size: 11px; color: #6b7280; }
        .delete-btn { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 14px; }
        .summary-result { background: white; border-radius: 16px; padding: 20px; margin-top: 20px; max-height: 500px; overflow-y: auto; }
        .summary-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 10px; }
        .summary-actions button { background: #22c55e; color: white; border: none; padding: 6px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; }
        .summary-content { line-height: 1.6; font-size: 14px; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .video-input { flex-direction: column; } .video-header { flex-direction: column; text-align: center; } }
      `}</style>
    </div>
  );
}
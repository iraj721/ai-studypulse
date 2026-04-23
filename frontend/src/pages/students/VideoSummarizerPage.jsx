import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import Stars from "../../components/Stars";
import BackButton from "../../components/BackButton";
import Toast from "../../components/Toast";
import { FaYoutube, FaSpinner, FaDownload, FaTrash, FaHistory } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

export default function VideoSummarizerPage() {
  const navigate = useNavigate();
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchSavedSummaries();
  }, []);

  const fetchSavedSummaries = async () => {
    try {
      const res = await api.get("/student/video/summaries");
      setSavedSummaries(res.data);
    } catch (err) {
      console.error(err);
    }
  };

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

  const deleteSummary = async (id) => {
    try {
      await api.delete(`/student/video/summaries/${id}`);
      fetchSavedSummaries();
      setToast({ message: "Deleted successfully", type: "success" });
    } catch (err) {
      setToast({ message: "Failed to delete", type: "error" });
    }
  };

  const loadSummary = (s) => {
    setSummary(s);
    setShowHistory(false);
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
    <div className="video-page min-vh-100 py-5 position-relative">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container">
        <BackButton to="/dashboard" label="← Back to Dashboard" />

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h2 className="text-white fw-bold">🎥 YouTube Video Summarizer</h2>
          <button onClick={() => setShowHistory(!showHistory)} className="btn-history">
            <FaHistory /> {showHistory ? "Hide History" : `History (${savedSummaries.length})`}
          </button>
        </div>

        {/* Input Section */}
        <div className="card input-card p-4 mb-4">
          <div className="row g-3">
            <div className="col-md-9">
              <input 
                type="text" 
                className="form-control form-input" 
                placeholder="Paste YouTube URL here..." 
                value={videoUrl} 
                onChange={(e) => setVideoUrl(e.target.value)} 
              />
            </div>
            <div className="col-md-3">
              <button className="btn-summarize w-100" onClick={handleSummarize} disabled={loading}>
                {loading ? <><FaSpinner className="spinner" /> Processing...</> : <><FaYoutube /> Summarize</>}
              </button>
            </div>
          </div>
        </div>

        {/* History Section */}
        {showHistory && savedSummaries.length > 0 && (
          <div className="history-card mb-4 p-4">
            <h5>📚 Your Saved Summaries</h5>
            <div className="history-list">
              {savedSummaries.map((s) => (
                <div key={s._id} className="history-item" onClick={() => loadSummary(s)}>
                  <div className="history-info">
                    <div className="history-title">{s.title}</div>
                    <div className="history-meta">{s.author} • {new Date(s.savedAt).toLocaleDateString()}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteSummary(s._id); }} className="delete-history">
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Result */}
        {summary && (
          <div className="summary-card p-4">
            <div className="summary-header">
              <h4>{summary.title}</h4>
              <button onClick={downloadSummary} className="btn-download">
                <FaDownload /> Download
              </button>
            </div>
            <div className="summary-content">
              <ReactMarkdown>{summary.summary}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .video-page {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%);
        }
        .btn-history {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 8px 20px;
          border-radius: 30px;
          cursor: pointer;
        }
        .input-card {
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
          border-radius: 20px;
        }
        .form-input {
          border-radius: 12px;
          padding: 12px;
          border: 1px solid #ddd;
        }
        .btn-summarize {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          padding: 12px;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .history-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          color: white;
        }
        .history-list { max-height: 300px; overflow-y: auto; }
        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .history-item:hover { background: rgba(255,255,255,0.2); transform: translateX(5px); }
        .history-title { font-weight: 600; }
        .history-meta { font-size: 11px; opacity: 0.7; margin-top: 4px; }
        .delete-history { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 14px; }
        .summary-card {
          background: white;
          border-radius: 20px;
          max-height: 500px;
          overflow-y: auto;
        }
        .summary-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
        .btn-download { background: #22c55e; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
        .summary-content { line-height: 1.6; }
        .spinner { animation: spin 1s linear infinite; margin-right: 8px; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) { .row.g-3 { flex-direction: column; } }
      `}</style>
    </div>
  );
}
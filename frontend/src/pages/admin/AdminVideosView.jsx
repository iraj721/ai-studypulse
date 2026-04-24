import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";
import Stars from "../../components/Stars";
import BackButton from "../../components/BackButton";
import ReactMarkdown from "react-markdown";

export default function AdminVideosView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await apiAdmin.get(`/admin/students/${id}/videos`);
      setVideos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100 py-4">
        <div className="container text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Loading video summaries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        <BackButton to={`/admin/users/${id}`} label="← Back to User Details" />
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">🎥 Student Video Summaries</h3>
          <span className="badge bg-primary fs-6">{videos.length} Videos</span>
        </div>

        {videos.length === 0 ? (
          <div className="alert alert-info text-center py-5">
            <div className="fs-1 mb-3">🎥</div>
            <h5>No Video Summaries Found</h5>
            <p>This student hasn't summarized any videos yet.</p>
          </div>
        ) : (
          <div className="row g-4">
            {videos.map((video) => (
              <div key={video._id} className="col-md-6">
                <div className="video-admin-card" onClick={() => { setSelectedVideo(video); setShowModal(true); }}>
                  <div className="video-thumbnail-placeholder">
                    <span>🎬</span>
                  </div>
                  <div className="video-info">
                    <h5 className="video-title">{video.title}</h5>
                    <p className="video-author">By {video.author || "YouTube"}</p>
                    <div className="video-preview">
                      {video.summary?.substring(0, 120)}...
                    </div>
                    <div className="video-date">
                      {new Date(video.savedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Summary Modal */}
      {showModal && selectedVideo && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content video-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{selectedVideo.title}</h4>
              <button onClick={() => setShowModal(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body video-summary-body">
              <p className="video-meta">📺 {selectedVideo.author} • 📅 {new Date(selectedVideo.savedAt).toLocaleDateString()}</p>
              <div className="summary-content">
                <ReactMarkdown>{selectedVideo.summary}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .video-admin-card {
          background: white;
          border-radius: 16px;
          display: flex;
          gap: 16px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .video-admin-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(0,0,0,0.15);
        }
        .video-thumbnail-placeholder {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          flex-shrink: 0;
        }
        .video-info {
          flex: 1;
        }
        .video-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 4px;
          color: #1e293b;
        }
        .video-author {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 8px;
        }
        .video-preview {
          font-size: 12px;
          color: #475569;
          line-height: 1.4;
          margin-bottom: 8px;
        }
        .video-date {
          font-size: 10px;
          color: #94a3b8;
        }
        .video-modal {
          max-width: 700px;
        }
        .video-meta {
          color: #64748b;
          font-size: 13px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e2e8f0;
        }
        .summary-content {
          max-height: 500px;
          overflow-y: auto;
          line-height: 1.6;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
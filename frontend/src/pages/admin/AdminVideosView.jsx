import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";
import Stars from "../../components/Stars";
import BackButton from "../../components/BackButton";

export default function AdminVideosView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

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
        <h3 className="mb-4 fw-bold">🎥 Student Video Summaries</h3>
        <p className="text-muted mb-4">Total: {videos.length} videos</p>
        
        {videos.length === 0 ? (
          <div className="alert alert-info text-center">No video summaries found for this student.</div>
        ) : (
          <div className="row g-3">
            {videos.map((video) => (
              <div key={video._id} className="col-md-6">
                <div className="card shadow-sm border-0 hover-card">
                  <div className="card-body">
                    <h5 className="fw-bold">{video.title}</h5>
                    <p className="text-muted small mb-2">By {video.author}</p>
                    <div className="video-preview bg-light p-3 rounded">
                      <small>{video.summary?.substring(0, 200)}...</small>
                    </div>
                    <hr />
                    <small className="text-muted">
                      Saved: {new Date(video.savedAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .hover-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }
        .video-preview {
          font-size: 13px;
          line-height: 1.5;
          max-height: 100px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
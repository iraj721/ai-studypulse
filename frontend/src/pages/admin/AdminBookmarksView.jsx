import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";
import Stars from "../../components/Stars";
import BackButton from "../../components/BackButton";

export default function AdminBookmarksView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await apiAdmin.get(`/admin/students/${id}/bookmarks`);
      setBookmarks(res.data);
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
          <p className="mt-3">Loading bookmarks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        <BackButton to={`/admin/users/${id}`} label="← Back to User Details" />
        <h3 className="mb-4 fw-bold">🔖 Student Bookmarks</h3>
        <p className="text-muted mb-4">Total: {bookmarks.length} bookmarks</p>
        
        {bookmarks.length === 0 ? (
          <div className="alert alert-info text-center">No bookmarks found for this student.</div>
        ) : (
          <div className="row g-3">
            {bookmarks.map((bookmark) => (
              <div key={bookmark._id} className="col-md-6 col-lg-4">
                <div className="card shadow-sm h-100 border-0 hover-card">
                  <div className="card-body">
                    <div className={`badge bg-${bookmark.type === 'note' ? 'primary' : bookmark.type === 'quiz' ? 'success' : 'warning'} mb-2`}>
                      {bookmark.type.toUpperCase()}
                    </div>
                    <h5 className="mb-2">{bookmark.title}</h5>
                    <p className="text-muted small mb-2">{bookmark.subtitle}</p>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span className="badge bg-secondary">{bookmark.collectionName}</span>
                      <small className="text-muted">
                        {new Date(bookmark.createdAt).toLocaleDateString()}
                      </small>
                    </div>
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
      `}</style>
    </div>
  );
}
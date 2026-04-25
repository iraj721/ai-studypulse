import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";
// import Stars from "../../components/Stars";
// import BackButton from "../../components/BackButton";

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

  const getTypeIcon = (type) => {
    switch(type) {
      case 'note': return '📓';
      case 'quiz': return '📝';
      case 'video': return '🎥';
      case 'activity': return '📘';
      default: return '🔖';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'note': return '#4f46e5';
      case 'quiz': return '#10b981';
      case 'video': return '#ef4444';
      case 'activity': return '#f59e0b';
      default: return '#64748b';
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
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">🔖 Student Bookmarks</h3>
          <span className="badge bg-primary fs-6">{bookmarks.length} Bookmarks</span>
        </div>

        {bookmarks.length === 0 ? (
          <div className="alert alert-info text-center py-5">
            <div className="fs-1 mb-3">🔖</div>
            <h5>No Bookmarks Found</h5>
            <p>This student hasn't bookmarked anything yet.</p>
          </div>
        ) : (
          <div className="row g-4">
            {bookmarks.map((bookmark) => (
              <div key={bookmark._id} className="col-md-6 col-lg-4">
                <div className="bookmark-admin-card">
                  <div className="bookmark-type" style={{ backgroundColor: getTypeColor(bookmark.type) }}>
                    {getTypeIcon(bookmark.type)} {bookmark.type.toUpperCase()}
                  </div>
                  <h5 className="bookmark-title">{bookmark.title}</h5>
                  <p className="bookmark-subtitle">{bookmark.subtitle || "No description"}</p>
                  <div className="bookmark-footer">
                    <span className="bookmark-collection">
                      📁 {bookmark.collectionName}
                    </span>
                    {bookmark.starred && <span className="bookmark-star">⭐ Starred</span>}
                  </div>
                  <div className="bookmark-date">
                    {new Date(bookmark.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .bookmark-admin-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .bookmark-admin-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 25px rgba(0,0,0,0.15);
        }
        .bookmark-type {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          color: white;
          margin-bottom: 12px;
          width: fit-content;
        }
        .bookmark-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          color: #1e293b;
        }
        .bookmark-subtitle {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 12px;
          flex: 1;
        }
        .bookmark-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #e2e8f0;
        }
        .bookmark-collection {
          font-size: 11px;
          color: #64748b;
        }
        .bookmark-star {
          font-size: 11px;
          color: #f59e0b;
        }
        .bookmark-date {
          font-size: 10px;
          color: #94a3b8;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
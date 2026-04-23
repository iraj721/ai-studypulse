import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import Stars from "../../components/Stars";
import BackButton from "../../components/BackButton";
import Toast from "../../components/Toast";
import { FaBookmark, FaStar, FaStarHalf, FaTrash, FaFolder, FaTag } from "react-icons/fa";

export default function BookmarksPage() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
    fetchCollections();
  }, [selectedCollection, showStarredOnly]);

  const fetchBookmarks = async () => {
    setLoading(true);
    try {
      let url = "/student/bookmarks";
      if (selectedCollection !== "all" && selectedCollection !== "starred") {
        url += `?collection=${encodeURIComponent(selectedCollection)}`;
      } else if (showStarredOnly) {
        url += "?starred=true";
      }
      const res = await api.get(url);
      setBookmarks(res.data);
    } catch (err) {
      setToast({ message: "Failed to load bookmarks", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const res = await api.get("/student/bookmarks/collections");
      setCollections(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStar = async (bookmark) => {
    try {
      await api.put(`/student/bookmarks/${bookmark._id}`, { starred: !bookmark.starred });
      fetchBookmarks();
    } catch (err) {
      setToast({ message: "Failed to update", type: "error" });
    }
  };

  const deleteBookmark = async (id) => {
    try {
      await api.delete(`/student/bookmarks/${id}`);
      fetchBookmarks();
      setToast({ message: "Bookmark deleted", type: "success" });
    } catch (err) {
      setToast({ message: "Failed to delete", type: "error" });
    }
  };

  const getItemLink = (bookmark) => {
    if (bookmark.type === 'note') return `/notes`;
    if (bookmark.type === 'quiz') return `/quizzes`;
    if (bookmark.type === 'video') return `/video-summarizer`;
    return '#';
  };

  return (
    <div className="bookmarks-page min-vh-100 py-5 position-relative">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container">
        <BackButton to="/dashboard" label="← Back to Dashboard" />

        <h2 className="text-white fw-bold mb-4">🔖 My Bookmarks</h2>

        {/* Filters */}
        <div className="filters-card p-3 mb-4">
          <div className="filters-row">
            <button className={selectedCollection === "all" && !showStarredOnly ? "filter-active" : "filter-btn"} onClick={() => { setSelectedCollection("all"); setShowStarredOnly(false); }}>
              All
            </button>
            <button className={showStarredOnly ? "filter-active" : "filter-btn"} onClick={() => { setShowStarredOnly(true); setSelectedCollection("all"); }}>
              ⭐ Starred
            </button>
            {collections.filter(c => c !== "Default").map(c => (
              <button key={c} className={selectedCollection === c ? "filter-active" : "filter-btn"} onClick={() => { setSelectedCollection(c); setShowStarredOnly(false); }}>
                <FaFolder /> {c}
              </button>
            ))}
          </div>
        </div>

        {/* Bookmarks List */}
        {loading ? (
          <div className="text-center py-5">Loading...</div>
        ) : bookmarks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔖</div>
            <h4>No Bookmarks Yet</h4>
            <p>Save important notes, quizzes, and videos by clicking the bookmark button!</p>
            <Link to="/notes" className="btn-primary-custom">Browse Notes</Link>
          </div>
        ) : (
          <div className="bookmarks-grid">
            {bookmarks.map(bookmark => (
              <div key={bookmark._id} className="bookmark-card">
                <div className="bookmark-type">{bookmark.type.toUpperCase()}</div>
                <div className="bookmark-title">{bookmark.title}</div>
                <div className="bookmark-subtitle">{bookmark.subtitle}</div>
                <div className="bookmark-meta">
                  <span className="collection"><FaFolder /> {bookmark.collectionName}</span>
                  {bookmark.tags?.map(tag => (
                    <span key={tag} className="tag"><FaTag /> {tag}</span>
                  ))}
                </div>
                <div className="bookmark-actions">
                  <Link to={getItemLink(bookmark)} className="view-btn">View</Link>
                  <button onClick={() => toggleStar(bookmark)} className="star-btn">
                    {bookmark.starred ? <FaStar style={{ color: '#facc15' }} /> : <FaStarHalf />}
                  </button>
                  <button onClick={() => deleteBookmark(bookmark._id)} className="delete-btn">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .bookmarks-page {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%);
        }
        .filters-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
        }
        .filters-row {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .filter-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .filter-active {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 30px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          color: white;
        }
        .empty-icon { font-size: 64px; margin-bottom: 20px; opacity: 0.7; }
        .btn-primary-custom {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          padding: 10px 24px;
          border-radius: 30px;
          text-decoration: none;
          display: inline-block;
          margin-top: 15px;
        }
        .bookmarks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .bookmark-card {
          background: rgba(255,255,255,0.95);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s;
        }
        .bookmark-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .bookmark-type {
          font-size: 10px;
          font-weight: 600;
          color: #4f46e5;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
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
        }
        .bookmark-meta {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }
        .collection, .tag {
          font-size: 10px;
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 20px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .bookmark-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          border-top: 1px solid #e2e8f0;
          padding-top: 12px;
        }
        .view-btn {
          background: #4f46e5;
          color: white;
          padding: 6px 16px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 12px;
        }
        .star-btn, .delete-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }
        .delete-btn { color: #ef4444; }
        @media (max-width: 768px) {
          .bookmarks-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
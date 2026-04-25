import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import Toast from "../../components/Toast";
import { 
  FaArrowLeft, FaBookmark, FaStar, FaStarHalf, FaTrash, 
  FaFolder, FaTag, FaEye, FaSpinner
} from "react-icons/fa";

export default function BookmarksPage() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

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
      setToast({ message: bookmark.starred ? "Removed from starred" : "Added to starred", type: "success" });
    } catch (err) {
      setToast({ message: "Failed to update", type: "error" });
    }
  };

  const deleteBookmark = async (id, title) => {
    if (!window.confirm(`Delete "${title}" from bookmarks?`)) return;
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

  const getItemIcon = (type) => {
    switch(type) {
      case 'note': return '📓';
      case 'quiz': return '📝';
      case 'video': return '🎥';
      default: return '🔖';
    }
  };

  if (loading) {
    return (
      <div className="bookmark-loading">
        <div className="bookmark-spinner"></div>
        <p>Loading your bookmarks...</p>
      </div>
    );
  }

  return (
    <div className="bookmark-root">
      {/* Background */}
      <div className="bookmark-bg" />
      <div className="bookmark-bg-grid" /> {/* Fixed: renamed from bookmark-grid */}
      <div className="bookmark-orb bookmark-orb-a" />
      <div className="bookmark-orb bookmark-orb-b" />

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      {/* Main Content */}
      <main className="bookmark-main">
        <div className="bookmark-container">
          {/* Back Button */}
          <button className="bookmark-back" onClick={() => navigate("/dashboard")}>
            <FaArrowLeft /> Back to Dashboard
          </button>

          {/* Header */}
          <div className="bookmark-header">
            <div className="bookmark-header-icon">
              <FaBookmark />
            </div>
            <div>
              <h1 className="bookmark-title">My <span className="bookmark-grad">Bookmarks</span></h1>
              <p className="bookmark-subtitle">Save and organize your important content</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bookmark-filters">
            <div className="filter-group">
              <button 
                className={`filter-btn ${selectedCollection === "all" && !showStarredOnly ? "active" : ""}`}
                onClick={() => { setSelectedCollection("all"); setShowStarredOnly(false); }}
              >
                All Bookmarks
              </button>
              <button 
                className={`filter-btn ${showStarredOnly ? "active starred" : ""}`}
                onClick={() => { setShowStarredOnly(true); setSelectedCollection("all"); }}
              >
                <FaStar /> Starred
              </button>
            </div>
            <div className="collection-group">
              {collections.filter(c => c !== "Default").map(c => (
                <button 
                  key={c} 
                  className={`collection-btn ${selectedCollection === c ? "active" : ""}`}
                  onClick={() => { setSelectedCollection(c); setShowStarredOnly(false); }}
                >
                  <FaFolder /> {c}
                </button>
              ))}
            </div>
          </div>

          {/* Bookmarks Grid */}
          {bookmarks.length === 0 ? (
            <div className="bookmark-empty">
              <div className="bookmark-empty-icon">🔖</div>
              <h3>No Bookmarks Yet</h3>
              <p>Save important notes, quizzes, and videos by clicking the bookmark button!</p>
              <Link to="/notes" className="bookmark-empty-btn">Browse Notes</Link>
            </div>
          ) : (
            <div className="bookmarks-cards-grid"> {/* Fixed: renamed from bookmark-grid */}
              {bookmarks.map((bookmark) => (
                <div key={bookmark._id} className="bookmark-card">
                  <div className="bookmark-card-header">
                    <div className="bookmark-type">
                      {getItemIcon(bookmark.type)} {bookmark.type.toUpperCase()}
                    </div>
                    <button 
                      className={`star-btn ${bookmark.starred ? "active" : ""}`}
                      onClick={() => toggleStar(bookmark)}
                      title={bookmark.starred ? "Remove from starred" : "Add to starred"}
                    >
                      {bookmark.starred ? <FaStar /> : <FaStarHalf />}
                    </button>
                  </div>
                  
                  <div className="bookmark-card-body">
                    <h4 className="bookmark-title-text">{bookmark.title}</h4>
                    <p className="bookmark-subtitle-text">{bookmark.subtitle}</p>
                    
                    <div className="bookmark-meta">
                      <span className="bookmark-collection">
                        <FaFolder /> {bookmark.collectionName}
                      </span>
                      {bookmark.tags?.map(tag => (
                        <span key={tag} className="bookmark-tag">
                          <FaTag /> {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bookmark-card-footer">
                    <Link to={getItemLink(bookmark)} className="bookmark-view-btn">
                      <FaEye /> View
                    </Link>
                    <button 
                      className="bookmark-delete-btn"
                      onClick={() => deleteBookmark(bookmark._id, bookmark.title)}
                      title="Delete bookmark"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .bookmark-root {
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
        }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .bookmark-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }

        .bookmark-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background */
        .bookmark-bg {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.08) 0%, transparent 60%);
        }
        .bookmark-bg-grid { /* Fixed: renamed from bookmark-grid */
          position: fixed; inset: 0; z-index: 0;
          background-image: linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .bookmark-orb {
          position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .bookmark-orb-a { width: 400px; height: 400px; top: -100px; left: 50%; transform: translateX(-50%); background: rgba(88, 130, 255, 0.06); animation: orbFloat 12s infinite; }
        .bookmark-orb-b { width: 250px; height: 250px; bottom: 10%; right: -5%; background: rgba(32, 230, 208, 0.04); animation: orbFloat2 10s infinite; }
        @keyframes orbFloat { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.1); } }
        @keyframes orbFloat2 { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }

        /* Loading */
        .bookmark-loading {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: #0a0c12;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .bookmark-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(88, 130, 255, 0.2);
          border-top-color: #5882ff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .bookmark-loading p { margin-top: 15px; color: #8e9cc4; }

        /* Main Content */
        .bookmark-main {
          position: relative;
          z-index: 10;
          max-width: 1100px;
          margin: 0 auto;
          padding: 90px 2rem 3rem;
          min-height: 100vh;
        }

        /* Back Button */
        .bookmark-back {
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
        .bookmark-back:hover {
          background: rgba(88, 130, 255, 0.2);
          transform: translateX(-4px);
        }

        /* Header */
        .bookmark-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .bookmark-header-icon {
          width: 60px;
          height: 60px;
          background: rgba(88, 130, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          color: var(--accent);
        }
        .bookmark-title {
          font-family: var(--fd);
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .bookmark-subtitle {
          color: var(--muted);
          font-size: 0.85rem;
        }

        /* Filters */
        .bookmark-filters {
          background: rgba(17, 19, 24, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1rem;
          margin-bottom: 2rem;
        }
        .filter-group {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: 40px;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-btn:hover {
          background: rgba(88, 130, 255, 0.1);
          color: var(--text);
        }
        .filter-btn.active {
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: white;
          border-color: transparent;
        }
        .filter-btn.starred.active {
          background: #f59e0b;
        }
        .collection-group {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .collection-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: 30px;
          color: var(--muted);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .collection-btn:hover {
          background: rgba(88, 130, 255, 0.1);
        }
        .collection-btn.active {
          background: rgba(88, 130, 255, 0.2);
          color: var(--accent);
          border-color: var(--accent);
        }

        /* Empty State */
        .bookmark-empty {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(17, 19, 24, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 24px;
        }
        .bookmark-empty-icon { font-size: 4rem; margin-bottom: 1rem; opacity: 0.5; }
        .bookmark-empty h3 { margin-bottom: 0.5rem; color: var(--text); }
        .bookmark-empty p { color: var(--muted); margin-bottom: 1.5rem; }
        .bookmark-empty-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: white;
          padding: 10px 24px;
          border-radius: 40px;
          text-decoration: none;
          font-weight: 600;
        }

        /* Bookmarks Cards Grid - Fixed renamed class */
        .bookmarks-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .bookmark-card {
          background: rgba(17, 19, 24, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.3s;
        }
        .bookmark-card:hover {
          border-color: var(--border-h);
          transform: translateY(-4px);
        }
        .bookmark-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(88, 130, 255, 0.08);
          border-bottom: 1px solid var(--border);
        }
        .bookmark-type {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .star-btn {
          background: none;
          border: none;
          color: var(--faint);
          cursor: pointer;
          font-size: 1.1rem;
          transition: all 0.2s;
        }
        .star-btn:hover {
          color: #f59e0b;
        }
        .star-btn.active {
          color: #f59e0b;
        }
        .bookmark-card-body {
          padding: 1rem;
        }
        .bookmark-title-text {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text);
        }
        .bookmark-subtitle-text {
          font-size: 0.8rem;
          color: var(--muted);
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        .bookmark-meta {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .bookmark-collection, .bookmark-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.65rem;
          background: rgba(255,255,255,0.05);
          padding: 4px 10px;
          border-radius: 20px;
          color: var(--faint);
        }
        .bookmark-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          border-top: 1px solid var(--border);
          background: rgba(0,0,0,0.2);
        }
        .bookmark-view-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(88, 130, 255, 0.15);
          color: var(--accent);
          padding: 6px 14px;
          border-radius: 30px;
          text-decoration: none;
          font-size: 0.75rem;
          transition: all 0.2s;
        }
        .bookmark-view-btn:hover {
          background: rgba(88, 130, 255, 0.3);
        }
        .bookmark-delete-btn {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .bookmark-delete-btn:hover {
          background: #ef4444;
          color: white;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .bookmark-main { padding: 80px 1rem 2rem; }
          .bookmark-title { font-size: 1.5rem; }
          .bookmark-header { flex-direction: column; text-align: center; }
          .bookmark-header-icon { width: 50px; height: 50px; font-size: 1.5rem; }
          .bookmark-back { width: 100%; justify-content: center; }
          .filter-group { flex-direction: column; }
          .filter-btn { justify-content: center; }
          .collection-group { justify-content: center; }
          .bookmarks-cards-grid { grid-template-columns: 1fr; } /* Fixed responsive class */
        }
      `}</style>
    </div>
  );
}
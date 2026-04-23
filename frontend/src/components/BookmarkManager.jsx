import React, { useState, useEffect } from "react";
import api from "../services/api";
import { FaBookmark, FaStar, FaStarHalf, FaTrash, FaFolder, FaTag } from "react-icons/fa";
import Toast from "./Toast";

export default function BookmarkManager({ item, itemType, onBookmarkAdded }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [collections, setCollections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState("Default");
  const [newCollection, setNewCollection] = useState("");
  const [tags, setTags] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [view, setView] = useState("list"); // list or collections
  const [selectedCollectionView, setSelectedCollectionView] = useState("all");
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  useEffect(() => {
    fetchBookmarks();
    fetchCollections();
  }, [selectedCollectionView, showStarredOnly]);

  const fetchBookmarks = async () => {
    try {
      let url = "/student/bookmarks";
      if (selectedCollectionView !== "all" && selectedCollectionView !== "starred") {
        url += `?collection=${encodeURIComponent(selectedCollectionView)}`;
      } else if (showStarredOnly) {
        url += "?starred=true";
      }
      const res = await api.get(url);
      setBookmarks(res.data);
    } catch (err) {
      console.error(err);
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

  const addBookmark = async () => {
    if (!item) return;
    try {
      await api.post("/student/bookmarks", {
        type: itemType,
        itemId: item._id,
        collectionName: selectedCollection === "new" ? newCollection : selectedCollection,
        tags: tags.split(",").map(t => t.trim())
      });
      setToast({ message: "Bookmarked successfully!", type: "success" });
      setShowModal(false);
      fetchBookmarks();
      if (onBookmarkAdded) onBookmarkAdded();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to bookmark", type: "error" });
    }
  };

  const toggleStar = async (bookmark) => {
    try {
      await api.put(`/student/bookmarks/${bookmark._id}`, { starred: !bookmark.starred });
      fetchBookmarks();
    } catch (err) {
      console.error(err);
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

  return (
    <div className="bookmark-manager">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="bookmark-header">
        <h4><FaBookmark /> My Bookmarks</h4>
        {item && (
          <button onClick={() => setShowModal(true)} className="btn-add-bookmark">
            + Bookmark This
          </button>
        )}
      </div>

      <div className="bookmark-filters">
        <button className={selectedCollectionView === "all" && !showStarredOnly ? "active-filter" : ""} onClick={() => { setSelectedCollectionView("all"); setShowStarredOnly(false); }}>All</button>
        <button className={showStarredOnly ? "active-filter" : ""} onClick={() => { setShowStarredOnly(true); setSelectedCollectionView("all"); }}>⭐ Starred</button>
        {collections.map(c => (
          <button key={c} className={selectedCollectionView === c ? "active-filter" : ""} onClick={() => { setSelectedCollectionView(c); setShowStarredOnly(false); }}>{c}</button>
        ))}
      </div>

      <div className="bookmarks-list">
        {bookmarks.length === 0 ? (
          <div className="empty-bookmarks">
            <p>No bookmarks yet. Click "Bookmark This" to save important content!</p>
          </div>
        ) : (
          bookmarks.map(bookmark => (
            <div key={bookmark._id} className="bookmark-item">
              <div className="bookmark-icon"><FaBookmark /></div>
              <div className="bookmark-info">
                <div className="bookmark-title">{bookmark.title}</div>
                <div className="bookmark-subtitle">{bookmark.subtitle}</div>
                <div className="bookmark-meta">
                  <span className="bookmark-collection"><FaFolder /> {bookmark.collectionName}</span>
                  {bookmark.tags?.map(tag => (
                    <span key={tag} className="bookmark-tag"><FaTag /> {tag}</span>
                  ))}
                </div>
              </div>
              <div className="bookmark-actions">
                <button onClick={() => toggleStar(bookmark)} className="star-btn">
                  {bookmark.starred ? <FaStar style={{ color: '#facc15' }} /> : <FaStarHalf />}
                </button>
                <button onClick={() => deleteBookmark(bookmark._id)} className="delete-bookmark"><FaTrash /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Bookmark Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>📌 Add to Bookmarks</h4>
            <div className="form-group">
              <label>Collection</label>
              <select value={selectedCollection} onChange={(e) => setSelectedCollection(e.target.value)}>
                <option value="Default">Default</option>
                {collections.filter(c => c !== "Default").map(c => <option key={c} value={c}>{c}</option>)}
                <option value="new">+ Create New Collection</option>
              </select>
              {selectedCollection === "new" && (
                <input type="text" placeholder="New collection name" value={newCollection} onChange={(e) => setNewCollection(e.target.value)} className="mt-2" />
              )}
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input type="text" placeholder="e.g., important, exam, revision" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button onClick={addBookmark}>Save Bookmark</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .bookmark-manager { padding: 20px; background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff); border-radius: 20px; margin-top: 20px; }
        .bookmark-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; flex-wrap: wrap; gap: 12px; }
        .btn-add-bookmark { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; padding: 8px 16px; border-radius: 10px; cursor: pointer; }
        .bookmark-filters { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 15px; }
        .bookmark-filters button { padding: 6px 12px; background: #f0f0f0; border: none; border-radius: 20px; cursor: pointer; font-size: 12px; transition: all 0.2s; }
        .bookmark-filters button.active-filter { background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; }
        .bookmarks-list { max-height: 400px; overflow-y: auto; }
        .bookmark-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: white; border-radius: 12px; margin-bottom: 10px; transition: all 0.2s; }
        .bookmark-item:hover { transform: translateX(4px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .bookmark-icon { font-size: 20px; color: #f59e0b; }
        .bookmark-info { flex: 1; }
        .bookmark-title { font-weight: 600; font-size: 14px; }
        .bookmark-subtitle { font-size: 12px; color: #6b7280; }
        .bookmark-meta { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
        .bookmark-collection, .bookmark-tag { font-size: 10px; background: #f3f4f6; padding: 2px 8px; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px; }
        .bookmark-actions { display: flex; gap: 8px; }
        .star-btn, .delete-bookmark { background: none; border: none; cursor: pointer; font-size: 16px; }
        .delete-bookmark { color: #ef4444; }
        .empty-bookmarks { text-align: center; padding: 30px; color: #6b7280; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 5px; }
        .form-group select, .form-group input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
        .mt-2 { margin-top: 8px; }
        @media (max-width: 768px) { .bookmark-header { flex-direction: column; } .bookmark-item { flex-wrap: wrap; } }
      `}</style>
    </div>
  );
}
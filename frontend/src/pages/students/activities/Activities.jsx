import React, { useEffect, useState, useRef } from "react";
import api from "../../../services/api";
import { Link, useNavigate } from "react-router-dom";
import ActivityInsightsModal from "../../../components/ActivityInsightsModal";
import Navbar from "../../../components/Navbar";
import { FaSearch, FaTrash, FaEye, FaCalendarAlt, FaClock } from "react-icons/fa";

export default function Activities() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [loading, setLoading] = useState(true);
  const toastTimer = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast({ message: "", type: "success" }), 5000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchUser();
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const res = await api.get("/activities");
      setActivities(res.data);
      setFiltered(res.data);
    } catch (err) {
      showToast("Failed to load activities", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    filterData(val, difficulty);
  };

  const handleDifficulty = (val) => {
    setDifficulty(val);
    filterData(search, val);
  };

  const filterData = (s, d) => {
    let data = [...activities];
    if (s.trim())
      data = data.filter(
        (a) =>
          a.subject.toLowerCase().includes(s.toLowerCase()) ||
          a.topic.toLowerCase().includes(s.toLowerCase()),
      );
    if (d !== "all") data = data.filter((a) => a.difficulty === d);
    setFiltered(data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this activity?")) return;
    try {
      await api.delete(`/activities/${id}`);
      showToast("Activity deleted successfully!", "success");
      loadActivities();
    } catch (err) {
      showToast("Failed to delete activity", "error");
    }
  };

  return (
    <div className="act-page">
      {/* Background */}
      <div className="act-bg"></div>

      {/* Toast */}
      {toast.message && (
        <div className={`act-toast act-toast-${toast.type}`}>
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.message}
        </div>
      )}

      {/* Navbar */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="act-main">
        <div className="act-container">
          {/* Header */}
          <div className="act-header">
            <div>
              <h1 className="act-title">Study <span className="act-grad">Activities</span></h1>
              <p className="act-sub">Track and manage all your study sessions</p>
            </div>
            <Link to="/activities/add" className="act-add-btn">+ Add New Activity</Link>
          </div>

          {/* Search & Filters */}
          <div className="act-filters">
            <div className="act-search-box">
              <FaSearch className="act-search-icon" />
              <input
                type="text"
                placeholder="Search by subject or topic..."
                value={search}
                onChange={handleSearch}
              />
            </div>
            <div className="act-filter-btns">
              <button className={difficulty === "all" ? "active" : ""} onClick={() => handleDifficulty("all")}>All</button>
              <button className={difficulty === "easy" ? "active easy" : "easy"} onClick={() => handleDifficulty("easy")}>🟢 Easy</button>
              <button className={difficulty === "medium" ? "active medium" : "medium"} onClick={() => handleDifficulty("medium")}>🟡 Medium</button>
              <button className={difficulty === "hard" ? "active hard" : "hard"} onClick={() => handleDifficulty("hard")}>🔴 Hard</button>
            </div>
          </div>

          {/* Activities Grid */}
          {loading ? (
            <div className="act-loading"><div className="act-spinner"></div><p>Loading...</p></div>
          ) : filtered.length === 0 ? (
            <div className="act-empty">
              <div className="act-empty-icon">📭</div>
              <h3>No Activities Found</h3>
              <p>Start your study journey by adding your first activity!</p>
              <Link to="/activities/add" className="act-empty-btn">+ Add Activity</Link>
            </div>
          ) : (
            <div className="act-grid">
              {filtered.map((activity) => (
                <div key={activity._id} className="act-card">
                  <div className="act-card-top">
                    <h3>{activity.subject}</h3>
                    <span className={`act-badge ${activity.difficulty}`}>
                      {activity.difficulty === "easy" && "🟢 Easy"}
                      {activity.difficulty === "medium" && "🟡 Medium"}
                      {activity.difficulty === "hard" && "🔴 Hard"}
                    </span>
                  </div>
                  <div className="act-card-topic">{activity.topic}</div>
                  <div className="act-card-info">
                    <span><FaClock /> {activity.durationMinutes} min</span>
                    <span><FaCalendarAlt /> {new Date(activity.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="act-card-buttons">
                    {(activity.insights || []).length > 0 ? (
                      <button className="act-view-btn" onClick={() => { setSelectedActivity(activity); setShowModal(true); }}>
                        <FaEye /> View Insights
                      </button>
                    ) : (
                      <span className="act-no-insight">No insights yet</span>
                    )}
                    <button className="act-del-btn" onClick={() => handleDelete(activity._id)}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <ActivityInsightsModal show={showModal} onClose={() => setShowModal(false)} activity={selectedActivity} />

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .act-page {
          font-family: 'Inter', sans-serif;
          background: #0a0c12;
          min-height: 100vh;
        }

        .act-bg {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #0a0c12 0%, #111318 50%, #0a0c12 100%);
          z-index: -1;
        }

        .act-grad {
          background: linear-gradient(135deg, #5882ff, #20e6d0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Toast */
        .act-toast {
          position: fixed;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          padding: 10px 20px;
          border-radius: 30px;
          font-size: 14px;
          font-weight: 500;
          background: #111318;
          border: 1px solid;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .act-toast-success {
          border-color: #10b981;
          color: #10b981;
        }
        .act-toast-error {
          border-color: #ef4444;
          color: #ef4444;
        }

        /* Main Content */
        .act-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 90px 20px 40px;
        }

        /* Header */
        .act-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 15px;
        }
        .act-title {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: #edf2ff;
        }
        .act-sub {
          color: #8e9cc4;
          font-size: 14px;
          margin-top: 5px;
        }
        .act-add-btn {
          background: linear-gradient(135deg, #5882ff, #3a61e0);
          color: white;
          padding: 10px 24px;
          border-radius: 40px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .act-add-btn:hover {
          transform: translateY(-2px);
        }

        /* Filters */
        .act-filters {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        .act-search-box {
          flex: 2;
          position: relative;
        }
        .act-search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #49587a;
        }
        .act-search-box input {
          width: 100%;
          padding: 12px 20px 12px 45px;
          background: #111318;
          border: 1px solid rgba(88,130,255,0.15);
          border-radius: 40px;
          color: #edf2ff;
          font-size: 14px;
        }
        .act-search-box input:focus {
          outline: none;
          border-color: #5882ff;
        }
        .act-search-box input::placeholder {
          color: #49587a;
        }
        .act-filter-btns {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .act-filter-btns button {
          padding: 8px 18px;
          border-radius: 30px;
          background: #111318;
          border: 1px solid rgba(88,130,255,0.15);
          color: #8e9cc4;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .act-filter-btns button:hover {
          background: rgba(88,130,255,0.1);
        }
        .act-filter-btns button.active {
          background: #5882ff;
          color: white;
          border-color: #5882ff;
        }
        .act-filter-btns button.easy.active {
          background: #10b981;
          border-color: #10b981;
        }
        .act-filter-btns button.medium.active {
          background: #f59e0b;
          border-color: #f59e0b;
        }
        .act-filter-btns button.hard.active {
          background: #ef4444;
          border-color: #ef4444;
        }

        /* Loading */
        .act-loading {
          text-align: center;
          padding: 60px;
        }
        .act-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(88,130,255,0.2);
          border-top-color: #5882ff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 15px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Empty */
        .act-empty {
          text-align: center;
          padding: 60px 20px;
          background: #111318;
          border-radius: 24px;
          border: 1px solid rgba(88,130,255,0.1);
        }
        .act-empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        .act-empty h3 {
          color: #edf2ff;
          margin-bottom: 8px;
        }
        .act-empty p {
          color: #8e9cc4;
          margin-bottom: 20px;
        }
        .act-empty-btn {
          display: inline-block;
          padding: 10px 24px;
          background: linear-gradient(135deg, #5882ff, #3a61e0);
          color: white;
          text-decoration: none;
          border-radius: 30px;
        }

        /* Cards Grid */
        .act-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }
        .act-card {
          background: #111318;
          border: 1px solid rgba(88,130,255,0.1);
          border-radius: 20px;
          padding: 20px;
          transition: all 0.3s;
        }
        .act-card:hover {
          border-color: rgba(88,130,255,0.3);
          transform: translateY(-4px);
        }
        .act-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .act-card-top h3 {
          font-size: 18px;
          font-weight: 600;
          color: #edf2ff;
        }
        .act-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        .act-badge.easy {
          background: rgba(16,185,129,0.15);
          color: #34d399;
        }
        .act-badge.medium {
          background: rgba(245,158,11,0.15);
          color: #fbbf24;
        }
        .act-badge.hard {
          background: rgba(239,68,68,0.15);
          color: #f87171;
        }
        .act-card-topic {
          font-size: 14px;
          color: #8e9cc4;
          margin-bottom: 15px;
          line-height: 1.4;
        }
        .act-card-info {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #49587a;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .act-card-info span {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .act-card-buttons {
          display: flex;
          gap: 12px;
        }
        .act-view-btn {
          background: rgba(88,130,255,0.1);
          border: 1px solid rgba(88,130,255,0.2);
          color: #5882ff;
          padding: 6px 16px;
          border-radius: 30px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .act-view-btn:hover {
          background: #5882ff;
          color: white;
        }
        .act-del-btn {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.2);
          color: #f87171;
          padding: 6px 16px;
          border-radius: 30px;
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .act-del-btn:hover {
          background: #ef4444;
          color: white;
        }
        .act-no-insight {
          padding: 6px 16px;
          color: #49587a;
          font-size: 12px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .act-main {
            padding: 80px 15px 30px;
          }
          .act-title {
            font-size: 24px;
          }
          .act-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .act-add-btn {
            width: 100%;
            text-align: center;
          }
          .act-filters {
            flex-direction: column;
          }
          .act-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
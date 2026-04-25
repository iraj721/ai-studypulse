import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { Link } from "react-router-dom";
import ActivityInsightsModal from "../../../components/ActivityInsightsModal";
import Stars from "../../../components/Stars";
import BackButton from "../../../components/BackButton";
import Toast from "../../../components/Toast";
import { FaSearch, FaTrash, FaEye, FaCalendarAlt, FaClock } from "react-icons/fa";

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const res = await api.get("/activities");
      setActivities(res.data);
      setFiltered(res.data);
    } catch (err) {
      setToast({ message: "Failed to load activities", type: "error" });
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    filterData(val, difficulty);
  };

  const handleDifficulty = (e) => {
    const val = e.target.value;
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
      setToast({ message: "Activity deleted successfully!", type: "success" });
      loadActivities();
    } catch (err) {
      setToast({ message: "Failed to delete activity", type: "error" });
    }
  };

  return (
    <div className="activities-page min-vh-100 py-5 position-relative">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container">
        <BackButton to="/dashboard" label="← Back to Dashboard" />

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h3 className="page-title">📚 Your Study Activities</h3>
          <Link to="/activities/add" className="btn-add-activity">
            + Add New Activity
          </Link>
        </div>

        {/* Filters */}
        <div className="filters-wrapper mb-4">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by subject or topic..."
              value={search}
              onChange={handleSearch}
            />
          </div>
          <select className="difficulty-select" value={difficulty} onChange={handleDifficulty}>
            <option value="all">All Difficulties</option>
            <option value="easy">🟢 Easy</option>
            <option value="medium">🟡 Medium</option>
            <option value="hard">🔴 Hard</option>
          </select>
        </div>

        {/* Activities Grid/Card View */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h4>No Activities Found</h4>
            <p>Start your study journey by adding your first activity!</p>
            <Link to="/activities/add" className="btn-empty-add">+ Add Activity</Link>
          </div>
        ) : (
          <div className="activities-grid">
            {filtered.map((activity) => (
              <div key={activity._id} className="activity-card">
                <div className="activity-header">
                  <div className="activity-subject">{activity.subject}</div>
                  <div className={`difficulty-badge ${activity.difficulty}`}>
                    {activity.difficulty === "easy" && "🟢 Easy"}
                    {activity.difficulty === "medium" && "🟡 Medium"}
                    {activity.difficulty === "hard" && "🔴 Hard"}
                  </div>
                </div>
                <div className="activity-topic">{activity.topic}</div>
                <div className="activity-meta">
                  <span><FaClock /> {activity.durationMinutes} min</span>
                  <span><FaCalendarAlt /> {new Date(activity.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="activity-actions">
                  {(activity.insights || []).length > 0 ? (
                    <button className="insight-btn" onClick={() => { setSelectedActivity(activity); setShowModal(true); }}>
                      <FaEye /> View Insights
                    </button>
                  ) : (
                    <span className="no-insights">No insights yet</span>
                  )}
                  <button className="delete-btn" onClick={() => handleDelete(activity._id)}>
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <ActivityInsightsModal show={showModal} onClose={() => setShowModal(false)} activity={selectedActivity} />
      </div>

      <style>{`
        .activities-page {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%);
        }
        .page-title {
          color: white;
          font-weight: bold;
        }
        .btn-add-activity {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          color: white;
          padding: 10px 24px;
          border-radius: 40px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s;
        }
        .btn-add-activity:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(79,70,229,0.4);
          color: white;
        }
        .filters-wrapper {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .search-box {
          flex: 2;
          position: relative;
        }
        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        .search-input {
          width: 100%;
          padding: 12px 16px 12px 45px;
          border-radius: 40px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.1);
          color: white;
          font-size: 14px;
        }
        .search-input::placeholder {
          color: rgba(255,255,255,0.6);
        }
        .search-input:focus {
          outline: none;
          background: rgba(255,255,255,0.15);
          border-color: #4f46e5;
        }
        .difficulty-select {
          padding: 12px 20px;
          border-radius: 40px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.1);
          color: white;
          cursor: pointer;
        }
        .difficulty-select option {
          background: #1e3652;
        }
        .activities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .activity-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 20px;
          transition: all 0.3s;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .activity-card:hover {
          transform: translateY(-5px);
          background: rgba(255,255,255,0.15);
          box-shadow: 0 15px 35px rgba(0,0,0,0.2);
        }
        .activity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .activity-subject {
          font-size: 18px;
          font-weight: bold;
          color: white;
        }
        .difficulty-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        .difficulty-badge.easy {
          background: #dcfce7;
          color: #166534;
        }
        .difficulty-badge.medium {
          background: #fef3c7;
          color: #92400e;
        }
        .difficulty-badge.hard {
          background: #fee2e2;
          color: #991b1b;
        }
        .activity-topic {
          font-size: 14px;
          color: rgba(255,255,255,0.8);
          margin-bottom: 12px;
        }
        .activity-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: rgba(255,255,255,0.6);
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .activity-meta span {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .activity-actions {
          display: flex;
          gap: 12px;
        }
        .insight-btn {
          background: rgba(79,70,229,0.2);
          border: 1px solid #4f46e5;
          color: #a5b4fc;
          padding: 8px 16px;
          border-radius: 30px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .insight-btn:hover {
          background: #4f46e5;
          color: white;
        }
        .delete-btn {
          background: rgba(239,68,68,0.2);
          border: 1px solid #ef4444;
          color: #fca5a5;
          padding: 8px 16px;
          border-radius: 30px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .delete-btn:hover {
          background: #ef4444;
          color: white;
        }
        .no-insights {
          padding: 8px 16px;
          color: rgba(255,255,255,0.4);
          font-size: 12px;
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255,255,255,0.05);
          border-radius: 24px;
        }
        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        .empty-state h4 {
          color: white;
          margin-bottom: 8px;
        }
        .empty-state p {
          color: rgba(255,255,255,0.6);
          margin-bottom: 20px;
        }
        .btn-empty-add {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          padding: 10px 24px;
          border-radius: 40px;
          text-decoration: none;
          display: inline-block;
        }
        @media (max-width: 768px) {
          .filters-wrapper {
            flex-direction: column;
          }
          .activities-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
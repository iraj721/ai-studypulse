import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { Link } from "react-router-dom";
import ActivityInsightsModal from "../../../components/ActivityInsightsModal";
import Stars from "../../../components/Stars";

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showModal, setShowModal] = useState(false);



  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const res = await api.get("/activities");
      setActivities(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
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
          a.topic.toLowerCase().includes(s.toLowerCase())
      );
    if (d !== "all") data = data.filter((a) => a.difficulty === d);
    setFiltered(data);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this activity?")) return;
    try {
      await api.delete(`/activities/${id}`);
      loadActivities();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="activities-bg min-vh-100 py-5 position-relative">
      <Stars />

      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-white">Your Study Activities</h3>
          <Link to="/dashboard" className="btn btn-gradient">
            Back to Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control input-field"
              placeholder="Search by subject or topic..."
              value={search}
              onChange={handleSearch}
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-control input-field"
              value={difficulty}
              onChange={handleDifficulty}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
            </select>
          </div>
        </div>

        {/* Activities Table */}
        <div className="card shadow-lg p-3 activities-card">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Topic</th>
                <th>Duration</th>
                <th>Difficulty</th>
                <th>Insights</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((a) => (
                  <tr key={a._id} className="activity-row">
                    <td>{a.subject}</td>
                    <td>{a.topic}</td>
                    <td>{a.durationMinutes} min</td>
                    <td>
                      {a.difficulty === "easy"
                        ? "🟢 Easy"
                        : a.difficulty === "medium"
                        ? "🟡 Medium"
                        : "🔴 Hard"}
                    </td>
                    <td>
                      {(a.insights || []).length > 0 ? (
                        <button
                          className="btn btn-sm btn-outline-info"
                          onClick={() => {
                            setSelectedActivity(a);
                            setShowModal(true);
                          }}
                        >
                          View
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{new Date(a.createdAt).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(a._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No activities found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Insights Modal */}
        <ActivityInsightsModal
          show={showModal}
          onClose={() => setShowModal(false)}
          activity={selectedActivity}
        />
      </div>

      {/* STYLES */}
      <style>{`
        .activities-bg {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%);
          min-height: 100vh;
          color: #fff;
          position: relative;
        }
        .input-field {
          border-radius: 12px;
          padding: 10px 14px;
          border: none;
          background: rgba(255,255,255,0.05);
          color: #fff;
        }
        .input-field::placeholder {
          color: rgba(255,255,255,0.7);
        }
        .input-field:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.2);
          border-radius: 12px;
        }
        .activities-card {
          border-radius: 16px;
          background: rgba(24,34,52,0.85);
        }
        .activity-row:hover {
          background: rgba(255,255,255,0.05);
        }
        .btn-gradient {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          color: white;
          font-weight: 600;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .btn-gradient:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 12px 25px rgba(0,0,0,0.25);
          background: linear-gradient(135deg, #5b4be8, #7b66f3);
        }
      `}</style>
    </div>
  );
}
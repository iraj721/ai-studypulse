import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { Link } from "react-router-dom";
import ActivityInsightsModal from "../../../components/ActivityInsightsModal";
import Stars from "../../../components/Stars";
import BackButton from "../../../components/BackButton";
import Toast from "../../../components/Toast";

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
    <div className="activities-bg min-vh-100 py-5 position-relative">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container">
        <BackButton to="/dashboard" label="← Back to Dashboard" />

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h3 className="text-white">Your Study Activities</h3>
          <Link to="/activities/add" className="btn btn-gradient">
            + Add New Activity
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
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
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
                      <td data-label="Subject">{a.subject}</td>
                      <td data-label="Topic">{a.topic}</td>
                      <td data-label="Duration">{a.durationMinutes} min</td>
                      <td data-label="Difficulty">
                        {a.difficulty === "easy"
                          ? "🟢 Easy"
                          : a.difficulty === "medium"
                            ? "🟡 Medium"
                            : "🔴 Hard"}
                      </td>
                      <td data-label="Insights">
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
                      <td data-label="Created">{new Date(a.createdAt).toLocaleString()}</td>
                      <td data-label="Actions">
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
        </div>

        {/* Insights Modal */}
        <ActivityInsightsModal
          show={showModal}
          onClose={() => setShowModal(false)}
          activity={selectedActivity}
        />
      </div>

      <style>{`
        .activities-bg {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%);
          min-height: 100vh;
        }
        .activities-card {
          border-radius: 16px;
          background: rgba(24,34,52,0.85);
          backdrop-filter: blur(10px);
        }
        .activities-card table {
          color: white;
        }
        .activities-card .table-light th {
          background: rgba(255,255,255,0.1);
          color: white;
          border: none;
        }
        .input-field {
          border-radius: 12px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
        }
        .input-field::placeholder {
          color: rgba(255,255,255,0.6);
        }
        .input-field:focus {
          background: rgba(255,255,255,0.15);
          color: white;
        }
        .input-field option {
          background: #1e3652;
          color: white;
        }
        .btn-gradient {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          color: white;
        }
        @media (max-width: 768px) {
          .table thead { display: none; }
          .table tbody tr {
            display: block;
            margin-bottom: 16px;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 12px;
          }
          .table tbody tr td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border: none;
          }
          .table tbody tr td::before {
            content: attr(data-label);
            font-weight: 600;
            width: 40%;
            color: #a0aec0;
          }
        }
      `}</style>
    </div>
  );
}
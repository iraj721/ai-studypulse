import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";

export default function AdminActivityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNotes, setOpenNotes] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await apiAdmin.get(`/admin/users/${id}`);
      setActivities(res.data.activities || []);
    } catch {
      alert("Failed to load activities");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const difficultyBadge = (d) => {
    if (d === "easy") return "success";
    if (d === "medium") return "warning";
    return "danger";
  };

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">📘 User Activities</h3>
            <p className="text-muted mb-0">
              Subject-wise learning activity overview
            </p>
          </div>

          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center fs-5 mt-5">Loading activities...</div>
        ) : !activities.length ? (
          <div className="alert alert-info text-center">
            No activities found.
          </div>
        ) : (
          activities.map((a) => (
            <div key={a._id} className="card shadow-sm border-0 mb-4 activity-card">
              <div className="card-body">

                {/* Top info */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="fw-bold mb-1">
                      {a.subject}
                      <span className="text-muted"> — {a.topic}</span>
                    </h5>
                    <small className="text-muted">
                      Created on {new Date(a.createdAt).toLocaleString()}
                    </small>
                  </div>

                  <span className={`badge bg-${difficultyBadge(a.difficulty)}`}>
                    {a.difficulty.toUpperCase()}
                  </span>
                </div>

                {/* Meta */}
                <div className="mb-3 text-muted small">
                  ⏱ Duration: <strong>{a.durationMinutes} minutes</strong>
                </div>

                {/* Toggle Button */}
                {(a.notes || a.insights?.length > 0) && (
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() =>
                      setOpenNotes(openNotes === a._id ? null : a._id)
                    }
                  >
                    {openNotes === a._id ? "Hide Insights" : "View Insights"}
                  </button>
                )}

                {/* Notes & Insights */}
                {openNotes === a._id && (
                  <div className="mt-3 p-3 bg-light rounded border">

                    {/* Notes */}
                    {a.notes && (
                      <div className="mb-3">
                        <h6 className="fw-bold mb-1">🗒 Notes</h6>
                        <p className="mb-0">{a.notes}</p>
                      </div>
                    )}

                    {/* Insights */}
                    {a.insights?.length > 0 && (
                      <div>
                        <h6 className="fw-bold mb-2">💡 AI Insights</h6>
                        <ul className="list-group list-group-flush">
                          {a.insights.map((i, idx) => (
                            <li
                              key={idx}
                              className="list-group-item px-0 py-2 fw-semibold"
                            >
                              • {i}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Styling */}
      <style>{`
        .activity-card {
          transition: all 0.25s ease;
        }
        .activity-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 30px rgba(0,0,0,0.12);
        }
      `}</style>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Spinner from "../../components/Spinner";
import CardWrapper from "../../components/CardWrapper";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classToDelete, setClassToDelete] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get("/teacher/classes");
      setClasses(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!classToDelete) return;

    try {
      await api.delete(`/teacher/classes/${classToDelete._id}`);

      setClasses((prev) => prev.filter((c) => c._id !== classToDelete._id));

      setClassToDelete(null);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to delete class");
    }
  };

  return (
    <div className="container py-5">
      {/* Header */}
      <div
        className="card border-0 mb-4"
        style={{
          background: "linear-gradient(135deg, #598edcff, #4f8cff)",
          color: "#fff",
          boxShadow: "0 10px 25px rgba(13,110,253,0.25)",
        }}
      >
        <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div>
            <h2 className="fw-bold mb-1">🎓 Teacher Dashboard</h2>
            <p className="mb-0 opacity-75">
              Manage your classes easily & professionally
            </p>
          </div>
          <button
            className="btn btn-light fw-semibold px-4"
            onClick={() => navigate("/teacher/classes/create")}
          >
            ➕ Create Class
          </button>
        </div>
      </div>

      {loading && <Spinner message="Loading your classes..." />}

      {!loading && classes.length === 0 && (
        <div
          className="card border-0 text-center"
          style={{ boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}
        >
          <div className="card-body py-5">
            <h5 className="fw-bold mb-2">📭 No Classes Yet</h5>
            <p className="text-muted mb-4">
              Start by creating your first class.
            </p>
            <button
              className="btn btn-primary px-4"
              onClick={() => navigate("/teacher/classes/create")}
            >
              ➕ Create First Class
            </button>
          </div>
        </div>
      )}

      {!loading && classes.length > 0 && (
        <div className="row g-4">
          {classes.map((c) => (
            <div key={c._id} className="col-sm-6 col-lg-4">
              <CardWrapper
                className="card h-100 border-0"
                style={{
                  cursor: "pointer",
                  borderRadius: "12px",
                  transition:
                    "transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                }}
                onClick={() => navigate(`/teacher/classes/${c._id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow =
                    "0 14px 30px rgba(0,0,0,0.18)";
                  e.currentTarget.style.background = "#f8f9fa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(0,0,0,0.1)";
                  e.currentTarget.style.background = "#fff";
                }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span
                      className="badge bg-primary bg-opacity-10 text-primary px-3 py-2"
                      title="This is a class card"
                    >
                      📘 Class
                    </span>
                    <span
                      className="text-muted small"
                      title="Click to view class details"
                    >
                      👆 Click
                    </span>
                  </div>
                  <h5 className="fw-bold mb-2">{c.name}</h5>
                  <p className="text-muted mb-0">
                    🔑 Code: <span className="fw-semibold">{c.code}</span>
                  </p>
                </div>
                <div className="card-footer bg-transparent border-0 d-flex justify-content-between align-items-center">
                  <span className="text-primary fw-semibold">
                    View Details →
                  </span>

                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => {
                      e.stopPropagation(); // 🔥 card click prevent
                      setClassToDelete(c);
                    }}
                  >
                    🗑 Delete
                  </button>
                </div>
              </CardWrapper>
            </div>
          ))}
        </div>
      )}
      {/* 🔴 Delete Confirmation Card */}
      {classToDelete && (
        <div className="delete-overlay">
          <div className="delete-modal bg-white shadow rounded-3">
            <div className="p-4">
              <h6 className="fw-bold mb-2">⚠️ Delete Class</h6>
              <p className="text-muted mb-3">
                Are you sure you want to delete{" "}
                <strong>{classToDelete.name}</strong>?
                <br />
                This action cannot be undone.
              </p>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  className="btn btn-sm btn-danger"
                  onClick={handleDeleteClass}
                >
                  Yes, Delete
                </button>

                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setClassToDelete(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
.delete-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
}

.delete-modal {
  width: 360px;
  animation: scaleIn 0.2s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
`}</style>
    </div>
  );
}

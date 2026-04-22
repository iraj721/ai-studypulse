import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [redirected, setRedirected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line
  }, []);

  const fetchUser = async () => {
    try {
      const res = await apiAdmin.get(`/admin/users/${id}`);

      // Redirect teacher to teacher page
      if (res.data.user.role === "teacher") {
        setRedirected(true);
        navigate(`/admin/teacher/${id}`, { replace: true });
        return;
      }

      setData(res.data);

      // Fetch joined classes ONLY for students
      if (res.data.user.role === "student") {
        const classRes = await apiAdmin.get(`/admin/students/${id}/classes`);
        setClasses(classRes.data.classes || []);
      }
    } catch (err) {
      console.error(err);
      alert("Access denied");
      navigate("/admin/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (redirected) return null;

  if (loading)
    return (
      <div className="text-center mt-5 fs-5">Loading user details...</div>
    );

  if (!data) return null;

  const { user, activities = [], quizzes = [], notes = [] } = data;

  const roleLabel =
    user.role === "admin"
      ? "🛡️ Admin"
      : user.role === "teacher"
      ? "👨‍🏫 Teacher"
      : "🎓 Student";

  const roleColor =
    user.role === "admin"
      ? "danger"
      : user.role === "teacher"
      ? "warning"
      : "primary";

  const isStudent = user.role === "student";

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">

        {/* ================= HEADER ================= */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">👤 User Details</h3>
            <p className="text-muted mb-0">
              {isStudent ? "Complete academic overview" : "User profile overview"}
            </p>
          </div>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* ================= USER PROFILE ================= */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1 fw-bold">{user.name}</h5>
              <p className="mb-1 text-muted">{user.email}</p>
              <span className={`badge bg-${roleColor}`}>{roleLabel}</span>
            </div>

            <div className="text-end text-muted small">
              Joined on <br />
              <strong>{new Date(user.createdAt).toLocaleDateString()}</strong>
            </div>
          </div>
        </div>

        {/* ================= STUDENT SECTIONS ================= */}
        {isStudent && (
          <>
            {/* ---- AI DATA ---- */}
            <div className="row g-3 mb-4">
              {/* Activities */}
              <div className="col-md-4">
                <div className="card shadow-sm border-0 hover-card h-100">
                  <div className="card-body text-center">
                    <div className="fs-1 mb-2">📘</div>
                    <h6 className="fw-bold">Activities</h6>
                    <p className="fs-4 fw-bold text-primary">{activities.length}</p>
                    <button
                      className="btn btn-outline-primary btn-sm w-100"
                      onClick={() => navigate(`/admin/users/${id}/activities`)}
                    >
                      View Activities
                    </button>
                  </div>
                </div>
              </div>

              {/* Quizzes */}
              <div className="col-md-4">
                <div className="card shadow-sm border-0 hover-card h-100">
                  <div className="card-body text-center">
                    <div className="fs-1 mb-2">📝</div>
                    <h6 className="fw-bold">Quizzes</h6>
                    <p className="fs-4 fw-bold text-success">{quizzes.length}</p>
                    <button
                      className="btn btn-outline-success btn-sm w-100"
                      onClick={() => navigate(`/admin/users/${id}/quizzes`)}
                    >
                      View Quizzes
                    </button>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="col-md-4">
                <div className="card shadow-sm border-0 hover-card h-100">
                  <div className="card-body text-center">
                    <div className="fs-1 mb-2">📒</div>
                    <h6 className="fw-bold">AI Notes</h6>
                    <p className="fs-4 fw-bold text-warning">{notes.length}</p>
                    <button
                      className="btn btn-outline-warning btn-sm w-100"
                      onClick={() => navigate(`/admin/users/${id}/notes`)}
                    >
                      View Notes
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ================= JOINED CLASSES ================= */}
            <div className="mt-4">
              <h5 className="fw-bold mb-3">🏫 Joined Classes</h5>

              {classes.length === 0 ? (
                <div className="text-muted">Student has not joined any class yet.</div>
              ) : (
                <div className="row g-3">
                  {classes.map((cls) => (
                    <div className="col-md-4" key={cls._id}>
                      <div className="card shadow-sm border-0 hover-card h-100">
                        <div className="card-body text-center">
                          <div className="fs-1 mb-2">🏫</div>
                          <h6 className="fw-bold">{cls.name}</h6>
                          <p className="text-muted mb-1">{cls.subject}</p>
                          <small className="text-muted">Teacher: {cls.teacher?.name}</small>

                          {/* ✅ FIXED: navigate to full class dashboard, not just assignments */}
                          <button
                            className="btn btn-outline-primary btn-sm w-100 mt-3"
                            onClick={() => navigate(`/admin/student/class/${cls._id}`)}
                          >
                            View Class
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ================= STYLES ================= */}
      <style>{`
        .hover-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }
      `}</style>
    </div>
  );
}

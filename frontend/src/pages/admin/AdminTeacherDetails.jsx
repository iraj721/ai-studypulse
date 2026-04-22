import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";

export default function AdminTeacherDetails() {
  const { id } = useParams(); // teacher id
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  const fetchTeacherClasses = async () => {
    try {
      const teacherRes = await apiAdmin.get(`/admin/users/${id}`);
      setTeacher(teacherRes.data.user);

      const classesRes = await apiAdmin.get(`/admin/teachers/${id}/classes`);
      setClasses(classesRes.data.classes || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load teacher classes");
      navigate("/admin/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async () => {
    try {
      await apiAdmin.delete(`/admin/users/${id}`);
      alert("Teacher deleted successfully");
      navigate("/admin/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to delete teacher");
    } finally {
      setShowDeleteModal(false);
    }
  };

  if (loading)
    return <div className="text-center mt-5 fs-5">Loading teacher details...</div>;

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        {/* Header - FIXED BUTTONS */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h3 className="fw-bold mb-1">👨‍🏫 Teacher Overview</h3>
            <p className="text-muted mb-0">Classes created by this teacher</p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={() => setShowDeleteModal(true)}
            >
              🗑 Delete Teacher
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate("/admin/dashboard")}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Teacher Profile */}
        {teacher && (
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h5 className="mb-1 fw-bold">{teacher.name}</h5>
                <p className="mb-1 text-muted">{teacher.email}</p>
                <span className="badge bg-warning">👨‍🏫 Teacher</span>
              </div>
              <div className="text-end text-muted small">
                Joined on <br />
                <strong>{new Date(teacher.createdAt).toLocaleDateString()}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Classes */}
        {classes.length === 0 ? (
          <div className="alert alert-info">
            This teacher has not created any classes yet.
          </div>
        ) : (
          <div className="row g-3">
            {classes.map((cls) => (
              <div className="col-md-4 col-sm-6" key={cls._id}>
                <div
                  className="card shadow-sm border-0 hover-card h-100 cursor-pointer"
                  onClick={() => navigate(`/admin/teacher/class/${cls._id}`)}
                >
                  <div className="card-body text-center">
                    <div className="fs-1 mb-2">🏫</div>
                    <h6 className="fw-bold">{cls.name}</h6>
                    <p className="text-muted mb-1">Subject: {cls.subject}</p>
                    <p className="mb-0">
                      Students: <strong>{cls.students?.length || 0}</strong>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal - ADDED */}
      {showDeleteModal && (
        <>
          <div
            className="delete-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              className="delete-modal bg-white rounded-3 shadow-lg"
              style={{ width: "320px", maxWidth: "90%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <h6 className="fw-bold mb-2 text-danger">⚠️ Delete Teacher</h6>
                <p className="mb-3">
                  Are you sure you want to delete <strong>{teacher?.name}</strong>?
                  <br />
                  <span className="text-danger small">
                    This will also delete all their classes and related data.
                  </span>
                </p>
                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={handleDeleteTeacher}
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          <style>{`
            .delete-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0,0,0,0.5);
              z-index: 9999;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .delete-modal {
              animation: fadeInScale 0.2s ease;
            }
            @keyframes fadeInScale {
              from { opacity: 0; transform: scale(0.95); }
              to { opacity: 1; transform: scale(1); }
            }
          `}</style>
        </>
      )}

      {/* Styles */}
      <style>{`
        .hover-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          cursor: pointer;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }
        @media (max-width: 768px) {
          .container { padding-left: 16px; padding-right: 16px; }
          .d-flex.justify-content-between { flex-direction: column; text-align: center; }
          .d-flex.gap-2 { justify-content: center; }
          .row.g-3 { flex-direction: column; }
          .col-md-4.col-sm-6 { width: 100%; }
        }
      `}</style>
    </div>
  );
}
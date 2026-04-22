import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";

export default function AdminTeacherDetails() {
  const { id } = useParams(); // teacher id
  const navigate = useNavigate();

  const [teacher, setTeacher] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherClasses();
    // eslint-disable-next-line
  }, []);

  const fetchTeacherClasses = async () => {
  try {
    // Get teacher info first
    const teacherRes = await apiAdmin.get(`/admin/users/${id}`);
    setTeacher(teacherRes.data.user);

    // Get classes
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


  if (loading)
    return (
      <div className="text-center mt-5 fs-5">
        Loading teacher details...
      </div>
    );

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">👨‍🏫 Teacher Overview</h3>
            <p className="text-muted mb-0">
              Classes created by this teacher
            </p>
          </div>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/admin/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Teacher Profile */}
        {teacher && (
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1 fw-bold">{teacher.name}</h5>
                <p className="mb-1 text-muted">{teacher.email}</p>
                <span className="badge bg-warning">👨‍🏫 Teacher</span>
              </div>

              <div className="text-end text-muted small">
                Joined on <br />
                <strong>
                  {new Date(teacher.createdAt).toLocaleDateString()}
                </strong>
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
              <div className="col-md-4" key={cls._id}>
                <div
                  className="card shadow-sm border-0 hover-card h-100 cursor-pointer"
                  onClick={() =>
                    navigate(`/admin/teacher/class/${cls._id}`)
                  }
                >
                  <div className="card-body text-center">
                    <div className="fs-1 mb-2">🏫</div>
                    <h6 className="fw-bold">{cls.name}</h6>
                    <p className="text-muted mb-1">
                      Subject: {cls.subject}
                    </p>
                    <p className="mb-0">
                      Students:{" "}
                      <strong>{cls.students?.length || 0}</strong>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Hover animation */}
      <style>{`
        .hover-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          cursor: pointer;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }
      `}</style>
    </div>
  );
}

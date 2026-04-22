import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";

export default function AdminTeacherClasses() {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await apiAdmin.get(`/admin/teachers/${teacherId}/classes`);
      setClasses(res.data.classes || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load teacher classes");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading classes...</div>;

  return (
    <div className="container py-5">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      <h2>📘 Teacher's Classes</h2>

      {classes.length === 0 ? (
        <p className="text-muted">No classes created by this teacher.</p>
      ) : (
        <div className="row g-4">
          {classes.map((c) => (
            <div key={c._id} className="col-sm-6 col-lg-4">
              <div
                className="card h-100 border-0 shadow-sm"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/admin/teacher/class/${c._id}`)} // ✅ updated route
              >
                <div className="card-body">
                  <h5>{c.name}</h5>
                  <p className="text-muted">{c.subject}</p>
                  <p className="text-muted small">Students: {c.students.length}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

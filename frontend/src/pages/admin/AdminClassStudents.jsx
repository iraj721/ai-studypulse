import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";

export default function AdminClassStudents() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await apiAdmin.get(`/admin/teacher/classes/${classId}`);
      setStudents(res.data.students || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-5">Loading students...</p>;

  return (
    <div className="container py-5">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      <h3>👨‍🎓 Enrolled Students</h3>

      {students.length === 0 ? (
        <p className="text-muted">No students joined yet.</p>
      ) : (
        <table className="table table-bordered mt-3">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s._id}>
                <td>{i + 1}</td>
                <td>{s.name}</td>
                <td>{s.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

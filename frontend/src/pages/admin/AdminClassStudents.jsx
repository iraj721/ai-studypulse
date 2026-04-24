import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";
import Toast from "../../components/Toast";
import BackButton from "../../components/BackButton";

export default function AdminClassStudents() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await apiAdmin.get(`/admin/teacher/classes/${classId}`);
      const studentsData = res.data.students || res.data || [];
      setStudents(studentsData);
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to load students", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: "", type: "success" })} 
      />
      
      <BackButton to="/admin/dashboard" label="← Back to Dashboard" />

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h3 className="fw-bold mb-1">👨‍🎓 Enrolled Students</h3>
          <p className="text-muted mb-0">Total: {students.length} students</p>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="alert alert-info text-center">No students joined yet.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, i) => (
                <tr key={student._id || i}>
                  <td>{i + 1}</td>
                  <td className="fw-semibold">{student.name || "Unknown"}</td>
                  <td>{student.email || "No email"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => navigate(`/admin/student/${student._id}/class/${classId}`)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .container { padding-left: 16px; padding-right: 16px; }
          .table { font-size: 12px; }
          .btn-sm { padding: 4px 8px; font-size: 11px; }
          .table-responsive { overflow-x: auto; }
        }
      `}</style>
    </div>
  );
}
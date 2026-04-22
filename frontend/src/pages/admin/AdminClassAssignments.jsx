import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";

export default function AdminClassAssignments() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await apiAdmin.get(`/admin/classes/${classId}`); // fetch class full details
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error("❌ API ERROR:", err);
      alert("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading assignments...</div>;

  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      <h2>📝 Assignments</h2>

      {assignments.length === 0 ? (
        <p className="text-muted">No assignments yet.</p>
      ) : (
        assignments.map((a) => (
          <div key={a._id} className="card shadow-sm mb-2 p-3">
            <h5>{a.title}</h5>
            <p>{a.instructions}</p>
            {a.attachment && (
              <button
                className="btn btn-sm btn-outline-primary mb-1"
                onClick={() => window.open(a.attachment, "_blank")}
              >
                📎 View File
              </button>
            )}
            <button
              className="btn btn-sm btn-outline-success"
              onClick={() =>
                navigate(`/admin/assignment/${a._id}/submissions`)
              }
            >
              View Submissions
            </button>
          </div>
        ))
      )}
    </div>
  );
}

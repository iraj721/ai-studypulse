import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";

export default function AdminClassAssignmentSubmissions() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await apiAdmin.get(
        `/admin/assignment/${assignmentId}/submissions`
      );
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      console.error("❌ API ERROR:", err);
      alert("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  // Function to view file in browser using Google Docs Viewer
  const viewFile = (fileUrl) => {
    if (!fileUrl) return;

    const url = fileUrl.startsWith("http")
      ? fileUrl
      : `${import.meta.env.VITE_API_URL}${fileUrl}`;

    const viewer = `https://docs.google.com/viewer?url=${encodeURIComponent(
      url
    )}&embedded=true`;

    window.open(viewer, "_blank");
  };

  if (loading)
    return <div className="text-center mt-5">Loading submissions...</div>;

  return (
    <div className="container mt-4">
      <button
        className="btn btn-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        ⬅ Back
      </button>

      <h2>📝 Submissions</h2>

      {submissions.length === 0 ? (
        <p className="text-muted">No submissions yet.</p>
      ) : (
        submissions.map((s) => (
          <div key={s._id} className="card shadow-sm mb-2 p-3">
            <p>
              <strong>Student:</strong> {s.student.name} ({s.student.email})
            </p>

            {s.file && (
              <button
                className="btn btn-sm btn-outline-primary mb-1"
                onClick={() => viewFile(s.file)}
              >
                📎 View Submitted File
              </button>
            )}

            {s.answerText && (
              <p>
                <strong>Answer:</strong> {s.answerText}
              </p>
            )}

            <small className="text-muted">
              Submitted on {new Date(s.createdAt).toLocaleString()}
            </small>
          </div>
        ))
      )}
    </div>
  );
}

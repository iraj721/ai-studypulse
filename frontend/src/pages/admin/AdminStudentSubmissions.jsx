import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";

export default function AdminStudentSubmissions() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await apiAdmin.get(`/admin/students/${id}/submissions`);
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      console.error(err);
      alert("Unable to load submissions");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5 fs-5">
        Loading submissions...
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">📥 Student Assignment Submissions</h3>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>

        {submissions.length === 0 ? (
          <div className="alert alert-info">
            No assignment submissions found for this student.
          </div>
        ) : (
          <div className="row g-3">
            {submissions.map((sub) => (
              <div className="col-md-6" key={sub._id}>
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <h6 className="fw-bold mb-1">
                      📝 {sub.assignment?.title}
                    </h6>

                    <p className="mb-1 text-muted">
                      Class:{" "}
                      <strong>
                        {sub.assignment?.class?.name}
                      </strong>
                    </p>

                    <p className="mb-1 text-muted">
                      Teacher:{" "}
                      {sub.assignment?.class?.teacher?.name}
                    </p>

                    <p className="mb-2 text-muted">
                      Submitted on:{" "}
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </p>

                    {sub.answerText && (
                      <p className="small">
                        <strong>Answer:</strong> {sub.answerText}
                      </p>
                    )}

                    {sub.file && (
                      <a
                        href={sub.file}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-primary btn-sm mb-2"
                      >
                        View File
                      </a>
                    )}

                    <hr />

                    <p className="mb-1">
                      <strong>Marks:</strong>{" "}
                      {sub.marks !== null ? sub.marks : "Not graded"}
                    </p>

                    {sub.feedback && (
                      <p className="small text-muted">
                        Feedback: {sub.feedback}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

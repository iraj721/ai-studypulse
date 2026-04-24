import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Spinner from "../../components/Spinner";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

export default function AssignmentSubmissions() {
  const { id, assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [marksInput, setMarksInput] = useState({});
  const [marksUploaded, setMarksUploaded] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(
          `/teacher/classes/${id}/assignments/${assignmentId}/submissions`,
        );

        const assignmentData = res.data.assignment || null;
        const submissionsData = Array.isArray(res.data.submissions)
          ? res.data.submissions
          : [];

        setAssignment(assignmentData);
        setSubmissions(submissionsData);

        const input = {};
        const uploaded = {};

        submissionsData.forEach((s) => {
          input[s._id] = s.marks ?? "";
          uploaded[s._id] = s.marks != null;
        });

        setMarksInput(input);
        setMarksUploaded(uploaded);
      } catch (err) {
        console.error(err);
        alert("Failed to load submissions");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, assignmentId]);

  const openFile = (fileUrl) => {
    if (!fileUrl) {
      alert("No file attached");
      return;
    }

    const BASE_URL = (
      import.meta.env.VITE_API_URL || "http://localhost:5000"
    ).replace("/api", "");

    let fullUrl = fileUrl;

    // ✅ Handle Cloudinary URLs
    if (fileUrl.startsWith("http")) {
      fullUrl = fileUrl;
    }
    // ✅ Handle local uploads
    else if (fileUrl.startsWith("uploads/")) {
      fullUrl = `${BASE_URL}/${fileUrl}`;
    }
    // ✅ Handle relative paths
    else {
      fullUrl = `${BASE_URL}/uploads/submissions/${fileUrl.split("/").pop()}`;
    }

    console.log("Opening submission file:", fullUrl);

    // ✅ For PDF and images, open directly
    if (
      fileUrl.toLowerCase().endsWith(".pdf") ||
      fileUrl.match(/\.(jpg|jpeg|png|gif)$/i)
    ) {
      window.open(fullUrl, "_blank");
    } else {
      const viewer = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
      window.open(viewer, "_blank");
    }
  };

  const uploadMarks = async (submissionId) => {
    const total = assignment?.marks ?? 0;
    let marks = Number(marksInput[submissionId]);

    if (marks < 0) marks = 0;
    if (marks > total) marks = total;

    try {
      await api.put(
        `/teacher/classes/${id}/assignments/${assignmentId}/submissions/${submissionId}/marks`,
        { marks },
      );

      setSubmissions((prev) =>
        prev.map((s) => (s._id === submissionId ? { ...s, marks } : s)),
      );

      setMarksUploaded((prev) => ({
        ...prev,
        [submissionId]: true,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Spinner message="Loading submissions..." />;

  return (
    <div className="container py-5">
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate(-1)}
      >
        ⬅ Back
      </button>

      <div
        className="card border-0 mb-4"
        style={{
          background: "linear-gradient(135deg, #598edcff, #4f8cff)",
          color: "#fff",
          boxShadow: "0 10px 25px rgba(13,110,253,0.25)",
        }}
      >
        <div className="card-body d-flex justify-content-between align-items-center">
          <h3 className="fw-bold mb-0">📥 Submissions — {assignment?.title}</h3>
          <span className="badge bg-light text-dark">
            Total Marks: {assignment?.marks ?? 0}
          </span>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="card p-4 text-center text-muted border-0 shadow-sm">
          No submissions yet.
        </div>
      ) : (
        <div className="row g-3">
          {submissions.map((s) => (
            <div key={s._id} className="col-md-6">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <strong>{s.student.name}</strong>
                  <p className="text-muted mb-1">{s.student.email}</p>

                  {s.answerText && <p>{s.answerText}</p>}

                  {s.file && (
                    <button
                      className="btn btn-sm btn-outline-success mb-2"
                      onClick={() => openFile(s.file)}
                    >
                      📄 View Submitted File
                    </button>
                  )}

                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-semibold small">Marks:</span>

                    {marksUploaded[s._id] ? (
                      <>
                        <span className="fw-bold">
                          {s.marks} / {assignment?.marks ?? 0}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() =>
                            setMarksUploaded((p) => ({
                              ...p,
                              [s._id]: false,
                            }))
                          }
                        >
                          Edit
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          style={{ maxWidth: "90px" }}
                          value={marksInput[s._id]}
                          onChange={(e) =>
                            setMarksInput({
                              ...marksInput,
                              [s._id]: e.target.value,
                            })
                          }
                        />
                        <span className="small text-muted">
                          / {assignment?.marks ?? 0}
                        </span>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => uploadMarks(s._id)}
                        >
                          Upload
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .container { padding-left: 16px; padding-right: 16px; }
          .card-body.d-flex { flex-direction: column; text-align: center; gap: 12px; }
          .row.g-3 { flex-direction: column; }
          .row.g-3 .col-md-6 { width: 100%; }
          .d-flex.align-items-center.gap-2 { flex-direction: column; align-items: stretch !important; }
          .d-flex.align-items-center.gap-2 input { max-width: 100% !important; width: 100%; }
          .btn-sm { width: 100%; margin-top: 4px; }
          .card-body { padding: 16px; }
        }
      `}</style>
    </div>
  );
}

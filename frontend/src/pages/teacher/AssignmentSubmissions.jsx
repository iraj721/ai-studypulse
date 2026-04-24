import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Spinner from "../../components/Spinner";
import Toast from "../../components/Toast";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

// ✅ Helper function to get file that opens in browser (not download)
const getFileUrl = (fileUrl) => {
  if (!fileUrl) return null;
  
  // For Cloudinary files - add fl_attachment=0 to force inline display
  if (fileUrl.includes('cloudinary.com')) {
    const separator = fileUrl.includes('?') ? '&' : '?';
    return `${fileUrl}${separator}fl_attachment=0`;
  }
  // For local files
  if (fileUrl.startsWith('http')) {
    return fileUrl;
  }
  if (fileUrl.startsWith('uploads/')) {
    return `${BASE_URL}/${fileUrl}`;
  }
  return `${BASE_URL}/uploads/submissions/${fileUrl.split('/').pop()}`;
};

export default function AssignmentSubmissions() {
  const { id, assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [marksInput, setMarksInput] = useState({});
  const [marksUploaded, setMarksUploaded] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

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
        setToast({ message: "Failed to load submissions", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, assignmentId]);

  // ✅ Updated openFile function - uses helper and opens in browser
  const openFile = (fileUrl) => {
    if (!fileUrl) {
      setToast({ message: "No file attached", type: "error" });
      return;
    }

    const fullUrl = getFileUrl(fileUrl);
    console.log("Opening submission file:", fullUrl);

    // Use Google Docs viewer for all file types for better preview
    const viewer = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
    window.open(viewer, "_blank");
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
      
      setToast({ message: "Marks uploaded successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to upload marks", type: "error" });
    }
  };

  if (loading) return <Spinner message="Loading submissions..." />;

  return (
    <div className="container py-5">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: "", type: "success" })} 
      />

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
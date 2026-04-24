import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import Stars from "../../../components/Stars";
import BackButton from "../../../components/BackButton";
import Toast from "../../../components/Toast";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/api\/?$/, "").replace(/\/$/, "");

export default function StudentAssignments() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get(`/student/classes/${classId}/assignments`);
      setAssignments(res.data || []);
    } catch (err) {
      setToast({ message: "Failed to load assignments", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const submitAssignment = async (id) => {
    if (!answers[id]?.text && !answers[id]?.file) {
      setToast({ message: "Please add answer text or upload a file", type: "error" });
      return;
    }

    const data = new FormData();
    if (answers[id]?.text) data.append("answerText", answers[id].text);
    if (answers[id]?.file) data.append("file", answers[id].file);

    try {
      const response = await api.post(
        `/student/classes/${classId}/assignments/${id}/submit`,
        data,
        { headers: { "Content-Type": "multipart/form-data" }, timeout: 30000 }
      );

      if (response.data.success) {
        setToast({ message: "Assignment submitted successfully!", type: "success" });
        fetchAssignments();
      }
    } catch (err) {
      console.error("Submit error:", err);
      setToast({ message: err.response?.data?.message || "Error submitting assignment", type: "error" });
    }
  };

  const unsendAssignment = async (id) => {
    if (!window.confirm("Are you sure you want to unsend your submission?")) return;
    try {
      await api.delete(`/student/classes/${classId}/assignments/${id}/unsend`);
      setToast({ message: "Submission unsent successfully!", type: "success" });
      fetchAssignments();
    } catch (err) {
      setToast({ message: "Error unsending submission", type: "error" });
    }
  };

  // ✅ Updated openFile function for Cloudinary URLs
  const openFile = (fileUrl) => {
    if (!fileUrl) {
      setToast({ message: "No file attached", type: "error" });
      return;
    }

    let fullUrl = fileUrl;

    // ✅ If it's already a full URL (Cloudinary)
    if (fileUrl.startsWith("http")) {
      fullUrl = fileUrl;
    }
    // ✅ Handle local uploads (fallback)
    else if (fileUrl.startsWith("uploads/")) {
      fullUrl = `${BASE_URL}/${fileUrl}`;
    }
    // ✅ Handle just filename
    else {
      fullUrl = `${BASE_URL}/uploads/submissions/${fileUrl}`;
    }

    console.log("Opening file URL:", fullUrl);
    window.open(fullUrl, "_blank");
  };

  if (loading) return <div className="text-center mt-5 text-white">Loading...</div>;

  return (
    <div className="assignments-bg min-vh-100 position-relative py-5">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container">
        <BackButton to={`/student/class/${classId}`} label="← Back to Class" />
        <h3 className="mb-4 text-white">📝 Assignments</h3>

        {assignments.length === 0 ? (
          <p className="text-light-opacity">No assignments yet.</p>
        ) : (
          assignments.map((a) => {
            const now = new Date();
            const due = a.dueDate ? new Date(a.dueDate) : null;
            const isBeforeDue = due ? now <= due : true;
            const totalMarks = a.marks ?? 0;
            const obtainedMarks = a.submission?.marks != null ? a.submission.marks : null;

            return (
              <div key={a._id} className="assignment-card mb-3 shadow-sm">
                <h5>{a.title}</h5>
                <p>{a.instructions}</p>
                <p className="fw-semibold">Total Marks: {totalMarks}</p>

                {a.attachment && (
                  <button className="btn btn-sm btn-outline-primary mb-2" onClick={() => openFile(a.attachment)}>
                    📎 View Assignment File
                  </button>
                )}

                {a.submitted ? (
                  <>
                    <p className="text-success">✅ Submitted</p>
                    {obtainedMarks != null ? (
                      <p className="fw-bold text-primary">Marks: {obtainedMarks} / {totalMarks}</p>
                    ) : (
                      <p className="text-light-opacity">Marks not graded yet</p>
                    )}
                    {a.submission?.file && (
                      <button className="btn btn-sm btn-success mb-2" onClick={() => openFile(a.submission.file)}>
                        View My Submission
                      </button>
                    )}
                    {a.submission?.answerText && <p>{a.submission.answerText}</p>}
                    {isBeforeDue && (
                      <button className="btn btn-sm btn-danger" onClick={() => unsendAssignment(a._id)}>Unsend</button>
                    )}
                  </>
                ) : (
                  <>
                    {isBeforeDue ? (
                      <>
                        <textarea className="form-control mb-2" placeholder="Your answer"
                          onChange={(e) => setAnswers({ ...answers, [a._id]: { ...answers[a._id], text: e.target.value } })} />
                        <input type="file" className="form-control mb-2"
                          onChange={(e) => setAnswers({ ...answers, [a._id]: { ...answers[a._id], file: e.target.files[0] } })} />
                        <button className="btn btn-success" onClick={() => submitAssignment(a._id)}>Submit</button>
                      </>
                    ) : (
                      <p className="text-danger">❌ Submission closed</p>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      <style>{`
        .assignments-bg {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #5a77a3 100%);
        }
        .text-light-opacity { color: rgba(255,255,255,0.8); }
        .assignment-card {
          border-radius: 16px;
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
          color: black;
          padding: 20px;
          transition: all 0.3s;
        }
        .assignment-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
        @media (max-width: 768px) {
          .assignment-card { padding: 16px; }
          .form-control, input[type="file"] { font-size: 13px; }
          .btn-success, .btn-danger { width: 100%; margin-top: 8px; }
        }
      `}</style>
    </div>
  );
}
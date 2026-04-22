// src/pages/StudentAssignments.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import Stars from "../../../components/Stars";

const BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");

export default function StudentAssignments() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get(`/student/classes/${classId}/assignments`);
      setAssignments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const submitAssignment = async (id) => {
    const data = new FormData();
    if (answers[id]?.text) data.append("answerText", answers[id].text);
    if (answers[id]?.file) data.append("file", answers[id].file);

    try {
      await api.post(
        `/student/classes/${classId}/assignments/${id}/submit`,
        data
      );
      fetchAssignments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error submitting assignment");
    }
  };

  const unsendAssignment = async (id) => {
    if (!window.confirm("Are you sure you want to unsend your submission?"))
      return;
    try {
      await api.delete(
        `/student/classes/${classId}/assignments/${id}/unsend`
      );
      fetchAssignments();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error unsending submission");
    }
  };

  const openFile = (fileUrl) => {
    if (!fileUrl) return;
    const url = fileUrl.startsWith("http") ? fileUrl : `${BASE_URL}${fileUrl}`;
    const viewer = `https://docs.google.com/viewer?url=${encodeURIComponent(
      url
    )}&embedded=true`;
    window.open(viewer, "_blank");
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="assignments-bg min-vh-100 position-relative py-5">
      <Stars />
      <div className="container mt-4">
        <button onClick={() => navigate(-1)} className="btn btn-secondary mb-3">
          ⬅ Back
        </button>

        {assignments.length === 0 ? (
          <p className="text-light-opacity">No assignments yet.</p>
        ) : (
          assignments.map((a) => {
            const now = new Date();
            const due = a.dueDate ? new Date(a.dueDate) : null;
            const isBeforeDue = due ? now <= due : true;

            const totalMarks = a.marks ?? 0;
            const obtainedMarks =
              a.submission && a.submission.marks != null
                ? a.submission.marks
                : null;

            return (
              <div key={a._id} className="assignment-card mb-3 shadow-sm">
                <h5>{a.title}</h5>
                <p>{a.instructions}</p>

                {/* Total Marks */}
                <p className="fw-semibold text-light-opacity">Total Marks: {totalMarks}</p>

                {a.attachment && (
                  <button
                    className="btn btn-sm btn-outline-primary mb-2"
                    onClick={() => openFile(a.attachment)}
                  >
                    View Assignment File
                  </button>
                )}

                {a.submitted ? (
                  <>
                    <p className="text-success">✅ Submitted</p>

                    {obtainedMarks != null ? (
                      <p className="fw-bold text-primary">
                        Marks: {obtainedMarks} / {totalMarks}
                      </p>
                    ) : (
                      <p className="text-light-opacity">Marks not graded yet</p>
                    )}

                    {a.submission?.file && (
                      <button
                        className="btn btn-sm btn-success mb-2"
                        onClick={() => openFile(a.submission.file)}
                      >
                        View My Submission
                      </button>
                    )}

                    {a.submission?.answerText && <p>{a.submission.answerText}</p>}

                    {isBeforeDue ? (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => unsendAssignment(a._id)}
                      >
                        Unsend
                      </button>
                    ) : (
                      <p className="text-light-opacity">Submission closed.</p>
                    )}
                  </>
                ) : (
                  <>
                    {isBeforeDue ? (
                      <>
                        <textarea
                          className="form-control mb-2"
                          placeholder="Your answer"
                          onChange={(e) =>
                            setAnswers({
                              ...answers,
                              [a._id]: {
                                ...answers[a._id],
                                text: e.target.value,
                              },
                            })
                          }
                        />
                        <input
                          type="file"
                          className="form-control mb-2"
                          onChange={(e) =>
                            setAnswers({
                              ...answers,
                              [a._id]: {
                                ...answers[a._id],
                                file: e.target.files[0],
                              },
                            })
                          }
                        />
                        <button
                          className="btn btn-success"
                          onClick={() => submitAssignment(a._id)}
                        >
                          Submit
                        </button>
                      </>
                    ) : (
                      <p className="text-danger">❌ Submission closed.</p>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* STYLES */}
      <style>{`
        .assignments-bg {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #5a77a3 100%);
          position: relative;
          overflow: hidden;
        }
        .text-light-opacity { color: rgba(255,255,255,0.7); }
        .assignment-card {
          border-radius: 16px;
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
          color: black;
          padding: 16px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .assignment-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        .assignment-card p,
        .assignment-card small {
          color: #000000ff;
        }
        .btn-outline-primary {
          color: #00bfff;
          border-color: #00bfff;
        }
        .btn-outline-primary:hover {
          background-color: #00bfff;
          color: #fff;
        }
      `}</style>
    </div>
  );
}

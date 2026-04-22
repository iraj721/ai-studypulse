// src/pages/StudentClassDashboard.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import Stars from "../../../components/Stars";

export default function StudentClassDashboard() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [classInfo, setClassInfo] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [answers, setAnswers] = useState({});
  const [replyTexts, setReplyTexts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [classRes, assignmentsRes, announcementsRes, materialsRes] =
        await Promise.all([
          api.get(`/student/classes/${classId}`),
          api.get(`/student/classes/${classId}/assignments`),
          api.get(`/student/classes/${classId}/announcements`),
          api.get(`/student/classes/${classId}/materials`),
        ]);

      setClassInfo(classRes.data);
      setAssignments(assignmentsRes.data);
      setAnnouncements(announcementsRes.data);
      setMaterials(materialsRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
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
      fetchDashboard();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error submitting assignment");
    }
  };

  const unsendAssignment = async (id) => {
    if (!window.confirm("Are you sure you want to unsend your submission?"))
      return;
    try {
      await api.delete(`/student/classes/${classId}/assignments/${id}/unsend`);
      fetchDashboard();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error unsending submission");
    }
  };

  const submitReply = async (announcementId) => {
    const text = replyTexts[announcementId]?.trim();
    if (!text) return;

    try {
      await api.post(
        `/student/classes/${classId}/announcements/${announcementId}/reply`,
        { text }
      );
      setReplyTexts({ ...replyTexts, [announcementId]: "" });
      fetchDashboard();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error submitting reply");
    }
  };

  const openFile = (fileUrl) => {
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
    return <div className="text-center mt-5 text-white">Loading...</div>;

  return (
    <div className="dashboard-bg min-vh-100 py-5 position-relative">
      <Stars />
      <div className="container">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-outline-light mb-3"
        >
          ⬅ Back
        </button>

        <h2 className="text-white fw-bold">{classInfo?.name}</h2>
        <p className="text-light-opacity">
          Teacher: {classInfo?.teacher?.name}
        </p>

        {/* TOP 3 CARDS */}
        <div className="row g-3 my-4">
          <div className="col-md-4">
            <div
              className="top-cards p-4 shadow-lg text-center"
              onClick={() => navigate(`/student/class/${classId}/assignments`)}
            >
              <h4>📝 Assignments</h4>
              <p>{assignments.length} total</p>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="top-cards p-4 shadow-lg text-center"
              onClick={() =>
                navigate(`/student/class/${classId}/announcements`)
              }
            >
              <h4>📢 Announcements</h4>
              <p>{announcements.length} total</p>
            </div>
          </div>
          <div className="col-md-4">
            <div
              className="top-cards p-4 shadow-lg text-center"
              onClick={() => navigate(`/student/class/${classId}/materials`)}
            >
              <h4>📂 Materials</h4>
              <p>{materials.length} total</p>
            </div>
          </div>
        </div>

        {/* MATERIALS */}
        <h4 className="mt-4 text-white">📂 Materials</h4>
        {materials.length === 0 ? (
          <p className="text-light-opacity">No materials yet.</p>
        ) : (
          materials.map((m) => (
            <div key={m._id} className="dashboard-card mb-3 p-4 shadow-sm">
              <h5>{m.title}</h5>
              {m.content && (
                <p className="text-light-opacity mb-2">{m.content}</p>
              )}

              {m.fileUrl && (
                <div className="mb-2">
                  <button
                    className="btn btn-sm btn-outline-gradient"
                    onClick={() => openFile(m.fileUrl)}
                  >
                    📎 View File
                  </button>
                </div>
              )}

              <small className="text-light-opacity d-block">
                Posted by {m.teacher?.name} on{" "}
                {new Date(m.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        )}

        {/* ANNOUNCEMENTS */}
        <h4 className="mt-4 text-white">📢 Announcements</h4>
        {announcements.length === 0 ? (
          <p className="text-light-opacity">No announcements yet.</p>
        ) : (
          announcements.map((a) => (
            <div key={a._id} className="dashboard-card mb-3 p-3">
              <p>{a.text}</p>
              {a.attachment && (
                <button
                  className="btn btn-sm btn-outline-gradient mb-2"
                  onClick={() => openFile(a.attachment)}
                >
                  📎 View Attachment
                </button>
              )}
              <small className="text-light-opacity">
                Posted on {new Date(a.createdAt).toLocaleString()}
              </small>

              {/* Replies */}
              <div className="mt-2 ps-3 border-start border-light">
                {a.replies && a.replies.length > 0 && (
                  <div className="mb-2">
                    <strong className="text-white">Replies:</strong>
                    {a.replies.map((r, i) => (
                      <div key={i} className="mb-1">
                        <small className="text-primary">{r.studentName}:</small>{" "}
                        <span className="text-white">{r.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="d-flex gap-2">
                  <input
                    type="text"
                    className="form-control form-control-sm bg-dark text-white"
                    placeholder="Reply..."
                    value={replyTexts[a._id] || ""}
                    onChange={(e) =>
                      setReplyTexts({ ...replyTexts, [a._id]: e.target.value })
                    }
                  />
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => submitReply(a._id)}
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* ASSIGNMENTS */}
        <h4 className="mt-4 text-white">📝 Assignments</h4>
        {assignments.length === 0 ? (
          <p className="text-light-opacity">No assignments yet.</p>
        ) : (
          assignments.map((a) => {
            const now = new Date();
            const due = a.dueDate ? new Date(a.dueDate) : null;
            const isBeforeDue = due ? now <= due : true;

            return (
              <div key={a._id} className="dashboard-card mb-3 p-3">
                <h5>{a.title}</h5>
                <p className="text-light-opacity">{a.instructions}</p>

                {a.marks != null && (
                  <p className="fw-semibold text-light-opacity mb-1">
                    Total Marks: {a.marks}
                  </p>
                )}

                {a.attachment && (
                  <button
                    className="btn btn-sm btn-outline-gradient mb-1"
                    onClick={() => openFile(a.attachment)}
                  >
                    📎 View Assignment File
                  </button>
                )}

                {a.submitted ? (
                  <>
                    <p className="text-success">✅ Submitted</p>
                    {a.submission?.marks != null ? (
                      <p className="fw-semibold text-success">
                        Marks Obtained: {a.submission.marks} / {a.marks}
                      </p>
                    ) : (
                      <p className="text-light-opacity">
                        Marks not uploaded yet
                      </p>
                    )}
                    {a.submission?.file && (
                      <button
                        className="btn btn-sm btn-success mb-1"
                        onClick={() => openFile(a.submission.file)}
                      >
                        View My Submission
                      </button>
                    )}
                    {a.submission?.answerText && (
                      <p>{a.submission.answerText}</p>
                    )}
                    {isBeforeDue && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => unsendAssignment(a._id)}
                      >
                        Unsend
                      </button>
                    )}
                    {!isBeforeDue && (
                      <p className="text-light-opacity">Submission closed.</p>
                    )}
                  </>
                ) : (
                  <>
                    {isBeforeDue ? (
                      <>
                        <textarea
                          className="form-control mb-1 bg-dark text-white"
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
                          className="form-control mb-1 bg-dark text-white"
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
                          className="btn btn-gradient btn-sm"
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

      <style>{`
        .dashboard-bg {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%);
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          color: #fff;
        }
          .top-cards{
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
          color: black;
          border-radius: 16px;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
          }
        .dashboard-card {
          background: rgba(24, 34, 52, 0.85);
          color: #fff;
          border-radius: 16px;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 25px rgba(0,0,0,0.3);
        }
        .text-light-opacity { color: rgba(255,255,255,0.7); }
        .border-light { border-color: rgba(255,255,255,0.3) !important; }
        .btn-outline-light { color: #fff; border-color: rgba(255,255,255,0.5); }
        .btn-outline-light:hover { color: #fff; border-color: #fff; background: rgba(255,255,255,0.1); }
        .btn-gradient {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          color: white;
          font-weight: 600;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .btn-gradient:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 12px 25px rgba(0,0,0,0.25);
          background: linear-gradient(135deg, #5b4be8, #7b66f3);
        }
        .btn-outline-gradient {
          color: #fff;
          border-color: rgba(255,255,255,0.5);
        }
        .btn-outline-gradient:hover {
          background: rgba(255,255,255,0.1);
          border-color: #fff;
          color: #fff;
        }
      `}</style>
    </div>
  );
}

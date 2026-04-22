import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Toast from "../../components/Toast";
import Spinner from "../../components/Spinner";
import CardWrapper from "../../components/CardWrapper";

export default function ClassAnnouncements() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [className, setClassName] = useState("");
  const [text, setText] = useState("");
  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [modal, setModal] = useState({ show: false, type: "", announcement: null, newText: "" });
  const [repliesOpen, setRepliesOpen] = useState({});
  const [replyText, setReplyText] = useState({}); // store teacher replies per announcement

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [annRes, classRes, userRes] = await Promise.all([
        api.get(`/teacher/classes/${id}/announcements`),
        api.get(`/teacher/classes/${id}`),
        api.get("/auth/me"),
      ]);

      setAnnouncements(annRes.data || []);
      setClassName(classRes.data.name);
      setUserRole(userRes.data.role);
    } catch (err) {
      console.error(err);
      setToast("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async () => {
    if (!text.trim()) return setToast("Announcement text required");

    try {
      await api.post(`/teacher/classes/${id}/announcement`, { text });
      setText("");
      setToast("Announcement posted successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      setToast("Failed to post announcement");
    }
  };

  const deleteAnnouncement = async (ann) => {
    try {
      await api.delete(`/teacher/classes/${id}/announcement/${ann._id}`);
      setToast("Announcement deleted successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      setToast("Failed to delete announcement");
    } finally {
      setModal({ show: false, type: "", announcement: null, newText: "" });
    }
  };

  const editAnnouncement = async () => {
    try {
      await api.put(`/teacher/classes/${id}/announcement/${modal.announcement._id}`, { text: modal.newText });
      setToast("Announcement updated successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      setToast("Failed to update announcement");
    } finally {
      setModal({ show: false, type: "", announcement: null, newText: "" });
    }
  };

  // Teacher reply to a student
  const sendReply = async (announcementId) => {
    if (!replyText[announcementId]?.trim()) return setToast("Reply cannot be empty");

    try {
      await api.post(`/teacher/classes/${id}/announcement/${announcementId}/reply`, {
        text: replyText[announcementId],
      });
      setReplyText({ ...replyText, [announcementId]: "" });
      fetchData();
    } catch (err) {
      console.error(err);
      setToast("Failed to send reply");
    }
  };

  if (loading) return <Spinner message="Loading announcements..." />;

  const isTeacher = userRole === "teacher";

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentAnnouncements = announcements.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(announcements.length / itemsPerPage);

  return (
    <div className="container py-5 position-relative">
      <Toast message={toast} onClose={() => setToast("")} />

      {/* Back Button */}
      <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      {/* Header */}
      <div
        className="card border-0 mb-4"
        style={{
          background: "linear-gradient(135deg, #598edcff, #4f8cff)",
          color: "#fff",
          boxShadow: "0 10px 25px rgba(13,110,253,0.25)",
        }}
      >
        <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            <h3 className="fw-bold mb-1">📢 Announcements — {className}</h3>
            <p className="mb-0 opacity-75">
              Total: <span className="fw-semibold">{announcements.length}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Teacher Create Announcement */}
      {isTeacher && (
        <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: "12px" }}>
          <div className="card-body d-flex flex-column gap-2">
            <textarea
              className="form-control shadow-sm"
              placeholder="Write an announcement..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ borderRadius: "8px", minHeight: "80px" }}
            />
            <button className="btn btn-primary align-self-end" onClick={createAnnouncement}>
              Post Announcement
            </button>
          </div>
        </div>
      )}

      {/* Previous Announcements */}
      {currentAnnouncements.length === 0 ? (
        <div className="card p-4 text-center text-muted border-0 shadow-sm">
          No announcements yet.
        </div>
      ) : (
        currentAnnouncements.map((a) => (
          <CardWrapper
            key={a._id}
            className="card mb-3 shadow-sm border-0"
            style={{
              borderRadius: "12px",
              transition: "transform 0.25s ease, box-shadow 0.25s ease",
              cursor: "default",
            }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="mb-1">{a.text}</p>
                  <small className="text-muted">{new Date(a.createdAt).toLocaleString()}</small>

                  {/* Replies */}
                  {a.replies?.length > 0 && (
                    <div className="mt-2">
                      <button
                        className="btn btn-sm btn-outline-secondary mb-1"
                        onClick={() =>
                          setRepliesOpen({ ...repliesOpen, [a._id]: !repliesOpen[a._id] })
                        }
                      >
                        {repliesOpen[a._id] ? "Hide Replies" : `View Replies (${a.replies.length})`}
                      </button>
                      {repliesOpen[a._id] &&
                        a.replies.map((r, i) => (
                          <div
                            key={i}
                            className="card mt-1 p-2"
                            style={{ backgroundColor: "#f8f9fa", fontSize: "0.9rem" }}
                          >
                            <strong>{r.studentName || r.teacherName}</strong>: {r.text}{" "}
                            <small className="text-muted">
                              ({new Date(r.createdAt).toLocaleString()})
                            </small>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Teacher reply input */}
                  {isTeacher && (
                    <div className="mt-2 d-flex gap-2">
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Write a reply..."
                        value={replyText[a._id] || ""}
                        onChange={(e) => setReplyText({ ...replyText, [a._id]: e.target.value })}
                      />
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => sendReply(a._id)}
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </div>

                {isTeacher && (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        setModal({ show: true, type: "edit", announcement: a, newText: a.text })
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setModal({ show: true, type: "delete", announcement: a })}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardWrapper>
        ))
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2 py-3">
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            ⬅ Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-outline-secondary btn-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next ➡
          </button>
        </div>
      )}

      {/* Modal for Edit/Delete */}
      {modal.show && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.4)", zIndex: 1050 }}
        >
          <div className="card p-4" style={{ maxWidth: "400px", borderRadius: "12px" }}>
            {modal.type === "delete" && (
              <>
                <h5 className="mb-3">Confirm Delete</h5>
                <p>Are you sure you want to delete this announcement?</p>
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setModal({ show: false, type: "", announcement: null, newText: "" })}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={() => deleteAnnouncement(modal.announcement)}>
                    Delete
                  </button>
                </div>
              </>
            )}
            {modal.type === "edit" && (
              <>
                <h5 className="mb-3">Edit Announcement</h5>
                <textarea
                  className="form-control mb-3"
                  value={modal.newText}
                  onChange={(e) => setModal({ ...modal, newText: e.target.value })}
                  style={{ minHeight: "80px" }}
                />
                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setModal({ show: false, type: "", announcement: null, newText: "" })}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={editAnnouncement}>
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

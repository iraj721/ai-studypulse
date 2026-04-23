import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import Stars from "../../../components/Stars";
import BackButton from "../../../components/BackButton";
import Toast from "../../../components/Toast";

export default function StudentAnnouncements() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [replyTexts, setReplyTexts] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get(`/student/classes/${classId}/announcements`);
      setAnnouncements(res.data);
    } catch (err) {
      setToast({ message: "Failed to load announcements", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const submitReply = async (announcementId) => {
    const text = replyTexts[announcementId]?.trim();
    if (!text) {
      setToast({ message: "Reply cannot be empty", type: "error" });
      return;
    }

    try {
      await api.post(`/student/classes/${classId}/announcements/${announcementId}/reply`, { text });
      setReplyTexts({ ...replyTexts, [announcementId]: "" });
      setToast({ message: "Reply sent successfully!", type: "success" });
      fetchAnnouncements();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Error submitting reply", type: "error" });
    }
  };

  const openFile = (fileUrl) => {
    if (!fileUrl) return;
    const url = fileUrl.startsWith("http") ? fileUrl : `${import.meta.env.VITE_API_URL}${fileUrl}`;
    const viewer = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    window.open(viewer, "_blank");
  };

  if (loading) return <div className="text-center mt-5 text-white">Loading...</div>;

  return (
    <div className="announcements-bg min-vh-100 position-relative py-5">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container">
        <BackButton to={`/student/class/${classId}`} label="← Back to Class" />

        <h3 className="mb-4 text-white">📢 Announcements</h3>

        {announcements.length === 0 ? (
          <div className="text-light-opacity">No announcements yet.</div>
        ) : (
          announcements.map((a) => (
            <div key={a._id} className="announcement-card mb-3 shadow-sm">
              <p className="fw-bold">{a.text}</p>
              {a.attachment && (
                <button className="btn btn-sm btn-outline-primary mb-2" onClick={() => openFile(a.attachment)}>
                  📎 View Attachment
                </button>
              )}
              <small>By {a.teacher.name} on {new Date(a.createdAt).toLocaleString()}</small>

              {/* Replies */}
              <div className="mt-3 ps-3 border-start border-secondary">
                {a.replies && a.replies.length > 0 && (
                  <div className="mb-2">
                    <i>Replies:</i>
                    {a.replies.map((r, i) => (
                      <div key={i} className="mb-1">
                        <small className="text-success">{r.studentName}:</small> {r.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                <div className="d-flex gap-2 mt-2">
                  <input type="text" className="form-control form-control-sm" placeholder="Reply..."
                    value={replyTexts[a._id] || ""}
                    onChange={(e) => setReplyTexts({ ...replyTexts, [a._id]: e.target.value })} />
                  <button className="btn btn-sm btn-success" onClick={() => submitReply(a._id)}>Reply</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .announcements-bg {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #5a77a3 100%);
        }
        .text-light-opacity { color: rgba(255,255,255,0.8); }
        .announcement-card {
          border-radius: 16px;
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
          color: black;
          padding: 20px;
          transition: all 0.3s;
        }
        .announcement-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
        @media (max-width: 768px) {
          .announcement-card { padding: 16px; }
          .d-flex.gap-2 { flex-direction: column; }
          .d-flex.gap-2 input, .d-flex.gap-2 button { width: 100%; }
          .border-start { padding-left: 12px; }
        }
      `}</style>
    </div>
  );
}
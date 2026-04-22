// src/pages/StudentAnnouncements.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import Stars from "../../../components/Stars";

export default function StudentAnnouncements() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [replyTexts, setReplyTexts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get(`/student/classes/${classId}/announcements`);
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load announcements");
    } finally {
      setLoading(false);
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
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error submitting reply");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="announcements-bg min-vh-100 position-relative py-5">
      <Stars />
      <div className="container mt-4">
        <button onClick={() => navigate(-1)} className="btn btn-secondary mb-3">
          ⬅ Back
        </button>

        <h3 className="mb-4 text-light">📢 Announcements</h3>

        {announcements.length === 0 ? (
          <div className="text-light-opacity">No announcements yet.</div>
        ) : (
          announcements.map((a) => (
            <div key={a._id} className="announcement-card mb-3 shadow-sm">
              <p className="fw-bold">{a.text}</p>
              {a.attachment && (
                <button
                  className="btn btn-sm btn-outline-primary mb-2"
                  onClick={() =>
                    window.open(
                      `${import.meta.env.VITE_API_URL}${a.attachment}`,
                      "_blank"
                    )
                  }
                >
                  📎 View Attachment
                </button>
              )}
              <small>
                By {a.teacher.name} on {new Date(a.createdAt).toLocaleString()}
              </small>

              {/* Replies */}
              <div className="mt-3 ps-3 border-start border-secondary">
                {a.replies && a.replies.length > 0 && (
                  <div className="mb-2">
                    <i>Replies:</i>
                    {a.replies.map((r, i) => (
                      <div key={i} className="mb-1">
                        <small className="text-success">{r.studentName}:</small>{" "}
                        {r.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                <div className="d-flex gap-2 mt-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
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
      </div>

      {/* STYLES */}
      <style>{`
        .announcements-bg {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #5a77a3 100%);
          position: relative;
          overflow: hidden;
        }
        .text-light-opacity { color: rgba(255,255,255,0.7); }
        .announcement-card {
          border-radius: 16px;
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
          color: black;
          transition: transform 0.2s, box-shadow 0.2s;
          padding: 16px;
        }
        .announcement-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }
        .announcement-card p,
        .announcement-card small {
          color: #000000ff;
        }
        .border-start {
          border-left: 3px solid rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  );
}

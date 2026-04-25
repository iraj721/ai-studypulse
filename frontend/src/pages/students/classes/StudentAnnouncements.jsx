import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import Toast from "../../../components/Toast";
import { 
  FaArrowLeft, FaBullhorn, FaPaperPlane, FaEye, 
  FaCalendarAlt, FaUserCircle
} from "react-icons/fa";

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

  if (loading) {
    return (
      <div className="ann-loading">
        <div className="ann-spinner"></div>
        <p>Loading announcements...</p>
      </div>
    );
  }

  return (
    <div className="ann-root">
      {/* Background */}
      <div className="ann-bg" />
      <div className="ann-grid" />
      <div className="ann-orb ann-orb-a" />
      <div className="ann-orb ann-orb-b" />

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      {/* Main Content */}
      <main className="ann-main">
        <div className="ann-container">
          {/* Back Button */}
          <button className="ann-back" onClick={() => navigate(`/student/class/${classId}`)}>
            <FaArrowLeft /> Back to Class
          </button>

          {/* Header */}
          <div className="ann-header">
            <div className="ann-header-icon">
              <FaBullhorn />
            </div>
            <div>
              <h1 className="ann-title">Class <span className="ann-grad">Announcements</span></h1>
              <p className="ann-subtitle">Stay updated with important announcements from your teacher</p>
            </div>
          </div>

          {/* Announcements List */}
          {announcements.length === 0 ? (
            <div className="ann-empty">
              <div className="ann-empty-icon">📢</div>
              <h3>No Announcements Yet</h3>
              <p>Your teacher hasn't posted any announcements yet. Check back later!</p>
            </div>
          ) : (
            <div className="ann-list">
              {announcements.map((announcement) => (
                <div key={announcement._id} className="ann-card">
                  <div className="ann-card-header">
                    <div className="ann-teacher-info">
                      <div className="ann-teacher-avatar">
                        <FaUserCircle />
                      </div>
                      <div>
                        <div className="ann-teacher-name">{announcement.teacher?.name}</div>
                        <div className="ann-date">
                          <FaCalendarAlt /> {new Date(announcement.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ann-card-body">
                    <p className="ann-message">{announcement.text}</p>
                    {announcement.attachment && (
                      <button className="ann-attachment-btn" onClick={() => openFile(announcement.attachment)}>
                        <FaEye /> View Attachment
                      </button>
                    )}
                  </div>

                  {/* Replies Section */}
                  {announcement.replies && announcement.replies.length > 0 && (
                    <div className="ann-replies">
                      <div className="ann-replies-title">
                        Replies ({announcement.replies.length})
                      </div>
                      <div className="ann-replies-list">
                        {announcement.replies.map((reply, idx) => (
                          <div key={idx} className="ann-reply-item">
                            <span className="ann-reply-author">{reply.studentName}</span>
                            <span className="ann-reply-text">{reply.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reply Form */}
                  <div className="ann-reply-form">
                    <input
                      type="text"
                      className="ann-reply-input"
                      placeholder="Write a reply..."
                      value={replyTexts[announcement._id] || ""}
                      onChange={(e) => setReplyTexts({ ...replyTexts, [announcement._id]: e.target.value })}
                      onKeyPress={(e) => e.key === "Enter" && submitReply(announcement._id)}
                    />
                    <button className="ann-reply-btn" onClick={() => submitReply(announcement._id)}>
                      <FaPaperPlane /> Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .ann-root {
          --bg: #0a0c12;
          --surface: #111318;
          --border: rgba(88, 130, 255, 0.12);
          --border-h: rgba(88, 130, 255, 0.28);
          --accent: #5882ff;
          --accent2: #20e6d0;
          --violet: #9b7aff;
          --text: #edf2ff;
          --muted: #8e9cc4;
          --faint: #49587a;
          --fd: 'Syne', sans-serif;
          --fb: 'Inter', sans-serif;
          --success: #10b981;
        }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .ann-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }

        .ann-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background */
        .ann-bg {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.08) 0%, transparent 60%);
        }
        .ann-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image: linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .ann-orb {
          position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .ann-orb-a { width: 400px; height: 400px; top: -100px; left: 50%; transform: translateX(-50%); background: rgba(88, 130, 255, 0.06); animation: orbFloat 12s infinite; }
        .ann-orb-b { width: 250px; height: 250px; bottom: 10%; right: -5%; background: rgba(32, 230, 208, 0.04); animation: orbFloat2 10s infinite; }
        @keyframes orbFloat { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.1); } }
        @keyframes orbFloat2 { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }

        /* Loading */
        .ann-loading {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: #0a0c12;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .ann-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(88, 130, 255, 0.2);
          border-top-color: #5882ff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ann-loading p { margin-top: 15px; color: #8e9cc4; }

        /* Main Content */
        .ann-main {
          position: relative;
          z-index: 10;
          max-width: 900px;
          margin: 0 auto;
          padding: 90px 2rem 3rem;
          min-height: 100vh;
        }

        /* Back Button */
        .ann-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(88, 130, 255, 0.1);
          border: 1px solid var(--border);
          color: var(--accent);
          padding: 8px 20px;
          border-radius: 40px;
          font-size: 0.85rem;
          cursor: pointer;
          margin-bottom: 1.5rem;
          transition: all 0.2s;
        }
        .ann-back:hover {
          background: rgba(88, 130, 255, 0.2);
          transform: translateX(-4px);
        }

        /* Header */
        .ann-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .ann-header-icon {
          width: 60px;
          height: 60px;
          background: rgba(88, 130, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          color: var(--accent);
        }
        .ann-title {
          font-family: var(--fd);
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .ann-subtitle {
          color: var(--muted);
          font-size: 0.85rem;
        }

        /* Empty State */
        .ann-empty {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(17, 19, 24, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 24px;
        }
        .ann-empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
        .ann-empty h3 { margin-bottom: 0.5rem; color: var(--text); }
        .ann-empty p { color: var(--muted); }

        /* Announcements List */
        .ann-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .ann-card {
          background: rgba(17, 19, 24, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1.5rem;
          transition: all 0.3s;
        }
        .ann-card:hover {
          border-color: var(--border-h);
          transform: translateY(-2px);
        }
        .ann-card-header {
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .ann-teacher-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ann-teacher-avatar {
          font-size: 2rem;
          color: var(--accent);
        }
        .ann-teacher-name {
          font-weight: 600;
          font-size: 0.9rem;
        }
        .ann-date {
          font-size: 0.7rem;
          color: var(--faint);
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .ann-card-body {
          margin-bottom: 1rem;
        }
        .ann-message {
          font-size: 1rem;
          line-height: 1.5;
          margin-bottom: 1rem;
          white-space: pre-wrap;
        }
        .ann-attachment-btn {
          background: rgba(88, 130, 255, 0.1);
          border: 1px solid var(--border);
          color: var(--accent);
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 0.75rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .ann-attachment-btn:hover {
          background: rgba(88, 130, 255, 0.2);
        }

        /* Replies Section */
        .ann-replies {
          background: rgba(255,255,255,0.02);
          border-radius: 16px;
          padding: 1rem;
          margin: 1rem 0;
        }
        .ann-replies-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent);
          margin-bottom: 0.75rem;
        }
        .ann-replies-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .ann-reply-item {
          font-size: 0.85rem;
          padding: 6px 0;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .ann-reply-author {
          font-weight: 600;
          color: var(--accent2);
          margin-right: 10px;
        }
        .ann-reply-text {
          color: var(--muted);
        }

        /* Reply Form */
        .ann-reply-form {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .ann-reply-input {
          flex: 1;
          padding: 10px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 40px;
          color: var(--text);
          font-size: 0.85rem;
          transition: all 0.2s;
        }
        .ann-reply-input:focus {
          outline: none;
          border-color: var(--accent);
          background: rgba(88, 130, 255, 0.05);
        }
        .ann-reply-input::placeholder {
          color: var(--faint);
        }
        .ann-reply-btn {
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          border: none;
          color: white;
          padding: 8px 20px;
          border-radius: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s;
        }
        .ann-reply-btn:hover {
          transform: translateY(-2px);
          opacity: 0.9;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .ann-main { padding: 80px 1rem 2rem; }
          .ann-header { flex-direction: column; text-align: center; }
          .ann-title { font-size: 1.5rem; }
          .ann-header-icon { width: 50px; height: 50px; font-size: 1.5rem; }
          .ann-card { padding: 1rem; }
          .ann-teacher-info { flex-wrap: wrap; }
          .ann-reply-form { flex-direction: column; }
          .ann-reply-btn { justify-content: center; }
          .ann-back { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
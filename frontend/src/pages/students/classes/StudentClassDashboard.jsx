import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import Toast from "../../../components/Toast";
import { 
  FaArrowLeft, FaBookOpen, FaBullhorn, FaFolderOpen, 
  FaFileAlt, FaUsers, FaCalendarAlt, FaChalkboardTeacher,
  FaPaperPlane, FaTrash, FaEye, FaCheckCircle, FaClock
} from "react-icons/fa";

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
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const [classRes, assignmentsRes, announcementsRes, materialsRes] = await Promise.all([
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
      setToast({ message: "Failed to load dashboard", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const submitAssignment = async (id) => {
    const data = new FormData();
    if (answers[id]?.text) data.append("answerText", answers[id].text);
    if (answers[id]?.file) data.append("file", answers[id].file);

    try {
      await api.post(`/student/classes/${classId}/assignments/${id}/submit`, data);
      setToast({ message: "Assignment submitted successfully!", type: "success" });
      fetchDashboard();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Error submitting assignment", type: "error" });
    }
  };

  const unsendAssignment = async (id) => {
    if (!window.confirm("Are you sure you want to unsend your submission?")) return;
    try {
      await api.delete(`/student/classes/${classId}/assignments/${id}/unsend`);
      setToast({ message: "Submission unsent successfully!", type: "success" });
      fetchDashboard();
    } catch (err) {
      setToast({ message: "Error unsending submission", type: "error" });
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
      fetchDashboard();
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
      <div className="class-loading">
        <div className="class-spinner"></div>
        <p>Loading class dashboard...</p>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: <FaBookOpen /> },
    { id: "assignments", label: "Assignments", icon: <FaFileAlt />, count: assignments.length },
    { id: "announcements", label: "Announcements", icon: <FaBullhorn />, count: announcements.length },
    { id: "materials", label: "Materials", icon: <FaFolderOpen />, count: materials.length },
  ];

  return (
    <div className="class-dash-root">
      {/* Background */}
      <div className="class-dash-bg" />
      <div className="class-dash-grid" />
      <div className="class-dash-orb class-dash-orb-a" />
      <div className="class-dash-orb class-dash-orb-b" />

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      {/* Main Content */}
      <main className="class-dash-main">
        <div className="class-dash-container">
          {/* Back Button */}
          <button className="class-dash-back" onClick={() => navigate("/classes")}>
            <FaArrowLeft /> Back to My Classes
          </button>

          {/* Class Header */}
          <div className="class-dash-header">
            <div>
              <h1 className="class-dash-title">{classInfo?.name}</h1>
              <div className="class-dash-meta">
                <span className="class-dash-subject">{classInfo?.subject}</span>
                <span className="class-dash-teacher">
                  <FaChalkboardTeacher /> {classInfo?.teacher?.name}
                </span>
                <span className="class-dash-code">
                  Code: {classInfo?.code}
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="class-dash-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`class-dash-tab ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                {tab.label}
                {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="class-dash-overview">
              <div className="class-stats-grid">
                <div className="class-stat-card">
                  <div className="class-stat-icon">📝</div>
                  <div className="class-stat-info">
                    <div className="class-stat-value">{assignments.length}</div>
                    <div className="class-stat-label">Assignments</div>
                  </div>
                </div>
                <div className="class-stat-card">
                  <div className="class-stat-icon">📢</div>
                  <div className="class-stat-info">
                    <div className="class-stat-value">{announcements.length}</div>
                    <div className="class-stat-label">Announcements</div>
                  </div>
                </div>
                <div className="class-stat-card">
                  <div className="class-stat-icon">📂</div>
                  <div className="class-stat-info">
                    <div className="class-stat-value">{materials.length}</div>
                    <div className="class-stat-label">Materials</div>
                  </div>
                </div>
                <div className="class-stat-card">
                  <div className="class-stat-icon">👥</div>
                  <div className="class-stat-info">
                    <div className="class-stat-value">{classInfo?.students?.length || 0}</div>
                    <div className="class-stat-label">Students</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="class-quick-actions">
                <h3>Quick Actions</h3>
                <div className="quick-actions-grid">
                  <button className="quick-action" onClick={() => setActiveTab("assignments")}>
                    <FaFileAlt /> View Assignments
                  </button>
                  <button className="quick-action" onClick={() => setActiveTab("announcements")}>
                    <FaBullhorn /> Check Announcements
                  </button>
                  <button className="quick-action" onClick={() => setActiveTab("materials")}>
                    <FaFolderOpen /> View Materials
                  </button>
                </div>
              </div>

              {/* Recent Items */}
              <div className="class-recent">
                <h3>Recent Updates</h3>
                {announcements.length > 0 && (
                  <div className="recent-announcement">
                    <div className="recent-icon">📢</div>
                    <div className="recent-content">
                      <div className="recent-text">{announcements[0]?.text?.substring(0, 100)}...</div>
                      <div className="recent-meta">
                        Posted by {announcements[0]?.teacher?.name} • {new Date(announcements[0]?.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === "assignments" && (
            <div className="class-dash-assignments">
              {assignments.length === 0 ? (
                <div className="class-empty-state">
                  <div className="empty-icon">📝</div>
                  <h3>No Assignments Yet</h3>
                  <p>Check back later for new assignments from your teacher.</p>
                </div>
              ) : (
                assignments.map((a) => {
                  const now = new Date();
                  const due = a.dueDate ? new Date(a.dueDate) : null;
                  const isBeforeDue = due ? now <= due : true;
                  const isOverdue = due && now > due;

                  return (
                    <div key={a._id} className="assignment-card">
                      <div className="assignment-header">
                        <h3>{a.title}</h3>
                        {a.submitted ? (
                          <span className="assignment-badge submitted">✅ Submitted</span>
                        ) : isOverdue ? (
                          <span className="assignment-badge overdue">⏰ Overdue</span>
                        ) : due ? (
                          <span className="assignment-badge pending">⏳ Pending</span>
                        ) : null}
                      </div>
                      <p className="assignment-instructions">{a.instructions}</p>
                      {a.marks != null && (
                        <div className="assignment-marks">Total Marks: {a.marks}</div>
                      )}
                      {due && (
                        <div className="assignment-due">
                          <FaCalendarAlt /> Due: {new Date(due).toLocaleDateString()}
                        </div>
                      )}
                      {a.attachment && (
                        <button className="assignment-file-btn" onClick={() => openFile(a.attachment)}>
                          📎 View Assignment File
                        </button>
                      )}

                      {a.submitted ? (
                        <div className="assignment-submission">
                          <div className="submission-status">✅ Submitted</div>
                          {a.submission?.marks != null ? (
                            <div className="submission-marks">
                              Marks: {a.submission.marks} / {a.marks}
                            </div>
                          ) : (
                            <div className="submission-pending">Marks not uploaded yet</div>
                          )}
                          {a.submission?.file && (
                            <button className="submission-file-btn" onClick={() => openFile(a.submission.file)}>
                              <FaEye /> View My Submission
                            </button>
                          )}
                          {a.submission?.answerText && <div className="submission-text">{a.submission.answerText}</div>}
                          {isBeforeDue && (
                            <button className="unsend-btn" onClick={() => unsendAssignment(a._id)}>
                              <FaTrash /> Unsend Submission
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="assignment-submit-form">
                          <textarea
                            className="assignment-textarea"
                            placeholder="Write your answer here..."
                            onChange={(e) => setAnswers({ ...answers, [a._id]: { ...answers[a._id], text: e.target.value } })}
                          />
                          <input
                            type="file"
                            className="assignment-file-input"
                            onChange={(e) => setAnswers({ ...answers, [a._id]: { ...answers[a._id], file: e.target.files[0] } })}
                          />
                          <button className="submit-btn" onClick={() => submitAssignment(a._id)}>
                            <FaPaperPlane /> Submit Assignment
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === "announcements" && (
            <div className="class-dash-announcements">
              {announcements.length === 0 ? (
                <div className="class-empty-state">
                  <div className="empty-icon">📢</div>
                  <h3>No Announcements Yet</h3>
                  <p>Your teacher hasn't posted any announcements yet.</p>
                </div>
              ) : (
                announcements.map((a) => (
                  <div key={a._id} className="announcement-card">
                    <div className="announcement-text">{a.text}</div>
                    {a.attachment && (
                      <button className="announcement-file-btn" onClick={() => openFile(a.attachment)}>
                        📎 View Attachment
                      </button>
                    )}
                    <div className="announcement-meta">
                      Posted by {a.teacher?.name} on {new Date(a.createdAt).toLocaleString()}
                    </div>

                    {/* Replies */}
                    {a.replies && a.replies.length > 0 && (
                      <div className="announcement-replies">
                        <div className="replies-title">Replies ({a.replies.length})</div>
                        {a.replies.map((r, i) => (
                          <div key={i} className="reply-item">
                            <strong>{r.studentName}:</strong> {r.text}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply Form */}
                    <div className="reply-form">
                      <input
                        type="text"
                        className="reply-input"
                        placeholder="Write a reply..."
                        value={replyTexts[a._id] || ""}
                        onChange={(e) => setReplyTexts({ ...replyTexts, [a._id]: e.target.value })}
                      />
                      <button className="reply-btn" onClick={() => submitReply(a._id)}>
                        <FaPaperPlane /> Reply
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === "materials" && (
            <div className="class-dash-materials">
              {materials.length === 0 ? (
                <div className="class-empty-state">
                  <div className="empty-icon">📂</div>
                  <h3>No Materials Yet</h3>
                  <p>Your teacher hasn't uploaded any study materials yet.</p>
                </div>
              ) : (
                materials.map((m) => (
                  <div key={m._id} className="material-card">
                    <div className="material-icon">📄</div>
                    <div className="material-info">
                      <h4>{m.title}</h4>
                      {m.content && <p className="material-content">{m.content}</p>}
                      {m.fileUrl && (
                        <button className="material-view-btn" onClick={() => openFile(m.fileUrl)}>
                          <FaEye /> View File
                        </button>
                      )}
                      <div className="material-meta">
                        Posted by {m.teacher?.name} on {new Date(m.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .class-dash-root {
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
          --warning: #f59e0b;
          --error: #ef4444;
        }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .class-dash-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }

        /* Background */
        .class-dash-bg {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.08) 0%, transparent 60%);
        }
        .class-dash-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image: linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .class-dash-orb {
          position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .class-dash-orb-a { width: 400px; height: 400px; top: -100px; left: 50%; transform: translateX(-50%); background: rgba(88, 130, 255, 0.06); animation: orbFloat 12s infinite; }
        .class-dash-orb-b { width: 250px; height: 250px; bottom: 10%; right: -5%; background: rgba(32, 230, 208, 0.04); animation: orbFloat2 10s infinite; }
        @keyframes orbFloat { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.1); } }
        @keyframes orbFloat2 { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }

        /* Loading */
        .class-loading {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: #0a0c12;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .class-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(88, 130, 255, 0.2);
          border-top-color: #5882ff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .class-loading p { margin-top: 15px; color: #8e9cc4; }

        /* Main Content */
        .class-dash-main {
          position: relative;
          z-index: 10;
          max-width: 1000px;
          margin: 0 auto;
          padding: 90px 2rem 3rem;
          min-height: 100vh;
        }

        /* Back Button */
        .class-dash-back {
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
        .class-dash-back:hover {
          background: rgba(88, 130, 255, 0.2);
          transform: translateX(-4px);
        }

        /* Header */
        .class-dash-header {
          margin-bottom: 2rem;
        }
        .class-dash-title {
          font-family: var(--fd);
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .class-dash-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.85rem;
          color: var(--muted);
        }
        .class-dash-subject {
          background: rgba(88, 130, 255, 0.1);
          padding: 4px 12px;
          border-radius: 20px;
        }
        .class-dash-teacher {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .class-dash-code {
          font-family: monospace;
          background: rgba(255,255,255,0.05);
          padding: 4px 12px;
          border-radius: 20px;
        }

        /* Tabs */
        .class-dash-tabs {
          display: flex;
          gap: 0.5rem;
          border-bottom: 1px solid var(--border);
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .class-dash-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: none;
          border: none;
          color: var(--muted);
          font-size: 0.9rem;
          cursor: pointer;
          border-radius: 40px;
          transition: all 0.2s;
          position: relative;
        }
        .class-dash-tab:hover {
          color: var(--text);
          background: rgba(88, 130, 255, 0.1);
        }
        .class-dash-tab.active {
          color: var(--accent);
          background: rgba(88, 130, 255, 0.15);
        }
        .tab-count {
          background: rgba(88, 130, 255, 0.2);
          padding: 2px 8px;
          border-radius: 20px;
          font-size: 0.7rem;
        }

        /* Stats Grid */
        .class-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .class-stat-card {
          background: rgba(17, 19, 24, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .class-stat-icon { font-size: 2rem; }
        .class-stat-value { font-size: 1.5rem; font-weight: 700; }
        .class-stat-label { font-size: 0.7rem; color: var(--muted); }

        /* Quick Actions */
        .class-quick-actions h3, .class-recent h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
        }
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .quick-action {
          background: rgba(17, 19, 24, 0.6);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: var(--text);
          cursor: pointer;
          transition: all 0.2s;
        }
        .quick-action:hover {
          border-color: var(--accent);
          background: rgba(88, 130, 255, 0.05);
        }
        .recent-announcement {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: rgba(88, 130, 255, 0.05);
          border-radius: 16px;
        }
        .recent-icon { font-size: 1.5rem; }
        .recent-text { font-size: 0.9rem; margin-bottom: 0.25rem; }
        .recent-meta { font-size: 0.7rem; color: var(--muted); }

        /* Empty State */
        .class-empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(17, 19, 24, 0.6);
          border-radius: 20px;
        }
        .empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
        .class-empty-state h3 { margin-bottom: 0.5rem; }
        .class-empty-state p { color: var(--muted); }

        /* Assignment Card */
        .assignment-card {
          background: rgba(17, 19, 24, 0.6);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }
        .assignment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .assignment-header h3 { font-size: 1.1rem; }
        .assignment-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        .assignment-badge.submitted { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .assignment-badge.overdue { background: rgba(239, 68, 68, 0.2); color: #f87171; }
        .assignment-badge.pending { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
        .assignment-instructions { color: var(--muted); font-size: 0.85rem; margin-bottom: 0.5rem; }
        .assignment-marks { font-size: 0.8rem; color: var(--accent); margin-bottom: 0.5rem; }
        .assignment-due { font-size: 0.7rem; color: var(--faint); display: flex; align-items: center; gap: 6px; margin-bottom: 0.5rem; }
        .assignment-file-btn, .submission-file-btn {
          background: rgba(88, 130, 255, 0.1);
          border: 1px solid var(--border);
          color: var(--accent);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          cursor: pointer;
          margin-bottom: 0.5rem;
        }
        .assignment-submission {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }
        .submission-status { color: var(--success); margin-bottom: 0.5rem; }
        .submission-marks { color: var(--accent); margin-bottom: 0.5rem; }
        .submission-text { background: rgba(255,255,255,0.03); padding: 0.75rem; border-radius: 12px; margin: 0.5rem 0; font-size: 0.85rem; }
        .unsend-btn {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          cursor: pointer;
        }
        .assignment-submit-form {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border);
        }
        .assignment-textarea {
          width: 100%;
          padding: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
        }
        .assignment-file-input {
          width: 100%;
          padding: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
        }
        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          border: none;
          color: white;
          padding: 10px;
          border-radius: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        /* Announcement Card */
        .announcement-card {
          background: rgba(17, 19, 24, 0.6);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }
        .announcement-text { font-size: 1rem; margin-bottom: 0.5rem; }
        .announcement-file-btn {
          background: rgba(88, 130, 255, 0.1);
          border: 1px solid var(--border);
          color: var(--accent);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          cursor: pointer;
          margin-bottom: 0.5rem;
        }
        .announcement-meta { font-size: 0.7rem; color: var(--muted); margin-bottom: 1rem; }
        .announcement-replies {
          background: rgba(255,255,255,0.02);
          border-radius: 12px;
          padding: 1rem;
          margin: 1rem 0;
        }
        .replies-title { font-weight: 600; font-size: 0.8rem; margin-bottom: 0.5rem; }
        .reply-item { font-size: 0.8rem; padding: 4px 0; }
        .reply-form {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .reply-input {
          flex: 1;
          padding: 8px 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 40px;
          color: var(--text);
          font-size: 0.8rem;
        }
        .reply-btn {
          background: var(--accent);
          border: none;
          color: white;
          padding: 6px 16px;
          border-radius: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
        }

        /* Material Card */
        .material-card {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: rgba(17, 19, 24, 0.6);
          border: 1px solid var(--border);
          border-radius: 16px;
          margin-bottom: 1rem;
        }
        .material-icon { font-size: 2rem; }
        .material-info { flex: 1; }
        .material-info h4 { margin-bottom: 0.25rem; }
        .material-content { font-size: 0.85rem; color: var(--muted); margin-bottom: 0.5rem; }
        .material-view-btn {
          background: rgba(88, 130, 255, 0.1);
          border: 1px solid var(--border);
          color: var(--accent);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          cursor: pointer;
        }
        .material-meta { font-size: 0.7rem; color: var(--faint); margin-top: 0.5rem; }

        /* Responsive */
        @media (max-width: 768px) {
          .class-dash-main { padding: 80px 1rem 2rem; }
          .class-dash-title { font-size: 1.5rem; }
          .class-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .quick-actions-grid { grid-template-columns: 1fr; }
          .class-dash-tabs { gap: 0.25rem; }
          .class-dash-tab { padding: 6px 12px; font-size: 0.8rem; }
          .reply-form { flex-direction: column; }
          .material-card { flex-direction: column; align-items: center; text-align: center; }
        }
      `}</style>
    </div>
  );
}
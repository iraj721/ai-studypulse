import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";
import Toast from "../../components/Toast";
// import BackButton from "../../components/BackButton";

// ✅ Helper function to get Google Docs viewer URL for any file
const getFileViewerUrl = (fileUrl) => {
  if (!fileUrl) return null;
  
  // For local development or relative paths
  let fullUrl = fileUrl;
  if (!fileUrl.startsWith('http')) {
    const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000")
      .replace(/\/api\/?$/, "")
      .replace(/\/$/, "");
    fullUrl = `${BASE_URL}/${fileUrl}`;
  }
  
  // Use Google Docs Viewer for all file types
  // This will display PDF, DOCX, PPTX, etc. in browser without downloading
  const viewer = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
  return viewer;
};

export default function AdminStudentClassDetailsPage() {
  const { studentId, classId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("assignments");
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    if (studentId && classId) {
      fetchClassDetails();
    } else {
      setToast({ message: "Invalid student or class ID", type: "error" });
      setLoading(false);
    }
  }, [studentId, classId]);

  const fetchClassDetails = async () => {
    try {
      const res = await apiAdmin.get(`/admin/students/${studentId}/classes/${classId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || "Failed to load class details", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  // ✅ Open file in Google Docs Viewer
  const openFile = (fileUrl) => {
    if (!fileUrl) {
      setToast({ message: "No file attached", type: "error" });
      return;
    }
    const viewerUrl = getFileViewerUrl(fileUrl);
    window.open(viewerUrl, "_blank");
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading class details...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container py-5 text-center">
        <p>Class not found</p>
        <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const { class: classInfo, assignments, materials, announcements, statistics } = data;

  return (
    <div className="container py-5">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />
      
      <BackButton to={`/admin/users/${studentId}`} label="← Back to Student" />

      {/* Class Header */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h2 className="fw-bold mb-1">📘 {classInfo?.name}</h2>
          <p className="text-muted mb-2">{classInfo?.subject}</p>
          <p className="mb-0">👨‍🏫 Teacher: {classInfo?.teacher?.name}</p>
          <small className="text-muted">Class Code: {classInfo?.code}</small>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center p-3">
            <h3 className="text-primary">{statistics?.totalAssignments || 0}</h3>
            <p className="mb-0 text-muted">Total Assignments</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center p-3">
            <h3 className="text-success">{statistics?.submittedAssignments || 0}</h3>
            <p className="mb-0 text-muted">Submitted</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center p-3">
            <h3 className="text-warning">{statistics?.pendingAssignments || 0}</h3>
            <p className="mb-0 text-muted">Pending</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm border-0 text-center p-3">
            <h3 className="text-info">{statistics?.averageScore || 0}%</h3>
            <p className="mb-0 text-muted">Average Score</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "assignments" ? "active" : ""}`} onClick={() => setActiveTab("assignments")}>
            📝 Assignments ({assignments?.length || 0})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "materials" ? "active" : ""}`} onClick={() => setActiveTab("materials")}>
            📂 Materials ({materials?.length || 0})
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "announcements" ? "active" : ""}`} onClick={() => setActiveTab("announcements")}>
            📢 Announcements ({announcements?.length || 0})
          </button>
        </li>
      </ul>

      {/* Assignments Tab */}
      {activeTab === "assignments" && (
        <div>
          {assignments?.length === 0 ? (
            <div className="alert alert-info">No assignments in this class.</div>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment._id} className="card shadow-sm border-0 mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                    <h5 className="fw-bold mb-1">{assignment.title}</h5>
                    {assignment.submitted ? (
                      <span className="badge bg-success">✅ Submitted</span>
                    ) : (
                      <span className="badge bg-warning">⏳ Pending</span>
                    )}
                  </div>
                  <p className="text-muted small mb-2">{assignment.instructions}</p>
                  <div className="d-flex gap-3 mb-3 text-muted small">
                    <span>📅 Due: {formatDate(assignment.dueDate)}</span>
                    <span>⭐ Total Marks: {assignment.marks || "N/A"}</span>
                  </div>
                  
                  {assignment.submitted && assignment.submission && (
                    <div className="bg-light p-3 rounded mt-2">
                      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                        <strong>📤 Submission:</strong>
                        <span className="text-muted small">Submitted on {formatDate(assignment.submission.submittedAt)}</span>
                      </div>
                      {assignment.submission.answerText && (
                        <p className="mb-2"><strong>Answer:</strong> {assignment.submission.answerText}</p>
                      )}
                      {assignment.submission.file && (
                        <button
                          onClick={() => openFile(assignment.submission.file)}
                          className="btn btn-sm btn-outline-primary mb-2"
                        >
                          📎 View Submitted File
                        </button>
                      )}
                      <div className="mt-2 pt-2 border-top">
                        <strong>Marks Obtained:</strong>{' '}
                        {assignment.submission.obtainedMarks !== null ? (
                          <span className="text-success fw-bold">{assignment.submission.obtainedMarks} / {assignment.marks || "N/A"}</span>
                        ) : (
                          <span className="text-warning">Not graded yet</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Materials Tab */}
      {activeTab === "materials" && (
        <div className="row g-3">
          {materials?.length === 0 ? (
            <div className="alert alert-info">No materials uploaded.</div>
          ) : (
            materials.map((material) => (
              <div key={material._id} className="col-md-6">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <h5 className="fw-bold">{material.title}</h5>
                    {material.content && <p className="text-muted small">{material.content}</p>}
                    {material.fileUrl && (
                      <button
                        onClick={() => openFile(material.fileUrl)}
                        className="btn btn-sm btn-outline-primary mt-2"
                      >
                        📎 View Material
                      </button>
                    )}
                    <small className="text-muted d-block mt-2">
                      Posted by {material.teacher?.name} on {formatDate(material.createdAt)}
                    </small>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === "announcements" && (
        <div>
          {announcements?.length === 0 ? (
            <div className="alert alert-info">No announcements yet.</div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement._id} className="card shadow-sm border-0 mb-3">
                <div className="card-body">
                  <p className="mb-2">{announcement.text}</p>
                  <small className="text-muted">
                    Posted by {announcement.teacher?.name} on {formatDate(announcement.createdAt)}
                  </small>
                  
                  {announcement.replies && announcement.replies.length > 0 && (
                    <div className="mt-3 ps-3 border-start">
                      <strong className="small">Replies ({announcement.replies.length}):</strong>
                      {announcement.replies.map((reply, idx) => (
                        <div key={idx} className="small text-muted mt-1">
                          <strong>{reply.studentName}:</strong> {reply.text}
                          <span className="ms-2 opacity-50">({formatDate(reply.createdAt)})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        .nav-tabs .nav-link {
          color: #6c757d;
          cursor: pointer;
        }
        .nav-tabs .nav-link.active {
          color: #0d6efd;
          font-weight: 600;
          border-bottom: 2px solid #0d6efd;
        }
        @media (max-width: 768px) {
          .container { padding-left: 16px; padding-right: 16px; }
          .row.g-3 { flex-direction: column; }
          .col-md-3, .col-md-6 { width: 100%; }
        }
      `}</style>
    </div>
  );
}
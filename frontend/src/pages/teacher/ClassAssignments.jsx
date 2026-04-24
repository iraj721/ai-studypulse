import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Spinner from "../../components/Spinner";
import Toast from "../../components/Toast";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaFileAlt,
  FaCalendarAlt,
  FaStar,
} from "react-icons/fa";

const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace("/api", "");

export default function ClassAssignments() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [modal, setModal] = useState({
    show: false,
    type: "",
    assignment: null,
    title: "",
    instructions: "",
    dueDate: "",
    attachment: null,
    marks: "",
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get(`/teacher/classes/${id}/assignments`);
      setAssignments(res.data || []);
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to load assignments", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async () => {
    try {
      await api.delete(
        `/teacher/classes/${id}/assignments/${modal.assignment._id}`,
      );
      setAssignments(assignments.filter((a) => a._id !== modal.assignment._id));
      setToast({
        message: "Assignment deleted successfully!",
        type: "success",
      });
      setModal({ show: false });
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to delete assignment", type: "error" });
    }
  };

  const updateAssignment = async () => {
    try {
      const formData = new FormData();
      formData.append("title", modal.title);
      formData.append("instructions", modal.instructions);
      formData.append("dueDate", modal.dueDate || "");
      formData.append("marks", modal.marks || "");

      if (modal.attachment) {
        formData.append("attachment", modal.attachment);
      }

      await api.put(
        `/teacher/classes/${id}/assignments/${modal.assignment._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      setToast({
        message: "Assignment updated successfully!",
        type: "success",
      });
      fetchAssignments();
      setModal({ show: false });
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to update assignment", type: "error" });
    }
  };

  const openFile = (fileUrl, e) => {
    e.stopPropagation();
    if (!fileUrl) {
      setToast({ message: "No file attached", type: "error" });
      return;
    }

    let fullUrl = fileUrl;
    if (fileUrl.startsWith("http")) {
      fullUrl = fileUrl;
    } else if (fileUrl.startsWith("uploads/")) {
      fullUrl = `${BASE_URL}/${fileUrl}`;
    } else {
      fullUrl = `${BASE_URL}/uploads/assignments/${fileUrl.split("/").pop()}`;
    }

    if (
      fileUrl.toLowerCase().endsWith(".pdf") ||
      fileUrl.match(/\.(jpg|jpeg|png|gif)$/i)
    ) {
      window.open(fullUrl, "_blank");
    } else {
      const viewer = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
      window.open(viewer, "_blank");
    }
  };

  if (loading) return <Spinner message="Loading assignments..." />;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentAssignments = assignments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(assignments.length / itemsPerPage);

  return (
    <div className="class-assignments-page py-5">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      <div className="container">
        {/* Back Button */}
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Back to Class
        </button>

        {/* Header Card */}
        <div className="header-card">
          <div className="header-content">
            <div>
              <h2 className="header-title">
                <FaFileAlt className="header-icon" /> Assignments
              </h2>
              <p className="header-subtitle">
                Manage and grade student assignments
              </p>
            </div>
            <button
              className="btn-create"
              onClick={() =>
                navigate(`/teacher/classes/${id}/assignments/create`)
              }
            >
              <FaPlus /> Create Assignment
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-number">{assignments.length}</div>
            <div className="stat-label">Total Assignments</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {assignments.filter((a) => a.submissions?.length > 0).length}
            </div>
            <div className="stat-label">Have Submissions</div>
          </div>
        </div>

        {/* Assignments Grid */}
        {currentAssignments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No Assignments Yet</h3>
            <p>Click "Create Assignment" to get started</p>
          </div>
        ) : (
          <>
            <div className="assignments-grid">
              {currentAssignments.map((a) => (
                <div key={a._id} className="assignment-card">
                  <div className="assignment-header">
                    <div className="assignment-title-section">
                      <h3 className="assignment-title">{a.title}</h3>
                      {a.marks && (
                        <span className="marks-badge">🎯 {a.marks} marks</span>
                      )}
                    </div>
                    <div className="assignment-actions">
                      <button
                        className="action-btn edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModal({
                            show: true,
                            type: "edit",
                            assignment: a,
                            title: a.title,
                            instructions: a.instructions,
                            dueDate: a.dueDate ? a.dueDate.slice(0, 10) : "",
                            attachment: null,
                            marks: a.marks || "",
                          });
                        }}
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModal({
                            show: true,
                            type: "delete",
                            assignment: a,
                          });
                        }}
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>

                  <p className="assignment-instructions">{a.instructions}</p>

                  <div className="assignment-meta">
                    {a.dueDate && (
                      <span className="due-date">
                        <FaCalendarAlt /> Due:{" "}
                        {new Date(a.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {a.attachment && (
                      <button
                        className="view-attachment"
                        onClick={(e) => openFile(a.attachment, e)}
                      >
                        📎 View Assignment File
                      </button>
                    )}
                  </div>

                  <button
                    className="btn-view-submissions"
                    onClick={() =>
                      navigate(
                        `/teacher/classes/${id}/assignments/${a._id}/submissions`,
                      )
                    }
                  >
                    <FaEye /> View Submissions
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-prev"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ← Previous
                </button>
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="page-next"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {modal.show && modal.type === "edit" && (
        <div
          className="modal-overlay"
          onClick={() => setModal({ show: false })}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Edit Assignment</h3>
              <button
                className="modal-close"
                onClick={() => setModal({ show: false })}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={modal.title}
                  onChange={(e) =>
                    setModal({ ...modal, title: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Instructions *</label>
                <textarea
                  rows={4}
                  value={modal.instructions}
                  onChange={(e) =>
                    setModal({ ...modal, instructions: e.target.value })
                  }
                />
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="datetime-local"
                      value={modal.dueDate}
                      onChange={(e) =>
                        setModal({ ...modal, dueDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <label>Total Marks</label>
                    <input
                      type="number"
                      value={modal.marks}
                      onChange={(e) =>
                        setModal({ ...modal, marks: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Attachment (Optional)</label>
                <input
                  type="file"
                  onChange={(e) =>
                    setModal({ ...modal, attachment: e.target.files[0] })
                  }
                />
                <small>Leave empty to keep existing file</small>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setModal({ show: false })}
              >
                Cancel
              </button>
              <button className="btn-save" onClick={updateAssignment}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal.show && modal.type === "delete" && (
        <div
          className="modal-overlay"
          onClick={() => setModal({ show: false })}
        >
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon">⚠️</div>
            <h3>Delete Assignment?</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>"{modal.assignment?.title}"</strong>?
            </p>
            <p className="delete-warning">
              This will also delete all student submissions for this assignment.
            </p>
            <div className="delete-actions">
              <button
                className="btn-cancel"
                onClick={() => setModal({ show: false })}
              >
                Cancel
              </button>
              <button className="btn-confirm" onClick={deleteAssignment}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .class-assignments-page {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }

        .btn-back {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 30px;
          cursor: pointer;
          margin-bottom: 20px;
          transition: all 0.3s;
        }
        .btn-back:hover {
          background: rgba(255,255,255,0.3);
          transform: translateX(-3px);
        }

        .header-card {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 24px;
        }
        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
        }
        .header-title {
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 5px 0;
        }
        .header-subtitle {
          color: rgba(255,255,255,0.8);
          margin: 0;
        }
        .btn-create {
          background: white;
          color: #4f46e5;
          border: none;
          padding: 12px 24px;
          border-radius: 30px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }
        .btn-create:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .stats-row {
          display: flex;
          gap: 20px;
          margin-bottom: 30px;
          flex-wrap: wrap;
        }
        .stat-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 15px 25px;
          text-align: center;
          color: white;
          flex: 1;
          min-width: 150px;
        }
        .stat-number {
          font-size: 2rem;
          font-weight: 700;
        }
        .stat-label {
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .assignments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 24px;
        }
        .assignment-card {
          background: white;
          border-radius: 20px;
          padding: 20px;
          transition: all 0.3s;
        }
        .assignment-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.15);
        }
        .assignment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .assignment-title-section {
          flex: 1;
        }
        .assignment-title {
          font-size: 1.2rem;
          font-weight: 700;
          margin: 0 0 5px 0;
          color: #1e293b;
        }
        .marks-badge {
          background: #fef3c7;
          color: #d97706;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }
        .assignment-actions {
          display: flex;
          gap: 8px;
        }
        .action-btn {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border: none;
        }
        .action-btn.edit {
          background: #e0e7ff;
          color: #4f46e5;
        }
        .action-btn.delete {
          background: #fee2e2;
          color: #dc2626;
        }
        .assignment-instructions {
          color: #64748b;
          font-size: 0.85rem;
          margin-bottom: 16px;
          line-height: 1.5;
        }
        .assignment-meta {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .due-date {
          font-size: 12px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .view-attachment {
          background: none;
          border: none;
          color: #4f46e5;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .btn-view-submissions {
          width: 100%;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          border: none;
          padding: 10px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-view-submissions:hover {
          transform: scale(1.02);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          color: white;
        }
        .empty-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.7;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 30px;
          padding-top: 20px;
        }
        .page-prev, .page-next {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 8px 20px;
          border-radius: 30px;
          cursor: pointer;
        }
        .page-prev:disabled, .page-next:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .page-info {
          color: white;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-container, .delete-modal {
          background: white;
          border-radius: 24px;
          width: 90%;
          max-width: 500px;
          max-height: 85vh;
          overflow-y: auto;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 28px;
          cursor: pointer;
        }
        .modal-body {
          padding: 24px;
        }
        .form-group {
          margin-bottom: 16px;
        }
        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 6px;
          font-size: 13px;
        }
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
        }
        .btn-cancel {
          padding: 8px 16px;
          background: #f1f5f9;
          border: none;
          border-radius: 10px;
          cursor: pointer;
        }
        .btn-save {
          padding: 8px 20px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          border-radius: 10px;
          color: white;
          cursor: pointer;
        }
        .delete-modal {
          text-align: center;
          padding: 32px;
          max-width: 400px;
        }
        .delete-icon {
          font-size: 56px;
          margin-bottom: 16px;
        }
        .delete-warning {
          color: #dc2626;
          font-size: 12px;
          margin-top: 12px;
        }
        .delete-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
        .btn-confirm {
          flex: 1;
          padding: 10px;
          background: #dc2626;
          border: none;
          border-radius: 10px;
          color: white;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .class-assignments-page { padding: 20px 16px; }
          .header-content { flex-direction: column; text-align: center; }
          .stats-row { flex-direction: column; }
          .assignments-grid { grid-template-columns: 1fr; }
          .assignment-header { flex-direction: column; }
          .assignment-actions { width: 100%; justify-content: flex-end; }
        }
      `}</style>
    </div>
  );
}

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Spinner from "../../components/Spinner";
import Toast from "../../components/Toast";
import { FaFileUpload, FaCalendarAlt, FaStar, FaCheckCircle } from "react-icons/fa";

export default function CreateAssignment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [marks, setMarks] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !instructions) {
      setToast({ message: "Title and Instructions are required", type: "error" });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("instructions", instructions);
    formData.append("marks", marks || "");
    if (dueDate) formData.append("dueDate", dueDate);
    if (file) formData.append("attachment", file);

    try {
      setLoading(true);
      const res = await api.post(`/teacher/classes/${id}/assignments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setShowSuccessModal(true);
      setToast({ message: "Assignment created successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || "Failed to create assignment", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner message="Creating assignment..." />;

  return (
    <div className="create-assignment-page min-vh-100 py-5">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container" style={{ maxWidth: "650px" }}>
        <div className="card assignment-card p-4 shadow-lg">
          <div className="text-center mb-4">
            <div className="assignment-icon-wrapper">
              <FaFileUpload className="assignment-icon" />
            </div>
            <h2 className="fw-bold mt-3">Create New Assignment</h2>
            <p className="text-muted">Students will be notified via email</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Assignment Title *</label>
              <input
                type="text"
                className="form-control form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Chapter 1 Quiz"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Instructions *</label>
              <textarea
                className="form-control form-input"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
                placeholder="Describe what students need to do..."
                required
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  <FaCalendarAlt className="me-1" /> Due Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  className="form-control form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  <FaStar className="me-1" /> Total Marks (Optional)
                </label>
                <input
                  type="number"
                  className="form-control form-input"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  placeholder="e.g., 100"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Attachment (Optional)</label>
              <div className="file-drop-area" onClick={() => document.getElementById("fileInput").click()}>
                <input type="file" id="fileInput" onChange={(e) => setFile(e.target.files[0])} style={{ display: "none" }} />
                <FaFileUpload className="file-icon" />
                <p>{file ? file.name : "Click or drag file here"}</p>
                <small>PDF, DOC, DOCX, up to 10MB</small>
              </div>
            </div>

            <button type="submit" className="btn btn-create w-100" disabled={loading}>
              {loading ? "Creating..." : "✨ Create Assignment"}
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">✅</div>
            <h3>Assignment Created!</h3>
            <p>Students have been notified via email about this assignment.</p>
            <div className="modal-buttons">
              <button onClick={() => navigate(`/teacher/classes/${id}/assignments`)} className="btn-view">
                View All Assignments
              </button>
              <button onClick={() => setShowSuccessModal(false)} className="btn-close-modal">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .create-assignment-page {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        .assignment-card {
          border-radius: 28px;
          background: white;
          transition: transform 0.3s;
          border: none;
        }
        .assignment-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .assignment-icon-wrapper {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        .assignment-icon {
          font-size: 32px;
          color: white;
        }
        .form-input {
          border-radius: 14px;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
        }
        .form-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
          outline: none;
        }
        .file-drop-area {
          border: 2px dashed #cbd5e1;
          border-radius: 16px;
          padding: 25px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          background: #f8fafc;
        }
        .file-drop-area:hover {
          border-color: #4f46e5;
          background: #eff6ff;
        }
        .file-icon {
          font-size: 32px;
          color: #4f46e5;
          margin-bottom: 10px;
        }
        .btn-create {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          padding: 14px;
          border-radius: 14px;
          font-weight: 600;
          color: white;
        }
        .success-modal-overlay {
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
        .success-modal {
          background: white;
          border-radius: 28px;
          padding: 40px;
          text-align: center;
          max-width: 400px;
          width: 90%;
          animation: popIn 0.3s ease;
        }
        @keyframes popIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .success-icon {
          font-size: 64px;
          margin-bottom: 16px;
        }
        .success-modal h3 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 10px;
        }
        .modal-buttons {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        .btn-view, .btn-close-modal {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: none;
          font-weight: 600;
          cursor: pointer;
        }
        .btn-view {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
        }
        .btn-close-modal {
          background: #f1f5f9;
          color: #475569;
        }
        @media (max-width: 768px) {
          .assignment-card { margin: 0 16px; padding: 20px !important; }
          .modal-buttons { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import apiAdmin from "../../services/apiAdmin";
import Stars from "../../components/Stars";
import BackButton from "../../components/BackButton";
import Toast from "../../components/Toast";
import { FaPlus, FaTrash, FaEnvelope, FaUserGraduate } from "react-icons/fa";

export default function AdminTeacherManagement() {
  const [approvedTeachers, setApprovedTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ email: "", name: "", department: "" });
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchApprovedTeachers();
  }, []);

  const fetchApprovedTeachers = async () => {
    try {
      const res = await apiAdmin.get("/admin/teacher-approval/list");
      setApprovedTeachers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeacher = async () => {
    if (!formData.email || !formData.name) {
      setToast({ message: "Email and name are required", type: "error" });
      return;
    }

    try {
      await apiAdmin.post("/admin/teacher-approval/add", formData);
      setToast({ message: "Teacher approved successfully!", type: "success" });
      setShowModal(false);
      setFormData({ email: "", name: "", department: "" });
      fetchApprovedTeachers();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to add", type: "error" });
    }
  };

  const handleDeleteTeacher = async () => {
    if (!deleteTarget) return;
    try {
      await apiAdmin.delete(`/admin/teacher-approval/${deleteTarget}`);
      setToast({ message: "Teacher removed from approved list", type: "success" });
      setDeleteTarget(null);
      fetchApprovedTeachers();
    } catch (err) {
      setToast({ message: "Failed to remove", type: "error" });
    }
  };

  return (
    <div className="teacher-management-page min-vh-100 py-5">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container">
        <BackButton to="/admin/dashboard" label="← Back to Dashboard" />

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h2 className="fw-bold text-white">👨‍🏫 Teacher Management</h2>
          <button className="btn-add-teacher" onClick={() => setShowModal(true)}>
            <FaPlus /> Add Approved Teacher
          </button>
        </div>

        <div className="info-card mb-4">
          <div className="info-icon">ℹ️</div>
          <div className="info-content">
            <strong>How it works:</strong> Only teachers added to this list can register with "teacher" role.
            Students can register freely without approval.
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        ) : approvedTeachers.length === 0 ? (
          <div className="empty-state">
            <FaUserGraduate className="empty-icon" />
            <h4>No Approved Teachers</h4>
            <p>Click "Add Approved Teacher" to authorize teacher registrations.</p>
          </div>
        ) : (
          <div className="teachers-table-container">
            <table className="teachers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Added On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvedTeachers.map((teacher) => (
                  <tr key={teacher._id}>
                    <td><strong>{teacher.name}</strong></td>
                    <td><FaEnvelope /> {teacher.email}</td>
                    <td>{teacher.department || "—"}</td>
                    <td>{new Date(teacher.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn-delete-teacher"
                        onClick={() => setDeleteTarget(teacher._id)}
                      >
                        <FaTrash /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Teacher Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Approved Teacher</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Dr. Sarah Johnson"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  placeholder="teacher@school.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <small>Only this email can register as teacher</small>
              </div>
              <div className="form-group">
                <label>Department (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Computer Science, Mathematics"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleAddTeacher}>Add Teacher</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="delete-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="delete-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon">⚠️</div>
            <h3>Remove Teacher</h3>
            <p>This teacher will no longer be able to register. Existing teacher accounts will not be affected.</p>
            <div className="delete-actions">
              <button className="btn-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-delete" onClick={handleDeleteTeacher}>Remove</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .teacher-management-page {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }

        .btn-add-teacher {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .btn-add-teacher:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(79,70,229,0.3);
        }

        .info-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          color: white;
          margin-bottom: 24px;
        }

        .info-icon {
          width: 40px;
          height: 40px;
          background: #4f46e5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255,255,255,0.05);
          border-radius: 20px;
          color: white;
        }

        .empty-icon {
          font-size: 64px;
          opacity: 0.5;
          margin-bottom: 16px;
        }

        .teachers-table-container {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          overflow-x: auto;
        }

        .teachers-table {
          width: 100%;
          border-collapse: collapse;
          color: white;
        }

        .teachers-table th,
        .teachers-table td {
          padding: 16px;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .teachers-table th {
          background: rgba(0,0,0,0.2);
          font-weight: 600;
          color: #a5b4fc;
        }

        .teachers-table tr:hover {
          background: rgba(255,255,255,0.05);
        }

        .btn-delete-teacher {
          background: rgba(239,68,68,0.2);
          border: none;
          color: #ef4444;
          padding: 6px 12px;
          border-radius: 8px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          transition: all 0.2s;
        }

        .btn-delete-teacher:hover {
          background: #ef4444;
          color: white;
        }

        /* Modal Styles */
        .modal-overlay, .delete-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-container {
          background: white;
          border-radius: 24px;
          width: 90%;
          max-width: 500px;
          animation: slideUp 0.3s ease;
        }

        .dark .modal-container {
          background: #1e293b;
          color: white;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .dark .modal-header {
          border-bottom-color: #334155;
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
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .form-group input {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
        }

        .dark .form-group input {
          background: #0f172a;
          border-color: #334155;
          color: white;
        }

        .form-group small {
          font-size: 11px;
          opacity: 0.6;
          display: block;
          margin-top: 5px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid #e2e8f0;
        }

        .btn-cancel {
          padding: 10px 20px;
          background: #f1f5f9;
          border: none;
          border-radius: 10px;
          cursor: pointer;
        }

        .btn-save {
          padding: 10px 20px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          border-radius: 10px;
          color: white;
          cursor: pointer;
        }

        .delete-modal-container {
          background: white;
          border-radius: 24px;
          padding: 32px;
          width: 90%;
          max-width: 400px;
          text-align: center;
        }

        .delete-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .delete-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-top: 24px;
        }

        .btn-delete {
          padding: 10px 20px;
          background: #ef4444;
          border: none;
          border-radius: 10px;
          color: white;
          cursor: pointer;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .teachers-table th, .teachers-table td {
            padding: 10px;
            font-size: 12px;
          }
          .btn-add-teacher {
            padding: 10px 16px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
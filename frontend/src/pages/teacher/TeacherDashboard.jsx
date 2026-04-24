import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Spinner from "../../components/Spinner";
import Toast from "../../components/Toast";
import { FaPlus, FaChalkboardTeacher, FaTrash, FaEye } from "react-icons/fa";

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get("/teacher/classes");
      console.log("Fetched classes:", res.data);
      setClasses(res.data);
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || "Failed to fetch classes", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!classToDelete) return;

    try {
      await api.delete(`/teacher/classes/${classToDelete._id}`);
      setClasses((prev) => prev.filter((c) => c._id !== classToDelete._id));
      setToast({ message: `Class "${classToDelete.name}" deleted successfully`, type: "success" });
      setShowDeleteModal(false);
      setClassToDelete(null);
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || "Failed to delete class", type: "error" });
    }
  };

  const openDeleteModal = (classData, e) => {
    e.stopPropagation();
    setClassToDelete(classData);
    setShowDeleteModal(true);
  };

  if (loading) return <Spinner message="Loading your classes..." />;

  return (
    <div className="teacher-dashboard-page py-5">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">
              <FaChalkboardTeacher className="title-icon" /> Teacher Dashboard
            </h1>
            <p className="dashboard-subtitle">Manage your classes, students, and assignments</p>
          </div>
          <button className="btn-create-class" onClick={() => navigate("/teacher/classes/create")}>
            <FaPlus /> Create New Class
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-number">{classes.length}</div>
            <div className="stat-label">Total Classes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{classes.reduce((sum, c) => sum + (c.students?.length || 0), 0)}</div>
            <div className="stat-label">Total Students</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{classes.reduce((sum, c) => sum + (c.assignments?.length || 0), 0)}</div>
            <div className="stat-label">Total Assignments</div>
          </div>
        </div>

        {/* Classes Grid */}
        {classes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Classes Yet</h3>
            <p>Click "Create New Class" to get started with your first class</p>
            <button className="btn-create-first" onClick={() => navigate("/teacher/classes/create")}>
              <FaPlus /> Create Your First Class
            </button>
          </div>
        ) : (
          <>
            <h2 className="section-title">📚 Your Classes</h2>
            <div className="classes-grid">
              {classes.map((cls) => (
                <div key={cls._id} className="class-card" onClick={() => navigate(`/teacher/classes/${cls._id}`)}>
                  <div className="class-code">{cls.code}</div>
                  <h3 className="class-name">{cls.name}</h3>
                  <p className="class-subject">{cls.subject}</p>
                  <div className="class-stats">
                    <span>👥 {cls.students?.length || 0} Students</span>
                    <span>📝 {cls.assignments?.length || 0} Assignments</span>
                  </div>
                  <div className="class-actions">
                    <button className="btn-view" onClick={(e) => { e.stopPropagation(); navigate(`/teacher/classes/${cls._id}`); }}>
                      <FaEye /> View Details
                    </button>
                    <button className="btn-delete" onClick={(e) => openDeleteModal(cls, e)}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && classToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-icon">⚠️</div>
            <h3>Delete Class?</h3>
            <p>Are you sure you want to delete <strong>"{classToDelete.name}"</strong>?</p>
            <p className="delete-warning">
              This action cannot be undone. All assignments, materials, and announcements in this class will be permanently deleted.
            </p>
            <div className="delete-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleDeleteClass}>Yes, Delete Class</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .teacher-dashboard-page {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }

        /* Header */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .dashboard-title {
          color: white;
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .title-icon {
          font-size: 2rem;
        }
        .dashboard-subtitle {
          color: rgba(255,255,255,0.8);
          margin: 5px 0 0;
        }
        .btn-create-class {
          background: white;
          color: #4f46e5;
          border: none;
          padding: 12px 28px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
          font-size: 1rem;
        }
        .btn-create-class:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        /* Stats Row */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }
        .stat-card {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 20px;
          text-align: center;
          color: white;
        }
        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
        }
        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
          margin-top: 5px;
        }

        /* Section Title */
        .section-title {
          color: white;
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: 20px;
        }

        /* Classes Grid */
        .classes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }
        .class-card {
          background: white;
          border-radius: 20px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
        }
        .class-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.15);
        }
        .class-code {
          position: absolute;
          top: 16px;
          right: 20px;
          background: #e0e7ff;
          color: #4f46e5;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        .class-name {
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: #1e293b;
          padding-right: 70px;
        }
        .class-subject {
          color: #64748b;
          margin-bottom: 16px;
        }
        .class-stats {
          display: flex;
          gap: 16px;
          color: #94a3b8;
          font-size: 13px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 16px;
        }
        .class-actions {
          display: flex;
          gap: 12px;
        }
        .btn-view, .btn-delete {
          flex: 1;
          padding: 8px;
          border-radius: 30px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .btn-view {
          background: #4f46e5;
          color: white;
          border: none;
        }
        .btn-view:hover {
          background: #4338ca;
          transform: scale(1.02);
        }
        .btn-delete {
          background: #fee2e2;
          color: #dc2626;
          border: none;
        }
        .btn-delete:hover {
          background: #dc2626;
          color: white;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          color: white;
        }
        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.7;
        }
        .empty-state h3 {
          margin-bottom: 10px;
        }
        .empty-state p {
          opacity: 0.7;
          margin-bottom: 25px;
        }
        .btn-create-first {
          background: white;
          color: #4f46e5;
          border: none;
          padding: 12px 24px;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        /* Delete Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .delete-modal {
          background: white;
          border-radius: 28px;
          padding: 32px;
          width: 90%;
          max-width: 420px;
          text-align: center;
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .delete-icon {
          font-size: 56px;
          margin-bottom: 16px;
        }
        .delete-modal h3 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: #1e293b;
        }
        .delete-modal p {
          color: #475569;
          margin-bottom: 12px;
          line-height: 1.5;
        }
        .delete-warning {
          color: #dc2626;
          font-size: 12px;
          margin-top: 8px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
        }
        .delete-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
        .btn-cancel {
          flex: 1;
          padding: 12px;
          background: #f1f5f9;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-cancel:hover {
          background: #e2e8f0;
        }
        .btn-confirm {
          flex: 1;
          padding: 12px;
          background: #dc2626;
          border: none;
          border-radius: 14px;
          color: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-confirm:hover {
          background: #b91c1c;
          transform: scale(1.02);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .teacher-dashboard-page { padding: 20px 16px; }
          .dashboard-header { flex-direction: column; text-align: center; }
          .stats-row { grid-template-columns: 1fr; gap: 12px; }
          .classes-grid { grid-template-columns: 1fr; }
          .class-actions { flex-direction: column; }
          .delete-modal { padding: 24px; width: 85%; }
          .delete-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Spinner from "../../components/Spinner";
import Toast from "../../components/Toast";
import { FaUserMinus, FaSearch, FaUsers, FaTimes, FaTrash } from "react-icons/fa";

export default function ClassStudents() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [toast, setToast] = useState({ message: "", type: "success" });
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get(`/teacher/classes/${id}`);
      setStudents(res.data.students || []);
      setFiltered(res.data.students || []);
      setClassName(res.data.name);
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to load students", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value.toLowerCase();
    setSearch(val);
    setCurrentPage(1);
    setFiltered(
      students.filter(
        (s) =>
          s.name.toLowerCase().includes(val) ||
          s.email.toLowerCase().includes(val),
      ),
    );
  };

  const confirmRemoveStudent = (student) => {
    setStudentToRemove(student);
    setShowRemoveModal(true);
  };

  const handleRemoveStudent = async () => {
    if (!studentToRemove) return;
    
    try {
      await api.delete(`/teacher/classes/${id}/students/${studentToRemove._id}`);
      setToast({ message: `${studentToRemove.name} removed from class`, type: "success" });
      
      setStudents((prev) => prev.filter((s) => s._id !== studentToRemove._id));
      setFiltered((prev) => prev.filter((s) => s._id !== studentToRemove._id));
      setShowRemoveModal(false);
      setStudentToRemove(null);
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to remove student", type: "error" });
    }
  };

  if (loading) return <Spinner message="Loading students..." />;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentStudents = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="class-students-page py-5">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

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
                <FaUsers className="header-icon" /> Students — {className}
              </h2>
              <p className="header-subtitle">
                Total enrolled students: <span className="total-count">{students.length}</span>
              </p>
            </div>
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by name or email..."
                value={search}
                onChange={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Students List */}
        {currentStudents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👨‍🎓</div>
            <h4>No Students Found</h4>
            <p>{search ? `No results for "${search}"` : "No students have joined this class yet"}</p>
          </div>
        ) : (
          <div className="students-container">
            <div className="students-grid">
              {currentStudents.map((student, index) => (
                <div key={student._id} className="student-card">
                  <div className="student-avatar">
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="student-info">
                    <h5 className="student-name">{student.name}</h5>
                    <p className="student-email">{student.email}</p>
                    <div className="student-id">ID: #{indexOfFirst + index + 1}</div>
                  </div>
                  <button
                    className="btn-remove-student"
                    onClick={() => confirmRemoveStudent(student)}
                    title="Remove student"
                  >
                    <FaUserMinus /> Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  ← Previous
                </button>
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  className="page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Beautiful Remove Modal */}
      {showRemoveModal && studentToRemove && (
        <div className="modal-overlay" onClick={() => setShowRemoveModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <h3>Remove Student?</h3>
            <p>
              Are you sure you want to remove <strong>{studentToRemove.name}</strong> from this class?
            </p>
            <p className="modal-warning">
              This action cannot be undone. The student will lose access to all class materials, assignments, and announcements.
            </p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowRemoveModal(false)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={handleRemoveStudent}>
                Yes, Remove Student
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .class-students-page {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }

        /* Back Button */
        .btn-back {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 30px;
          cursor: pointer;
          margin-bottom: 20px;
          transition: all 0.3s;
          font-weight: 500;
        }
        .btn-back:hover {
          background: rgba(255,255,255,0.3);
          transform: translateX(-3px);
        }

        /* Header Card */
        .header-card {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 30px;
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
        .header-icon {
          font-size: 28px;
        }
        .header-subtitle {
          color: rgba(255,255,255,0.8);
          margin: 0;
        }
        .total-count {
          font-weight: 700;
          font-size: 1.2rem;
        }
        .search-box {
          position: relative;
        }
        .search-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }
        .search-input {
          padding: 12px 16px 12px 45px;
          border-radius: 30px;
          border: none;
          width: 280px;
          font-size: 14px;
          background: white;
        }
        .search-input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.3);
        }

        /* Empty State */
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
        .empty-state h4 {
          margin-bottom: 8px;
        }
        .empty-state p {
          opacity: 0.7;
        }

        /* Students Grid */
        .students-container {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 24px;
        }
        .students-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }
        .student-card {
          background: white;
          border-radius: 20px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.3s;
          position: relative;
        }
        .student-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        .student-avatar {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: bold;
          color: white;
          flex-shrink: 0;
        }
        .student-info {
          flex: 1;
        }
        .student-name {
          font-size: 1rem;
          font-weight: 700;
          margin: 0 0 4px 0;
          color: #1e293b;
        }
        .student-email {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0 0 4px 0;
        }
        .student-id {
          font-size: 0.7rem;
          color: #94a3b8;
        }
        .btn-remove-student {
          background: #fee2e2;
          border: none;
          color: #dc2626;
          padding: 8px 16px;
          border-radius: 30px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .btn-remove-student:hover {
          background: #dc2626;
          color: white;
          transform: scale(1.02);
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.2);
        }
        .page-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 8px 20px;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .page-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.3);
          transform: scale(1.02);
        }
        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .page-info {
          color: white;
          font-weight: 500;
        }

        /* Modal Styles */
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
        .modal-container {
          background: white;
          border-radius: 28px;
          padding: 32px;
          width: 90%;
          max-width: 450px;
          text-align: center;
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-icon {
          font-size: 56px;
          margin-bottom: 16px;
        }
        .modal-container h3 {
          font-size: 1.3rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: #1e293b;
        }
        .modal-container p {
          color: #475569;
          margin-bottom: 12px;
          line-height: 1.5;
        }
        .modal-warning {
          color: #dc2626;
          font-size: 12px;
          margin-top: 8px;
          padding-top: 12px;
          border-top: 1px solid #e2e8f0;
        }
        .modal-actions {
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
          .class-students-page { padding: 16px; }
          .header-content { flex-direction: column; text-align: center; }
          .search-input { width: 100%; }
          .students-grid { grid-template-columns: 1fr; }
          .student-card { flex-direction: column; text-align: center; }
          .btn-remove-student { width: 100%; justify-content: center; }
          .modal-container { padding: 24px; width: 85%; }
          .modal-actions { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
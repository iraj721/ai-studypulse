import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import Stars from "../../../components/Stars";
import BackButton from "../../../components/BackButton";
import Toast from "../../../components/Toast";

export default function StudentClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get("/student/classes");
      setClasses(res.data);
    } catch (err) {
      setToast({ message: "Failed to load classes", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const openLeaveModal = (classId, e) => {
    e.stopPropagation();
    setSelectedClassId(classId);
    setShowModal(true);
  };

  const confirmLeave = async () => {
    try {
      await api.delete(`/student/classes/${selectedClassId}/leave`);
      setClasses((prev) => prev.filter((cls) => cls._id !== selectedClassId));
      setToast({ message: "Left class successfully!", type: "success" });
      setShowModal(false);
      setSelectedClassId(null);
    } catch (err) {
      setToast({ message: "Failed to leave class", type: "error" });
    }
  };

  return (
    <div className="classes-bg min-vh-100 py-5 position-relative">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container">
        <BackButton to="/dashboard" label="← Back to Dashboard" />

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h3 className="text-white fw-bold">📚 My Classes</h3>
          <button className="btn btn-gradient" onClick={() => navigate("/classes/join")}>
            + Join New Class
          </button>
        </div>

        {loading ? (
          <div className="text-white text-center mt-5">Loading...</div>
        ) : classes.length === 0 ? (
          <div className="text-light-opacity text-center py-5">
            You haven't joined any classes yet.
            <br />
            <button className="btn btn-gradient mt-3" onClick={() => navigate("/classes/join")}>
              Join Your First Class
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {classes.map((cls) => (
              <div key={cls._id} className="col-md-4 col-sm-6">
                <div className="class-card p-4 shadow-sm" onClick={() => navigate(`/student/class/${cls._id}`)}>
                  <h5 className="mb-2 fw-bold">{cls.name}</h5>
                  <p className="mb-1"><strong>Subject:</strong> {cls.subject}</p>
                  <p className="mb-3"><strong>Teacher:</strong> {cls.teacher?.name}</p>
                  <button className="btn btn-sm btn-danger w-100" onClick={(e) => openLeaveModal(cls._id, e)}>
                    Leave Class
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="custom-modal">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow p-3">
              <div className="modal-header pb-2">
                <h5 className="modal-title text-danger fw-bold">⚠️ Leave Class?</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body py-3">
                <p>Are you sure you want to leave this class?</p>
                <span className="text-danger fw-semibold">This action cannot be undone.</span>
              </div>
              <div className="modal-footer pt-2 d-flex gap-2">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={confirmLeave}>Yes, Leave</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .classes-bg {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%);
        }
        .text-light-opacity { color: rgba(255,255,255,0.8); }
        .btn-gradient {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          color: white;
        }
        .class-card {
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: #1a2a3d;
        }
        .class-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 25px rgba(0,0,0,0.2);
        }
        .custom-modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
        }
        .custom-modal .modal-content { background: white; width: 400px; max-width: 90%; }
        @media (max-width: 768px) {
          .row.g-4 { flex-direction: column; }
          .col-md-4.col-sm-6 { width: 100%; }
        }
      `}</style>
    </div>
  );
}
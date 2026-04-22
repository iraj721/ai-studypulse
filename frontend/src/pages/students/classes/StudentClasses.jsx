// src/pages/StudentClasses.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import Stars from "../../../components/Stars";

export default function StudentClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get("/student/classes");
      setClasses(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const openLeaveModal = (classId, e) => {
    e.stopPropagation(); // card click prevent
    setSelectedClassId(classId);
    setShowModal(true);
  };

  const confirmLeave = async () => {
    try {
      await api.delete(`/student/classes/${selectedClassId}/leave`);
      setClasses((prev) => prev.filter((cls) => cls._id !== selectedClassId));
      setShowModal(false);
      setSelectedClassId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to leave class");
    }
  };

  return (
    <div className="classes-bg min-vh-100 py-5 position-relative">
      <Stars />
      <div className="container">
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="text-white fw-bold">📚 My Classes</h3>
          <button
            className="btn btn-gradient"
            onClick={() => navigate("/classes/join")}
          >
            Join Class
          </button>
        </div>

        {loading ? (
          <div className="text-white text-center mt-5">Loading...</div>
        ) : classes.length === 0 ? (
          <div className="text-light-opacity">
            You haven't joined any classes yet.
          </div>
        ) : (
          <div className="row g-3">
            {classes.map((cls) => (
              <div key={cls._id} className="col-md-4">
                <div
                  className="class-card dashboard-card p-4 shadow-sm d-flex flex-column justify-content-between"
                  onClick={() => navigate(`/student/class/${cls._id}`)}
                >
                  <h5 className="mb-2 fw-bold class-name">{cls.name}</h5>
                  <p className="mb-1 text-light-opacity">
                    <strong>Subject:</strong> {cls.subject}
                  </p>
                  <p className="mb-3 text-light-opacity">
                    <strong>Teacher:</strong> {cls.teacher?.name}
                  </p>
                  <button
                    className="btn btn-sm btn-danger mt-3"
                    onClick={(e) => openLeaveModal(cls._id, e)}
                  >
                    Leave Class
                  </button>
                </div>
              </div>
            ))}
            {showModal && (
              <div className="custom-modal">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content rounded-4 shadow p-4">
                    <div className="modal-header">
                      <h5 className="modal-title text-danger fw-bold">
                        Leave Class?
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => {
                          setShowModal(false);
                          setSelectedClassId(null);
                        }}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <p>
                        Are you sure you want to leave this class?
                        <br />
                        <strong>This action cannot be undone.</strong>
                      </p>
                    </div>
                    <div className="modal-footer d-flex justify-content-end gap-3">
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setShowModal(false);
                          setSelectedClassId(null);
                        }}
                      >
                        Cancel
                      </button>
                      <button className="btn btn-danger" onClick={confirmLeave}>
                        Yes, Leave
                      </button>
                    </div>
                  </div>
                </div>
                <div className="modal-backdrop"></div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .classes-bg {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%);
          position: relative;
          overflow: hidden;
          color: #fff;
        }
          .class-name{color: black;
          }
        .text-light-opacity { color: black }
        .btn-gradient {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          color: white;
          font-weight: 600;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .btn-gradient:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 12px 25px rgba(0,0,0,0.25);
          background: linear-gradient(135deg, #5b4be8, #7b66f3);
        }
        .class-card {
          border-radius: 16px;
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
          color: #fff;
        }
        .class-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 25px rgba(0,0,0,0.3);
        }

       .custom-modal {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000; /* ensure on top */
  pointer-events: all; /* make modal interactive */
}

.custom-modal .modal-content {
  background: #fff;
  color: #212529;
  z-index: 2100;
  pointer-events: auto;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  z-index: 2050;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.class-card button {
  width: auto; /* better spacing */
}
      `}</style>
    </div>
  );
}

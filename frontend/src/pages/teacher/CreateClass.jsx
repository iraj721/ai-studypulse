import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Spinner from "../../components/Spinner";
import Toast from "../../components/Toast";
import { FaChalkboardTeacher, FaCopy, FaCheck } from "react-icons/fa";

export default function CreateClass() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", subject: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [classId, setClassId] = useState("");
  const [copied, setCopied] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.subject.trim()) {
      setToast({ message: "Class name and subject are required", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/teacher/classes", form);
      setClassCode(res.data.code);
      setClassId(res.data.class._id);
      setShowSuccessModal(true);
      setToast({ message: "Class created successfully!", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || "Failed to create class", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(classCode);
    setCopied(true);
    setToast({ message: "Class code copied!", type: "success" });
    setTimeout(() => setCopied(false), 2000);
  };

  const goToClass = () => {
    setShowSuccessModal(false);
    navigate(`/teacher/classes/${classId}`);
  };

  const createAnother = () => {
    setShowSuccessModal(false);
    setForm({ name: "", subject: "" });
  };

  if (loading) return <Spinner message="Creating Class..." />;

  return (
    <div className="create-class-page min-vh-100 py-5">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container" style={{ maxWidth: "600px" }}>
        <div className="card create-class-card p-4 shadow-lg">
          <div className="text-center mb-4">
            <div className="create-icon-wrapper">
              <FaChalkboardTeacher className="create-icon" />
            </div>
            <h2 className="fw-bold mt-3">Create New Class</h2>
            <p className="text-muted">Fill in the details below to create a class</p>
          </div>

          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Class Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                className="form-control form-input"
                placeholder="e.g., Computer Science 101"
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={onChange}
                className="form-control form-input"
                placeholder="e.g., Programming Fundamentals"
                required
              />
            </div>

            <button type="submit" className="btn btn-create w-100" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Creating...
                </>
              ) : (
                "✨ Create Class"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Beautiful Success Modal */}
      {showSuccessModal && (
        <div className="success-modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon">🎉</div>
            <h3>Class Created Successfully!</h3>
            <p>Share this code with students to join your class:</p>
            <div className="code-display">
              <span className="code-text">{classCode}</span>
              <button onClick={copyCode} className="copy-code-btn">
                {copied ? <FaCheck /> : <FaCopy />} {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="modal-buttons">
              <button onClick={goToClass} className="btn-dashboard">
                Go to Class
              </button>
              <button onClick={createAnother} className="btn-create-more">
                Create Another
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .create-class-page {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
        }
        .create-class-card {
          border-radius: 28px;
          background: white;
          transition: transform 0.3s, box-shadow 0.3s;
          border: none;
        }
        .create-class-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .create-icon-wrapper {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        .create-icon {
          font-size: 40px;
          color: white;
        }
        .form-input {
          border-radius: 14px;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s;
        }
        .form-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
          outline: none;
        }
        .btn-create {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          padding: 14px;
          border-radius: 14px;
          font-weight: 600;
          color: white;
          transition: all 0.3s;
        }
        .btn-create:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(79,70,229,0.3);
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
          border-radius: 32px;
          padding: 40px;
          text-align: center;
          max-width: 450px;
          width: 90%;
          animation: popIn 0.3s ease;
        }
        @keyframes popIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .success-icon {
          font-size: 72px;
          margin-bottom: 16px;
        }
        .success-modal h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 10px;
          color: #1e293b;
        }
        .success-modal p {
          color: #64748b;
          margin-bottom: 20px;
        }
        .code-display {
          background: #f1f5f9;
          padding: 16px 20px;
          border-radius: 16px;
          margin: 20px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
        }
        .code-text {
          font-size: 32px;
          font-weight: bold;
          letter-spacing: 6px;
          font-family: monospace;
          color: #4f46e5;
        }
        .copy-code-btn {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          color: white;
          padding: 10px 20px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .copy-code-btn:hover {
          transform: scale(1.02);
        }
        .modal-buttons {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        .btn-dashboard, .btn-create-more {
          flex: 1;
          padding: 12px;
          border-radius: 14px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .btn-dashboard {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
        }
        .btn-dashboard:hover {
          transform: translateY(-2px);
        }
        .btn-create-more {
          background: #f1f5f9;
          color: #475569;
        }
        .btn-create-more:hover {
          background: #e2e8f0;
        }
        @media (max-width: 768px) {
          .create-class-card { margin: 0 16px; padding: 20px !important; }
          .code-text { font-size: 24px; letter-spacing: 4px; }
          .modal-buttons { flex-direction: column; }
          .success-modal { padding: 30px 20px; }
        }
      `}</style>
    </div>
  );
}
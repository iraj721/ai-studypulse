import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import Toast from "../../../components/Toast";
import { 
  FaArrowLeft, FaFileAlt, FaCalendarAlt, FaEye, 
  FaPaperPlane, FaTrash, FaClock, FaCheckCircle,
  FaSpinner, FaUpload, FaFilePdf, FaFileWord, FaFileImage
} from "react-icons/fa";

export default function StudentAssignment() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState({});
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get(`/student/classes/${classId}/assignments`);
      setAssignments(res.data || []);
    } catch (err) {
      setToast({ message: "Failed to load assignments", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (assignmentId, type, value) => {
    setAnswers(prev => ({
      ...prev,
      [assignmentId]: { ...prev[assignmentId], [type]: value }
    }));
  };

  const handleFileChange = (assignmentId, file) => {
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        setToast({ message: "Invalid file type. Allowed: PDF, DOC, DOCX, TXT, JPG, PNG", type: "error" });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setToast({ message: "File too large. Max 10MB", type: "error" });
        return;
      }
      setAnswers(prev => ({
        ...prev,
        [assignmentId]: { ...prev[assignmentId], file: file, fileName: file.name }
      }));
    }
  };

  const submitAssignment = async (assignmentId) => {
    const answer = answers[assignmentId];
    if (!answer?.text && !answer?.file) {
      setToast({ message: "Please add answer text or upload a file", type: "error" });
      return;
    }

    setSubmitting(prev => ({ ...prev, [assignmentId]: true }));

    const data = new FormData();
    if (answer?.text) data.append("answerText", answer.text);
    if (answer?.file) data.append("file", answer.file);

    try {
      await api.post(`/student/classes/${classId}/assignments/${assignmentId}/submit`, data, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });
      setToast({ message: "Assignment submitted successfully!", type: "success" });
      setAnswers(prev => ({ ...prev, [assignmentId]: { text: "", file: null, fileName: "" } }));
      fetchAssignments();
    } catch (err) {
      console.error("Submit error:", err);
      setToast({ message: err.response?.data?.message || "Error submitting assignment", type: "error" });
    } finally {
      setSubmitting(prev => ({ ...prev, [assignmentId]: false }));
    }
  };

  const unsendAssignment = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to unsend your submission?")) return;
    try {
      await api.delete(`/student/classes/${classId}/assignments/${assignmentId}/unsend`);
      setToast({ message: "Submission unsent successfully!", type: "success" });
      fetchAssignments();
    } catch (err) {
      setToast({ message: "Error unsending submission", type: "error" });
    }
  };

  const openFile = (fileUrl) => {
    if (!fileUrl) return;
    const url = fileUrl.startsWith("http") ? fileUrl : `${import.meta.env.VITE_API_URL}${fileUrl}`;
    const viewer = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    window.open(viewer, "_blank");
  };

  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return <FaFileAlt />;
    if (fileUrl.includes('.pdf')) return <FaFilePdf />;
    if (fileUrl.includes('.doc') || fileUrl.includes('.docx')) return <FaFileWord />;
    if (fileUrl.includes('.jpg') || fileUrl.includes('.png') || fileUrl.includes('.jpeg')) return <FaFileImage />;
    return <FaFileAlt />;
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date() > new Date(dueDate);
  };

  const formatDate = (date) => {
    if (!date) return "No due date";
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="assign-loading">
        <div className="assign-spinner"></div>
        <p>Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="assign-root">
      {/* Background */}
      <div className="assign-bg" />
      <div className="assign-grid" />
      <div className="assign-orb assign-orb-a" />
      <div className="assign-orb assign-orb-b" />

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      {/* Main Content */}
      <main className="assign-main">
        <div className="assign-container">
          {/* Back Button */}
          <button className="assign-back" onClick={() => navigate(`/student/class/${classId}`)}>
            <FaArrowLeft /> Back to Class
          </button>

          {/* Header */}
          <div className="assign-header">
            <div className="assign-header-icon">
              <FaFileAlt />
            </div>
            <div>
              <h1 className="assign-title">Class <span className="assign-grad">Assignments</span></h1>
              <p className="assign-subtitle">Submit and track your assignment progress</p>
            </div>
          </div>

          {/* Assignments List */}
          {assignments.length === 0 ? (
            <div className="assign-empty">
              <div className="assign-empty-icon">📝</div>
              <h3>No Assignments Yet</h3>
              <p>Your teacher hasn't posted any assignments yet. Check back later!</p>
            </div>
          ) : (
            <div className="assign-list">
              {assignments.map((assignment) => {
                const dueDate = assignment.dueDate;
                const overdue = isOverdue(dueDate);
                const submitted = assignment.submitted;
                const submission = assignment.submission;
                const isSubmitting = submitting[assignment._id];
                const userAnswer = answers[assignment._id];

                return (
                  <div key={assignment._id} className="assign-card">
                    {/* Assignment Header */}
                    <div className="assign-card-header">
                      <div className="assign-card-title">
                        <h3>{assignment.title}</h3>
                        {submitted ? (
                          <span className="assign-badge submitted">
                            <FaCheckCircle /> Submitted
                          </span>
                        ) : overdue ? (
                          <span className="assign-badge overdue">
                            <FaClock /> Overdue
                          </span>
                        ) : dueDate ? (
                          <span className="assign-badge pending">
                            <FaClock /> Pending
                          </span>
                        ) : null}
                      </div>
                      
                      {dueDate && (
                        <div className={`assign-due ${overdue && !submitted ? 'overdue' : ''}`}>
                          <FaCalendarAlt /> Due: {formatDate(dueDate)}
                          {overdue && !submitted && <span className="overdue-text"> (Late)</span>}
                        </div>
                      )}
                      
                      {assignment.marks != null && (
                        <div className="assign-marks">Total Marks: {assignment.marks}</div>
                      )}
                    </div>

                    {/* Assignment Body */}
                    <div className="assign-card-body">
                      <p className="assign-instructions">{assignment.instructions}</p>
                      
                      {assignment.attachment && (
                        <button 
                          className="assign-attachment-btn" 
                          onClick={() => openFile(assignment.attachment)}
                        >
                          {getFileIcon(assignment.attachment)} View Assignment File
                        </button>
                      )}
                    </div>

                    {/* Submission Section */}
                    <div className="assign-submission-section">
                      {submitted ? (
                        <div className="submission-info">
                          <div className="submission-header">
                            <span className="submission-icon">✅</span>
                            <span className="submission-title">Your Submission</span>
                          </div>
                          
                          {submission?.marks != null && (
                            <div className="submission-marks">
                              Marks Obtained: <strong>{submission.marks} / {assignment.marks}</strong>
                              <div className="marks-percentage">
                                ({Math.round((submission.marks / assignment.marks) * 100)}%)
                              </div>
                            </div>
                          )}
                          
                          {submission?.answerText && (
                            <div className="submission-text">
                              <strong>Your Answer:</strong>
                              <p>{submission.answerText}</p>
                            </div>
                          )}
                          
                          {submission?.file && (
                            <button className="submission-file-btn" onClick={() => openFile(submission.file)}>
                              <FaEye /> View Your Submitted File
                            </button>
                          )}
                          
                          {!overdue && (
                            <button className="unsend-btn" onClick={() => unsendAssignment(assignment._id)}>
                              <FaTrash /> Unsend Submission
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="submission-form">
                          <div className="submission-form-title">
                            <FaPaperPlane /> Submit Your Work
                          </div>
                          
                          <textarea
                            className="submission-textarea"
                            placeholder="Write your answer here..."
                            value={userAnswer?.text || ""}
                            onChange={(e) => handleAnswerChange(assignment._id, "text", e.target.value)}
                            disabled={overdue}
                          />
                          
                          <div className="file-upload-area">
                            <input
                              type="file"
                              id={`file-${assignment._id}`}
                              className="file-input"
                              onChange={(e) => handleFileChange(assignment._id, e.target.files[0])}
                              disabled={overdue}
                              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                            />
                            <label htmlFor={`file-${assignment._id}`} className="file-label">
                              <FaUpload /> {userAnswer?.fileName ? userAnswer.fileName : "Choose file (PDF, DOC, DOCX, TXT, Image)"}
                            </label>
                            {userAnswer?.fileName && (
                              <button 
                                className="file-clear"
                                onClick={() => handleAnswerChange(assignment._id, "file", null)}
                              >
                                <FaTrash /> Remove
                              </button>
                            )}
                          </div>
                          
                          <button 
                            className="submit-btn"
                            onClick={() => submitAssignment(assignment._id)}
                            disabled={isSubmitting || overdue}
                          >
                            {isSubmitting ? (
                              <><FaSpinner className="spinner" /> Submitting...</>
                            ) : (
                              <><FaPaperPlane /> Submit Assignment</>
                            )}
                          </button>
                          
                          {overdue && (
                            <div className="overdue-message">
                              <FaClock /> Submission deadline has passed. You can no longer submit.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .assign-root {
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

        .assign-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }

        .assign-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background */
        .assign-bg {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.08) 0%, transparent 60%);
        }
        .assign-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image: linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .assign-orb {
          position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .assign-orb-a { width: 400px; height: 400px; top: -100px; left: 50%; transform: translateX(-50%); background: rgba(88, 130, 255, 0.06); animation: orbFloat 12s infinite; }
        .assign-orb-b { width: 250px; height: 250px; bottom: 10%; right: -5%; background: rgba(32, 230, 208, 0.04); animation: orbFloat2 10s infinite; }
        @keyframes orbFloat { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.1); } }
        @keyframes orbFloat2 { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }

        /* Loading */
        .assign-loading {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: #0a0c12;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .assign-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(88, 130, 255, 0.2);
          border-top-color: #5882ff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .assign-loading p { margin-top: 15px; color: #8e9cc4; }

        /* Main Content */
        .assign-main {
          position: relative;
          z-index: 10;
          max-width: 900px;
          margin: 0 auto;
          padding: 90px 2rem 3rem;
          min-height: 100vh;
        }

        /* Back Button */
        .assign-back {
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
        .assign-back:hover {
          background: rgba(88, 130, 255, 0.2);
          transform: translateX(-4px);
        }

        /* Header */
        .assign-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .assign-header-icon {
          width: 60px;
          height: 60px;
          background: rgba(88, 130, 255, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          color: var(--accent);
        }
        .assign-title {
          font-family: var(--fd);
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .assign-subtitle {
          color: var(--muted);
          font-size: 0.85rem;
        }

        /* Empty State */
        .assign-empty {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(17, 19, 24, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 24px;
        }
        .assign-empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
        .assign-empty h3 { margin-bottom: 0.5rem; color: var(--text); }
        .assign-empty p { color: var(--muted); }

        /* Assignments List */
        .assign-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .assign-card {
          background: rgba(17, 19, 24, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1.5rem;
          transition: all 0.3s;
        }
        .assign-card:hover {
          border-color: var(--border-h);
          transform: translateY(-2px);
        }
        .assign-card-header {
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .assign-card-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .assign-card-title h3 {
          font-size: 1.2rem;
          font-weight: 600;
        }
        .assign-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        .assign-badge.submitted { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        .assign-badge.overdue { background: rgba(239, 68, 68, 0.2); color: #f87171; }
        .assign-badge.pending { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
        .assign-due {
          font-size: 0.75rem;
          color: var(--faint);
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 0.25rem;
        }
        .assign-due.overdue { color: #f87171; }
        .overdue-text { font-weight: 600; }
        .assign-marks {
          font-size: 0.75rem;
          color: var(--accent);
        }
        .assign-card-body {
          margin-bottom: 1rem;
        }
        .assign-instructions {
          color: var(--muted);
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }
        .assign-attachment-btn {
          background: rgba(88, 130, 255, 0.1);
          border: 1px solid var(--border);
          color: var(--accent);
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 0.75rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .assign-attachment-btn:hover {
          background: rgba(88, 130, 255, 0.2);
        }

        /* Submission Section */
        .assign-submission-section {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .submission-info {
          background: rgba(255,255,255,0.02);
          border-radius: 16px;
          padding: 1rem;
        }
        .submission-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 0.75rem;
          font-weight: 600;
        }
        .submission-icon { font-size: 1.2rem; }
        .submission-title { font-size: 0.9rem; }
        .submission-marks {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 0.75rem;
          padding: 0.5rem;
          background: rgba(88, 130, 255, 0.1);
          border-radius: 12px;
        }
        .marks-percentage {
          font-size: 0.7rem;
          color: var(--success);
        }
        .submission-text {
          margin: 0.75rem 0;
          padding: 0.75rem;
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
        }
        .submission-text p {
          margin-top: 0.5rem;
          font-size: 0.85rem;
          color: var(--muted);
        }
        .submission-file-btn {
          background: rgba(88, 130, 255, 0.1);
          border: 1px solid var(--border);
          color: var(--accent);
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 0.75rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin: 0.5rem 0;
        }
        .unsend-btn {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 0.75rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 0.5rem;
        }
        .unsend-btn:hover {
          background: #ef4444;
          color: white;
        }
        .submission-form {
          background: rgba(255,255,255,0.02);
          border-radius: 16px;
          padding: 1rem;
        }
        .submission-form-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          margin-bottom: 1rem;
        }
        .submission-textarea {
          width: 100%;
          padding: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-size: 0.85rem;
          margin-bottom: 1rem;
          resize: vertical;
          font-family: inherit;
        }
        .submission-textarea:focus {
          outline: none;
          border-color: var(--accent);
        }
        .file-upload-area {
          margin-bottom: 1rem;
        }
        .file-input {
          display: none;
        }
        .file-label {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: rgba(88, 130, 255, 0.1);
          border: 1px solid var(--border);
          border-radius: 40px;
          padding: 10px;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .file-label:hover {
          background: rgba(88, 130, 255, 0.2);
        }
        .file-clear {
          margin-top: 0.5rem;
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #f87171;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          cursor: pointer;
        }
        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          border: none;
          color: white;
          padding: 12px;
          border-radius: 40px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          opacity: 0.9;
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .overdue-message {
          margin-top: 1rem;
          padding: 10px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 12px;
          text-align: center;
          font-size: 0.8rem;
          color: #f87171;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .spinner {
          animation: spin 0.8s linear infinite;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .assign-main { padding: 80px 1rem 2rem; }
          .assign-header { flex-direction: column; text-align: center; }
          .assign-title { font-size: 1.5rem; }
          .assign-header-icon { width: 50px; height: 50px; font-size: 1.5rem; }
          .assign-card-title { flex-direction: column; align-items: flex-start; }
          .assign-back { width: 100%; justify-content: center; }
          .submission-textarea { font-size: 0.8rem; }
          .file-label { font-size: 0.7rem; }
        }
      `}</style>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import Toast from "../../../components/Toast";
import { 
  FaArrowLeft, FaFolderOpen, FaFile, FaEye, 
  FaCalendarAlt, FaUserCircle, FaFilePdf, 
  FaFileWord, FaFileImage, FaFileAlt
} from "react-icons/fa";

export default function StudentMaterials() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await api.get(`/student/classes/${classId}/materials`);
      setMaterials(res.data);
    } catch (err) {
      setToast({ message: "Failed to load materials", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const openFile = (fileUrl) => {
    if (!fileUrl) {
      setToast({ message: "No file attached", type: "error" });
      return;
    }
    
    // Build full URL
    let fullUrl = fileUrl;
    if (!fileUrl.startsWith("http")) {
      fullUrl = `${import.meta.env.VITE_API_URL}${fileUrl}`;
    }
    
    // Use Google Docs Viewer for better preview
    const viewer = `https://docs.google.com/viewer?url=${encodeURIComponent(fullUrl)}&embedded=true`;
    window.open(viewer, "_blank");
  };

  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return <FaFileAlt />;
    const ext = fileUrl.toLowerCase();
    if (ext.includes('.pdf')) return <FaFilePdf />;
    if (ext.includes('.doc') || ext.includes('.docx')) return <FaFileWord />;
    if (ext.includes('.jpg') || ext.includes('.png') || ext.includes('.jpeg') || ext.includes('.gif')) return <FaFileImage />;
    return <FaFileAlt />;
  };

  const getFileTypeBadge = (fileUrl) => {
    if (!fileUrl) return "File";
    const ext = fileUrl.toLowerCase();
    if (ext.includes('.pdf')) return "PDF";
    if (ext.includes('.doc')) return "DOC";
    if (ext.includes('.docx')) return "DOCX";
    if (ext.includes('.ppt')) return "PPT";
    if (ext.includes('.pptx')) return "PPTX";
    if (ext.includes('.jpg') || ext.includes('.jpeg')) return "JPG";
    if (ext.includes('.png')) return "PNG";
    if (ext.includes('.txt')) return "TXT";
    return "File";
  };

  if (loading) {
    return (
      <div className="materials-loading">
        <div className="materials-spinner"></div>
        <p>Loading materials...</p>
      </div>
    );
  }

  return (
    <div className="materials-root">
      {/* Background */}
      <div className="materials-bg" />
      <div className="materials-grid" />
      <div className="materials-orb materials-orb-a" />
      <div className="materials-orb materials-orb-b" />

      {/* Toast */}
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      {/* Main Content */}
      <main className="materials-main">
        <div className="materials-container">
          {/* Back Button */}
          <button className="materials-back" onClick={() => navigate(`/student/class/${classId}`)}>
            <FaArrowLeft /> Back to Class
          </button>

          {/* Header */}
          <div className="materials-header">
            <div className="materials-header-icon">
              <FaFolderOpen />
            </div>
            <div>
              <h1 className="materials-title">Study <span className="materials-grad">Materials</span></h1>
              <p className="materials-subtitle">Access all your class resources in one place</p>
            </div>
          </div>

          {/* Materials List */}
          {materials.length === 0 ? (
            <div className="materials-empty">
              <div className="materials-empty-icon">📂</div>
              <h3>No Materials Available</h3>
              <p>Your teacher hasn't uploaded any study materials yet. Check back later!</p>
            </div>
          ) : (
            <div className="materials-grid">
              {materials.map((material) => (
                <div key={material._id} className="material-card">
                  <div className="material-card-icon">
                    {material.fileUrl ? getFileIcon(material.fileUrl) : <FaFileAlt />}
                  </div>
                  <div className="material-card-content">
                    <h3 className="material-title">{material.title}</h3>
                    {material.content && (
                      <p className="material-description">{material.content}</p>
                    )}
                    <div className="material-meta">
                      <div className="material-teacher">
                        <FaUserCircle /> {material.teacher?.name}
                      </div>
                      <div className="material-date">
                        <FaCalendarAlt /> {new Date(material.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    {material.fileUrl && (
                      <div className="material-actions">
                        <button 
                          className="material-view-btn"
                          onClick={() => openFile(material.fileUrl)}
                        >
                          <FaEye /> View {getFileTypeBadge(material.fileUrl)}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .materials-root {
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
        }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        .materials-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }

        .materials-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background */
        .materials-bg {
          position: fixed; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.08) 0%, transparent 60%);
        }
        .materials-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image: linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .materials-orb {
          position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .materials-orb-a { width: 400px; height: 400px; top: -100px; left: 50%; transform: translateX(-50%); background: rgba(88, 130, 255, 0.06); animation: orbFloat 12s infinite; }
        .materials-orb-b { width: 250px; height: 250px; bottom: 10%; right: -5%; background: rgba(32, 230, 208, 0.04); animation: orbFloat2 10s infinite; }
        @keyframes orbFloat { 0%,100% { transform: translateX(-50%) scale(1); } 50% { transform: translateX(-50%) scale(1.1); } }
        @keyframes orbFloat2 { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }

        /* Loading */
        .materials-loading {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: #0a0c12;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .materials-spinner {
          width: 50px;
          height: 50px;
          border: 3px solid rgba(88, 130, 255, 0.2);
          border-top-color: #5882ff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .materials-loading p { margin-top: 15px; color: #8e9cc4; }

        /* Main Content */
        .materials-main {
          position: relative;
          z-index: 10;
          max-width: 1000px;
          margin: 0 auto;
          padding: 90px 2rem 3rem;
          min-height: 100vh;
        }

        /* Back Button */
        .materials-back {
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
        .materials-back:hover {
          background: rgba(88, 130, 255, 0.2);
          transform: translateX(-4px);
        }

        /* Header */
        .materials-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .materials-header-icon {
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
        .materials-title {
          font-family: var(--fd);
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }
        .materials-subtitle {
          color: var(--muted);
          font-size: 0.85rem;
        }

        /* Empty State */
        .materials-empty {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(17, 19, 24, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 24px;
        }
        .materials-empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; }
        .materials-empty h3 { margin-bottom: 0.5rem; color: var(--text); }
        .materials-empty p { color: var(--muted); }

        /* Materials Grid */
        .materials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        .material-card {
          background: rgba(17, 19, 24, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1.5rem;
          transition: all 0.3s;
          display: flex;
          gap: 1rem;
        }
        .material-card:hover {
          border-color: var(--border-h);
          transform: translateY(-4px);
          background: rgba(88, 130, 255, 0.05);
        }
        .material-card-icon {
          font-size: 2.5rem;
          color: var(--accent);
          min-width: 50px;
          text-align: center;
        }
        .material-card-content {
          flex: 1;
        }
        .material-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text);
        }
        .material-description {
          font-size: 0.85rem;
          color: var(--muted);
          margin-bottom: 0.75rem;
          line-height: 1.4;
        }
        .material-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
          font-size: 0.7rem;
          color: var(--faint);
        }
        .material-teacher, .material-date {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .material-actions {
          margin-top: 0.5rem;
        }
        .material-view-btn {
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
        .material-view-btn:hover {
          background: rgba(88, 130, 255, 0.2);
          transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .materials-main { padding: 80px 1rem 2rem; }
          .materials-header { flex-direction: column; text-align: center; }
          .materials-title { font-size: 1.5rem; }
          .materials-header-icon { width: 50px; height: 50px; font-size: 1.5rem; }
          .materials-back { width: 100%; justify-content: center; }
          .materials-grid { grid-template-columns: 1fr; }
          .material-card { flex-direction: column; text-align: center; }
          .material-meta { justify-content: center; }
          .material-view-btn { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
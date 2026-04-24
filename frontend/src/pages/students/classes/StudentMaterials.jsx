import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../services/api";
import Stars from "../../../components/Stars";
import BackButton from "../../../components/BackButton";
import Toast from "../../../components/Toast";

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace("/api", "");

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
    if (!fileUrl) return;
    const url = fileUrl.startsWith("http") ? fileUrl : `${BASE_URL}${fileUrl}`;
    const viewer = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    window.open(viewer, "_blank");
  };

  if (loading) return <div className="text-center mt-5 text-white">Loading...</div>;

  return (
    <div className="materials-bg min-vh-100 position-relative py-5">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container">
        <BackButton to={`/student/class/${classId}`} label="← Back to Class" />

        <h3 className="mb-4 text-white">📂 Class Materials</h3>

        {materials.length === 0 ? (
          <p className="text-light-opacity">No materials uploaded yet.</p>
        ) : (
          materials.map((m) => (
            <div key={m._id} className="material-card mb-3 shadow-sm p-4">
              <h5>{m.title}</h5>
              {m.content && <p className="text-light-opacity mb-2">{m.content}</p>}
              {m.fileUrl && (
                <button className="btn btn-sm btn-outline-primary" onClick={() => openFile(m.fileUrl)}>
                  📎 View File
                </button>
              )}
              <small className="text-light-opacity d-block mt-2">
                Posted by {m.teacher?.name} on {new Date(m.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </div>

      <style>{`
        .materials-bg {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #5a77a3 100%);
        }
        .text-light-opacity { color: rgba(255,255,255,0.8); }
        .material-card {
          border-radius: 16px;
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
          color: black;
          transition: all 0.3s;
        }
        .material-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
        @media (max-width: 768px) {
          .material-card { padding: 16px; }
          .btn-outline-primary { width: 100%; }
        }
      `}</style>
    </div>
  );
}
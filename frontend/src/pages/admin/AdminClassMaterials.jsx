import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";

export default function AdminClassMaterials() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classInfo, setClassInfo] = useState(null);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const res = await apiAdmin.get(`/admin/classes/${classId}`);
      setClassInfo(res.data);
      setMaterials(res.data.materials || []);
    } catch (err) {
      console.error("❌ API ERROR:", err);
      alert("Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  const openFile = (fileUrl) => {
    if (!fileUrl) return;
    const url = fileUrl.startsWith("http")
      ? fileUrl
      : `${import.meta.env.VITE_API_URL}${fileUrl}`;
    const viewer = `https://docs.google.com/viewer?url=${encodeURIComponent(
      url
    )}&embedded=true`;
    window.open(viewer, "_blank");
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4">
      <button onClick={() => navigate(-1)} className="btn btn-secondary mb-3">
        ⬅ Back
      </button>

      <h2>📂 Materials - {classInfo?.name}</h2>

      {materials.length === 0 ? (
        <p className="text-muted">No materials uploaded yet.</p>
      ) : (
        <div className="row g-3">
          {materials.map((m) => (
            <div className="col-md-4" key={m._id}>
              <div className="card shadow-sm border-0 hover-card h-100">
                <div className="card-body">
                  <h5 className="fw-bold">{m.title}</h5>
                  {m.content && <p>{m.content}</p>}
                  {m.fileUrl && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => openFile(m.fileUrl)}
                    >
                      📎 View File
                    </button>
                  )}
                  <small className="text-muted d-block mt-2">
                    Posted by {m.teacher?.name} on{" "}
                    {new Date(m.createdAt).toLocaleString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .hover-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }
      `}</style>
    </div>
  );
}

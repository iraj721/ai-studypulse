import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Spinner from "../../components/Spinner";

const BASE_URL = import.meta.env.VITE_API_URL.replace(/\/$/, "");

export default function ClassMaterials() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [materials, setMaterials] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit / Delete states
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editFile, setEditFile] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [classRes, userRes] = await Promise.all([
        api.get(`/teacher/classes/${id}`),
        api.get("/auth/me"),
      ]);
      setMaterials(classRes.data.materials || []);
      setClassName(classRes.data.name);
      setUserRole(userRes.data.role);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadMaterial = async () => {
    if (!title.trim()) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (file) formData.append("file", file);

    await api.post(`/teacher/classes/${id}/material`, formData);
    setTitle("");
    setContent("");
    setFile(null);
    fetchData();
  };

  const openFile = (fileUrl) => {
    if (!fileUrl) return;
    const absoluteUrl = fileUrl.startsWith("http") ? fileUrl : `${BASE_URL}${fileUrl}`;
    window.open(
      `https://docs.google.com/viewer?url=${encodeURIComponent(absoluteUrl)}&embedded=true`,
      "_blank"
    );
  };

  const openEditModal = (m) => {
    setSelectedMaterial(m);
    setEditTitle(m.title);
    setEditContent(m.content || "");
    setEditFile(null);
    setShowEdit(true);
  };

  const updateMaterial = async () => {
    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("content", editContent);
    if (editFile) formData.append("file", editFile);

    await api.put(
      `/teacher/classes/${id}/material/${selectedMaterial._id}`,
      formData
    );

    setShowEdit(false);
    fetchData();
  };

  const deleteMaterial = async () => {
    await api.delete(
      `/teacher/classes/${id}/material/${selectedMaterial._id}`
    );
    setShowDelete(false);
    fetchData();
  };

  if (loading) return <Spinner message="Loading materials..." />;

  const indexOfLast = currentPage * itemsPerPage;
  const currentMaterials = materials.slice(indexOfLast - itemsPerPage, indexOfLast);
  const totalPages = Math.ceil(materials.length / itemsPerPage);
  const isTeacher = userRole === "teacher";

  return (
    <div className="container py-5">
      <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      <div
        className="card mb-4 border-0"
        style={{
          background: "linear-gradient(135deg, #598edcff, #4f8cff)",
          color: "#fff",
          boxShadow: "0 10px 25px rgba(13,110,253,0.25)",
          borderRadius: "12px",
        }}
      >
        <div className="card-body d-flex justify-content-between align-items-center">
          <h3 className="fw-bold mb-0">📂 Materials — {className}</h3>
          <span className="badge bg-light text-dark">{materials.length}</span>
        </div>
      </div>

      {isTeacher && (
        <div className="card mb-4 shadow-sm border-0 p-3">
          <input className="form-control mb-2" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="form-control mb-2" rows="3" placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
          <input type="file" className="form-control mb-2" onChange={(e) => setFile(e.target.files[0])} />
          <button className="btn btn-info" onClick={uploadMaterial}>Upload Material</button>
        </div>
      )}

      <div className="row g-3">
        {currentMaterials.map((m) => (
          <div key={m._id} className="col-md-6">
            <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
              <div className="card-body">
                <h5>{m.title}</h5>
                {m.content && <p className="text-muted">{m.content}</p>}
                {m.fileUrl && (
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openFile(m.fileUrl)}>
                    📎 View
                  </button>
                )}
                {isTeacher && (
                  <>
                    <button className="btn btn-sm btn-outline-warning me-2" onClick={() => openEditModal(m)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => { setSelectedMaterial(m); setShowDelete(true); }}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT MODAL */}
      {showEdit && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Edit Material</h5>
                <button className="btn-close" onClick={() => setShowEdit(false)} />
              </div>
              <div className="modal-body">
                <input className="form-control mb-2" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                <textarea className="form-control mb-2" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                <input type="file" className="form-control" onChange={(e) => setEditFile(e.target.files[0])} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={updateMaterial}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDelete && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-body text-center">
                <p>Delete this material?</p>
                <button className="btn btn-danger me-2" onClick={deleteMaterial}>Delete</button>
                <button className="btn btn-secondary" onClick={() => setShowDelete(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center gap-2 mt-4">
          <button className="btn btn-outline-secondary btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>⬅</button>
          <span>{currentPage} / {totalPages}</span>
          <button className="btn btn-outline-secondary btn-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>➡</button>
        </div>
      )}
    </div>
  );
}

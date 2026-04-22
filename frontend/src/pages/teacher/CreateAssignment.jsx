import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Spinner from "../../components/Spinner";

export default function CreateAssignment() {
  const { id } = useParams(); // class ID
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [marks, setMarks] = useState(""); // ✅ new field
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !instructions) {
      alert("Title and Instructions are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("instructions", instructions);
    formData.append("marks", marks || ""); // ✅ marks optional
    if (dueDate) formData.append("dueDate", dueDate);
    if (file) formData.append("attachment", file); // ✅ backend expects "attachment"

    try {
      setLoading(true);
      await api.post(`/teacher/classes/${id}/assignments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Assignment created successfully!");
      navigate(`/teacher/classes/${id}/assignments`);
    } catch (err) {
      console.error(err);
      alert("Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner message="Creating assignment..." />;

  return (
    <div className="container py-5">
      {/* Back Button */}
      <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      {/* Header */}
      <div
        className="card mb-4 border-0 shadow-sm"
        style={{
          borderRadius: "12px",
          background: "linear-gradient(135deg, #598edcff, #4f8cff)",
          color: "#fff",
          boxShadow: "0 10px 25px rgba(13,110,253,0.25)",
        }}
      >
        <div className="card-body">
          <h3 className="fw-bold mb-0">+ Create Assignment</h3>
        </div>
      </div>

      {/* Form Card */}
      <div className="card shadow-sm border-0 p-4" style={{ borderRadius: "12px" }}>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Title</label>
            <input
              type="text"
              className="form-control shadow-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter assignment title"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Instructions</label>
            <textarea
              className="form-control shadow-sm"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              required
              placeholder="Enter assignment instructions"
              rows={4}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Due Date</label>
            <input
              type="date"
              className="form-control shadow-sm"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* ✅ Marks */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Total Marks (optional)</label>
            <input
              type="number"
              className="form-control shadow-sm"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              placeholder="Enter total marks for assignment"
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Attachment (optional)</label>
            <input
              type="file"
              className="form-control shadow-sm"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ minWidth: "150px" }}>
            Create Assignment
          </button>
        </form>
      </div>
    </div>
  );
}

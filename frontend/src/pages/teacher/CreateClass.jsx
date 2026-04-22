import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Spinner from "../../components/Spinner";

export default function CreateClass() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", subject: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.subject.trim()) return alert("Class name and subject are required");

    setLoading(true);
    try {
      const res = await api.post("/teacher/classes", form);
      alert(`Class created! Code: ${res.data.code}`);
      navigate(`/teacher/classes/${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create class");
    } finally {
      setLoading(false);
    }
  };

    if (loading) return <Spinner message="Creating Class..." />;

  return (
    <div className="container py-5">
      {/* Header */}
      <div
        className="card border-0 mb-4"
        style={{
          background: "linear-gradient(135deg, #598edcff, #4f8cff)",
          color: "#fff",
          boxShadow: "0 10px 25px rgba(13,110,253,0.25)",
        }}
      >
        <div className="card-body">
          <h2 className="fw-bold mb-1">➕ Create New Class</h2>
          <p className="mb-0 opacity-75">Fill in the details below to create a class.</p>
        </div>
      </div>

      {/* Form Card */}
      <div
        className="card border-0 shadow-sm p-4"
        style={{ maxWidth: "600px", margin: "0 auto", borderRadius: "12px" }}
      >
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Class Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              className="form-control border-primary border-opacity-50 shadow-sm"
              placeholder="Enter class name"
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
              className="form-control border-primary border-opacity-50 shadow-sm"
              placeholder="Enter subject"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary px-4 fw-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Creating...
              </>
            ) : (
              "Create Class"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

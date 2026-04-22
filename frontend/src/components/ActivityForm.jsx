import React, { useState } from "react";
import api from "../services/api";

export default function ActivityForm({ onAdded }) {
  const [form, setForm] = useState({ subject: "", topic: "", durationMinutes: "", notes: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/activities", form);
      setForm({ subject: "", topic: "", durationMinutes: "", notes: "" });
      if (onAdded) onAdded();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add activity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm mb-3 p-3 hover-card border-start border-4 border-success">
      <h5 className="text-success">Add Activity</h5>
      <form onSubmit={handleAdd}>
        <input name="subject" className="form-control mb-2" placeholder="Subject" value={form.subject} onChange={onChange} required />
        <input name="topic" className="form-control mb-2" placeholder="Topic" value={form.topic} onChange={onChange} required />
        <input name="durationMinutes" type="number" className="form-control mb-2" placeholder="Duration (min)" value={form.durationMinutes} onChange={onChange} />
        <textarea name="notes" className="form-control mb-2" placeholder="Notes" value={form.notes} onChange={onChange} rows={3} />
        <button className="btn btn-success w-100" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add"}
        </button>
      </form>
    </div>
  );
}

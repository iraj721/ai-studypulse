import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";

export default function AdminClassAnnouncements() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
    // eslint-disable-next-line
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await apiAdmin.get(`/admin/classes/${classId}`);
      setAnnouncements(res.data.announcements || []);
      setClassName(res.data.name);
    } catch (err) {
      console.error(err);
      alert("Failed to load announcements");
      navigate("/admin/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="text-center mt-5">Loading announcements...</div>;

  return (
    <div className="container mt-4">
      <button
        className="btn btn-outline-secondary mb-3"
        onClick={() => navigate(-1)}
      >
        ⬅ Back
      </button>

      <h3 className="mb-4">📢 Announcements — {className}</h3>

      {announcements.length === 0 ? (
        <div className="text-muted">No announcements yet.</div>
      ) : (
        announcements.map((a) => (
          <div key={a._id} className="card mb-3 shadow-sm">
            <div className="card-body">
              <p className="mb-1">{a.text}</p>
              <small className="text-muted">
                {new Date(a.createdAt).toLocaleString()}
              </small>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

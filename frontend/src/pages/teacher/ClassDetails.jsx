import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

export default function ClassDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClass();
  }, []);

  const fetchClass = async () => {
    try {
      const res = await api.get(`/teacher/classes/${id}`);
      setCls(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch class");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="text-muted mt-2">Loading class details...</p>
      </div>
    );

  if (!cls)
    return (
      <div className="text-center my-5">
        <h5>Class not found ❌</h5>
      </div>
    );

  return (
    <div className="container py-5">
      <button
        className="btn btn-outline-secondary mb-4"
        onClick={() => navigate(-1)}
      >
        ⬅ Back
      </button>
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
          <h2 className="fw-bold mb-1">
            📘 {cls.name} — {cls.subject}
          </h2>
          <p className="mb-0 opacity-75">
            Manage class activities & track student progress
          </p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="row g-4">
        {[
          {
            title: "Students",
            emoji: "👩‍🎓",
            desc: `${cls.students?.length || 0} joined`,
            link: "students",
            color: "#6f42c1",
          },
          {
            title: "Announcements",
            emoji: "📢",
            desc: "View & Post",
            link: "announcements",
            color: "#d63384",
          },
          {
            title: "Assignments",
            emoji: "📝",
            desc: "Create & Review",
            link: "assignments",
            color: "#fd7e14",
          },
          {
            title: "Materials",
            emoji: "📂",
            desc: "Notes & Files",
            link: "materials",
            color: "#198754",
          },
        ].map((item) => (
          <div key={item.title} className="col-sm-6 col-lg-3">
            <div
              className="card h-100 text-center border-0"
              style={{
                cursor: "pointer",
                borderRadius: "15px",
                background: "#fff",
                boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                transition:
                  "transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
              }}
              onClick={() => navigate(`/teacher/classes/${id}/${item.link}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px)";
                e.currentTarget.style.boxShadow =
                  "0 14px 30px rgba(0,0,0,0.18)";
                e.currentTarget.style.background = "#f8f9fa";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(0,0,0,0.1)";
                e.currentTarget.style.background = "#fff";
              }}
            >
              <div
                className="card-body d-flex flex-column align-items-center justify-content-center"
                style={{ padding: "2rem 1rem" }}
              >
                <div
                  style={{
                    fontSize: "2.5rem",
                    marginBottom: "1rem",
                    color: item.color,
                  }}
                >
                  {item.emoji}
                </div>
                <h5 className="fw-semibold mb-1">{item.title}</h5>
                <p className="text-muted mb-0">{item.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

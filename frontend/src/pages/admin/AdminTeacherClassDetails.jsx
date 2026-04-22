import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";

export default function AdminTeacherClassDetails() {
  const { classId } = useParams();
  const navigate = useNavigate();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassDetails();
  }, []);

  const fetchClassDetails = async () => {
    try {
      const res = await apiAdmin.get(`/admin/teacher/classes/${classId}`);
      setClassData(res.data);
    } catch (err) {
      console.error("Class details error:", err);
      alert("Failed to load class details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading class details...</div>;
  }

  if (!classData) {
    return <div className="text-center mt-5">Class not found.</div>;
  }

  const { name, subject, students, materials, announcements, assignments } =
    classData;

  const cards = [
    {
      title: "Students",
      icon: "👨‍🎓",
      count: students?.length || 0,
      path: "students",
    },
    {
      title: "Materials",
      icon: "📁",
      count: materials?.length || 0,
      path: "materials",
    },
    {
      title: "Announcements",
      icon: "📢",
      count: announcements?.length || 0,
      path: "announcements",
    },
    {
      title: "Assignments",
      icon: "📝",
      count: assignments?.length || 0,
      path: "assignments",
    },
  ];

  return (
    <div className="container py-5">
      {/* BACK BUTTON */}
      <button
        className="btn btn-secondary mb-4"
        onClick={() => navigate(-1)}
      >
        ⬅ Back
      </button>

      {/* CLASS HEADER */}
      <h2 className="mb-1">📘 {name}</h2>
      <p className="text-muted">{subject}</p>

      {/* CLICKABLE CARDS */}
      <div className="row g-4 mt-4">
        {cards.map((card, idx) => (
          <div key={idx} className="col-sm-6 col-lg-3">
            <div
              className="card h-100 border-0 shadow-sm text-center"
              style={{ cursor: "pointer" }}
              onClick={() =>
                navigate(
                  `/admin/teacher/class/${classId}/${card.path}`
                )
              }
            >
              <div className="card-body d-flex flex-column justify-content-center">
                <div style={{ fontSize: "40px" }}>{card.icon}</div>
                <h5 className="mt-2">{card.title}</h5>
                <p className="text-muted mb-0">
                  {card.count} item{card.count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

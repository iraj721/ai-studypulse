import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";

export default function AdminStudentClassDetails() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassDetails();
  }, []);

  const fetchClassDetails = async () => {
    try {
      const res = await apiAdmin.get(`/admin/classes/${classId}`);
      setClassData(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load class details");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!classData) return <div className="text-center mt-5">Class not found</div>;

  return (
    <div className="container py-5">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      <h2>📘 {classData.name}</h2>
      <p className="text-muted">{classData.subject}</p>
      <p>Teacher: {classData.teacher?.name}</p>

      <div className="row g-3 mt-3">
        <div className="col-md-4">
          <div className="card text-center p-3">
            <h3>👨‍🎓</h3>
            <h5>Students</h5>
            <p>{classData.students?.length || 0}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center p-3">
            <h3>📝</h3>
            <h5>Assignments</h5>
            <p>{classData.assignments?.length || 0}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-center p-3">
            <h3>📁</h3>
            <h5>Materials</h5>
            <p>{classData.materials?.length || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
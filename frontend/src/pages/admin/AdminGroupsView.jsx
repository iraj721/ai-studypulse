import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";
import Stars from "../../components/Stars";
import BackButton from "../../components/BackButton";

export default function AdminGroupsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await apiAdmin.get(`/admin/students/${id}/groups`);
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100 py-4">
        <div className="container text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Loading study groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        <BackButton to={`/admin/users/${id}`} label="← Back to User Details" />
        <h3 className="mb-4 fw-bold">👥 Student Study Groups</h3>
        <p className="text-muted mb-4">Total: {groups.length} groups</p>
        
        {groups.length === 0 ? (
          <div className="alert alert-info text-center">No study groups found for this student.</div>
        ) : (
          <div className="row g-3">
            {groups.map((group) => (
              <div key={group._id} className="col-md-6">
                <div className="card shadow-sm border-0 hover-card">
                  <div className="card-body">
                    <h5 className="fw-bold">{group.name}</h5>
                    <p className="text-muted small mb-2">{group.description || "No description"}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="badge bg-primary">Code: {group.code}</span>
                      <span className="badge bg-secondary">Members: {group.members?.length || 0}</span>
                    </div>
                    <hr />
                    <small className="text-muted">
                      Created: {new Date(group.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
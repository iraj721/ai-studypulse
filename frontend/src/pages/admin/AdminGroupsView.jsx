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
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">👥 Student Study Groups</h3>
          <span className="badge bg-primary fs-6">{groups.length} Groups</span>
        </div>

        {groups.length === 0 ? (
          <div className="alert alert-info text-center py-5">
            <div className="fs-1 mb-3">👥</div>
            <h5>No Study Groups Found</h5>
            <p>This student hasn't joined any study groups yet.</p>
          </div>
        ) : (
          <div className="row g-4">
            {groups.map((group) => (
              <div key={group._id} className="col-md-6 col-lg-4">
                <div className="group-admin-card">
                  <div className="group-code-badge">Code: {group.code}</div>
                  <h5 className="group-name">{group.name}</h5>
                  <p className="group-description">{group.description || "No description"}</p>
                  <div className="group-stats">
                    <span>👤 Created by: {group.createdBy?.name}</span>
                    <span>👥 Members: {group.members?.length || 0}</span>
                  </div>
                  <div className="group-date">
                    📅 {new Date(group.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .group-admin-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          position: relative;
          height: 100%;
        }
        .group-admin-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 25px rgba(0,0,0,0.15);
        }
        .group-code-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background: #e0e7ff;
          color: #4f46e5;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
        }
        .group-name {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 10px;
          color: #1e293b;
          padding-right: 70px;
        }
        .group-description {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 15px;
        }
        .group-stats {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #64748b;
          margin-bottom: 10px;
          padding-top: 10px;
          border-top: 1px solid #e2e8f0;
        }
        .group-date {
          font-size: 10px;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
}
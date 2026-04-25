import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";
// import BackButton from "../../components/BackButton";
import Toast from "../../components/Toast";
import { FaArrowLeft } from "react-icons/fa";

export default function AdminGroupsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchGroups();
  }, [id]);

  const fetchGroups = async () => {
    try {
      const res = await apiAdmin.get(`/admin/students/${id}/groups`);
      setGroups(res.data);
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to load groups", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleGroupClick = (groupId) => {
    navigate(`/admin/group/${groupId}`);
  };

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="container text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Loading study groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: "", type: "success" })} 
      />
      
      <div className="container py-4">
        {/* Back Button */}
        <div className="mb-3">
          <button 
            onClick={() => navigate(`/admin/users/${id}`)} 
            className="btn btn-outline-secondary btn-sm"
          >
            <FaArrowLeft className="me-1" /> Back to User Details
          </button>
        </div>
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold mb-0">👥 Student Study Groups</h3>
          <span className="badge bg-primary fs-6">{groups.length} Groups</span>
        </div>

        {groups.length === 0 ? (
          <div className="card text-center py-5">
            <div className="card-body">
              <div className="fs-1 mb-3">👥</div>
              <h5>No Study Groups Found</h5>
              <p className="text-muted">This student hasn't joined any study groups yet.</p>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {groups.map((group) => (
              <div key={group._id} className="col-md-6 col-lg-4">
                <div 
                  className="group-admin-card clickable"
                  onClick={() => handleGroupClick(group._id)}
                >
                  <div className="group-code-badge">Code: {group.code}</div>
                  <h5 className="group-name">{group.name}</h5>
                  <p className="group-description">{group.description || "No description"}</p>
                  <div className="group-stats">
                    <span>👤 Created by: {group.createdBy?.name}</span>
                    <span>👥 Members: {group.members?.length || 0}</span>
                  </div>
                  <div className="group-date">
                    📅 Created: {new Date(group.createdAt).toLocaleDateString()}
                  </div>
                  <div className="group-click-hint">
                    Click to view chats and shared content →
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .admin-page-container {
          background: #f0f2f5;
          min-height: 100vh;
        }
        .group-admin-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          transition: all 0.3s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          position: relative;
          height: 100%;
          cursor: pointer;
        }
        .group-admin-card.clickable:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 25px rgba(0,0,0,0.15);
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
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
        .group-click-hint {
          margin-top: 12px;
          font-size: 11px;
          color: #4f46e5;
          text-align: right;
          opacity: 0.7;
        }
        .group-admin-card:hover .group-click-hint {
          opacity: 1;
        }
        .btn-outline-secondary {
          border-radius: 20px;
          padding: 6px 16px;
        }
        .card {
          border: none;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
      `}</style>
    </div>
  );
}
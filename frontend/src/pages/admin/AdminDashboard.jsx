import React, { useEffect, useState } from "react";
import apiAdmin from "../../services/apiAdmin";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await apiAdmin.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      navigate("/admin/login");
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await apiAdmin.delete(`/admin/users/${userToDelete._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== userToDelete._id));
      setUserToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert("❌ Failed to delete user");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const teacherCount = users.filter((u) => u.role === "teacher").length;
  const studentCount = users.filter((u) => u.role === "student").length;

  return (
    <div className="admin-wrapper min-vh-100">
      <div className="container py-3 py-md-4">
        {/* HEADER */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
          <div>
            <h2 className="fw-bold fs-3 fs-md-2">👑 Admin Dashboard</h2>
            <small className="text-muted">System control & role management</small>
          </div>
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={logout}>
            Logout
          </button>
        </div>

        {/* STATS CARDS - Fully Responsive Grid */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <StatCard title="👥 Total Users" value={totalUsers} />
          </div>
          <div className="col-6 col-md-3">
            <StatCard title="🛡️ Admins" value={adminCount} color="purple" />
          </div>
          <div className="col-6 col-md-3">
            <StatCard title="👨‍🏫 Teachers" value={teacherCount} color="blue" />
          </div>
          <div className="col-6 col-md-3">
            <StatCard title="🎓 Students" value={studentCount} color="green" />
          </div>
        </div>

        {/* FILTERS */}
        <div className="card shadow-sm mb-3 border-0">
          <div className="card-body d-flex flex-column flex-md-row gap-3">
            <div className="flex-grow-1">
              <label className="small text-muted">🔍 Search Users</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ minWidth: "180px" }}>
              <label className="small text-muted">🎭 Role Filter</label>
              <select
                className="form-control"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">🛡️ Admin</option>
                <option value="teacher">👨‍🏫 Teacher</option>
                <option value="student">🎓 Student</option>
              </select>
            </div>
          </div>
        </div>

        {/* USERS SECTION - Desktop Table, Mobile Cards */}
        <div className="card admin-card shadow-sm border-0">
          <div className="card-header fw-semibold">👤 Registered Users</div>

          {/* Desktop View - Table (hidden on mobile) */}
          <div className="d-none d-md-block table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td className="fw-semibold">{u.name}</td>
                    <td className="text-muted">{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role}`}>
                        {u.role === "admin" && "🛡️ Admin"}
                        {u.role === "teacher" && "👨‍🏫 Teacher"}
                        {u.role === "student" && "🎓 Student"}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => navigate(`/admin/users/${u._id}`)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setUserToDelete(u)}
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
                {!filteredUsers.length && (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View - Cards (visible only on mobile) */}
          <div className="d-block d-md-none">
            {filteredUsers.length === 0 ? (
              <div className="text-center text-muted py-4">No users found</div>
            ) : (
              <div className="p-3">
                {filteredUsers.map((u) => (
                  <div key={u._id} className="user-card-mobile mb-3 p-3 border rounded-3 shadow-sm">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="fw-bold mb-1">{u.name}</h6>
                        <span className={`role-badge ${u.role} mb-2 d-inline-block`}>
                          {u.role === "admin" && "🛡️ Admin"}
                          {u.role === "teacher" && "👨‍🏫 Teacher"}
                          {u.role === "student" && "🎓 Student"}
                        </span>
                      </div>
                      <small className="text-muted">{new Date(u.createdAt).toLocaleDateString()}</small>
                    </div>
                    <div className="text-muted small mb-3">
                      <div>📧 {u.email}</div>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary flex-grow-1"
                        onClick={() => navigate(`/admin/users/${u._id}`)}
                      >
                        View Details
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setUserToDelete(u)}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {userToDelete && (
        <>
          <div
            className="delete-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setUserToDelete(null)}
          >
            <div
              className="delete-modal bg-white rounded-3 shadow-lg"
              style={{ width: "320px", maxWidth: "90%" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <h6 className="fw-bold mb-2 text-danger">⚠️ Delete User</h6>
                <p className="mb-3">
                  Are you sure you want to delete <strong>{userToDelete.name}</strong>?
                  <br />
                  <span className="text-danger small">This action cannot be undone.</span>
                </p>
                <div className="d-flex justify-content-end gap-2">
                  <button className="btn btn-sm btn-secondary" onClick={() => setUserToDelete(null)}>
                    Cancel
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={handleDelete}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* STYLES */}
      <style>{`
        .admin-wrapper {
          background: #f4f6fb;
          min-height: 100vh;
        }
        .admin-card {
          border-radius: 14px;
          overflow: hidden;
        }
        .role-badge {
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
          display: inline-block;
        }
        .role-badge.admin { background: #ede9fe; color: #6d28d9; }
        .role-badge.teacher { background: #e0f2fe; color: #0369a1; }
        .role-badge.student { background: #e2e8f0; color: #334155; }
        
        /* Mobile User Card Styles */
        .user-card-mobile {
          background: white;
          transition: all 0.2s ease;
        }
        .user-card-mobile:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.1) !important;
        }
        
        .delete-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .delete-modal {
          animation: fadeInScale 0.2s ease;
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        
        /* Responsive */
        @media (max-width: 576px) {
          .container { padding-left: 12px; padding-right: 12px; }
          .admin-wrapper h2 { font-size: 1.5rem; }
          .user-card-mobile { padding: 12px !important; }
          .user-card-mobile h6 { font-size: 1rem; }
        }
      `}</style>
    </div>
  );
}

/* STAT CARD Component */
function StatCard({ title, value, color }) {
  const colors = {
    purple: "#7c3aed",
    green: "#0f766e",
    blue: "#0284c7",
    default: "#1e293b",
  };

  return (
    <div className="card shadow-sm border-0 p-2 p-md-3 h-100 text-center">
      <h6 className="text-muted small mb-1">{title}</h6>
      <h3 className="fw-bold mb-0" style={{ color: colors[color] || colors.default, fontSize: "clamp(1.5rem, 5vw, 2rem)" }}>
        {value}
      </h3>
    </div>
  );
}
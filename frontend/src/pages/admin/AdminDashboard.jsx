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

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      const res = await apiAdmin.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      navigate("/admin/login");
    }
  };

  /* ================= LOGOUT ================= */
  const logout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  /* ================= DELETE USER ================= */
  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      console.log("DELETE USER ID:", userToDelete._id);

      await apiAdmin.delete(`/admin/users/${userToDelete._id}`);

      setUsers((prev) => prev.filter((u) => u._id !== userToDelete._id));

      setUserToDelete(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert("❌ Failed to delete user");
    }
  };

  /* ================= FILTERS ================= */
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchRole = roleFilter === "all" || u.role === roleFilter;

    return matchSearch && matchRole;
  });

  /* ================= STATS ================= */
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === "admin").length;
  const teacherCount = users.filter((u) => u.role === "teacher").length;
  const studentCount = users.filter((u) => u.role === "student").length;

  return (
    <div className="admin-wrapper min-vh-100">
      <div className="container py-4">
        {/* ================= HEADER ================= */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold">👑 Admin Dashboard</h2>
            <small className="text-muted">
              System control & role management
            </small>
          </div>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={logout}
          >
            Logout
          </button>
        </div>

        {/* ================= STATS ================= */}
        <div className="row g-3 mb-4">
          <StatCard title="👥 Total Users" value={totalUsers} />
          <StatCard title="🛡️ Admins" value={adminCount} color="purple" />
          <StatCard title="👨‍🏫 Teachers" value={teacherCount} color="blue" />
          <StatCard title="🎓 Students" value={studentCount} color="green" />
        </div>

        {/* ================= FILTERS ================= */}
        <div className="card shadow-sm mb-3 border-0">
          <div className="card-body d-flex flex-wrap gap-3">
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

            <div style={{ width: 220 }}>
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

        {/* ================= USERS TABLE ================= */}
        <div className="card admin-card shadow-sm border-0">
          <div className="card-header fw-semibold">👤 Registered Users</div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th className="text-end">⚙️ Actions</th>
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
        </div>
        </div>

        {/* ================= DELETE CONFIRM ================= */}
        {userToDelete && (
          <div className="delete-card shadow position-fixed bottom-3 end-3 bg-white border rounded-3">
            <div className="delete-card-body">
              <p className="delete-title">⚠️ Delete User</p>

              <p className="delete-text">
                Are you sure you want to delete{" "}
                <strong>{userToDelete.name}</strong> permanently?
              </p>

              <div className="delete-actions">
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={handleDelete}
                >
                  Yes, Delete
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setUserToDelete(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      

      {/* ================= STYLES ================= */}
      <style>{`
        .admin-wrapper {
  background: #f4f6fb;
  position: relative;
  z-index: 1;
}

        .admin-card { border-radius:14px; overflow:hidden; }
        .role-badge {
          padding:4px 12px;
          border-radius:999px;
          font-size:0.75rem;
          font-weight:500;
          display:inline-block;
        }
        .role-badge.admin { background:#ede9fe; color:#6d28d9; }
        .role-badge.teacher { background:#e0f2fe; color:#0369a1; }
        .role-badge.student { background:#e2e8f0; color:#334155; }
        .delete-card {
          width:300px;
          z-index:9999;
        }

        .delete-card {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 320px;
  background: white;
  border-radius: 12px;
  z-index: 100000;
  box-shadow: 0 20px 40px rgba(0,0,0,0.25);
}

.delete-card-body {
  padding: 16px;
}

.delete-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}



      `}</style>
    </div>
  );
}

/* ================= STAT CARD ================= */
function StatCard({ title, value, color }) {
  const colors = {
    purple: "#7c3aed",
    green: "#0f766e",
    blue: "#0284c7",
    default: "#1e293b",
  };

  return (
    <div className="col-md-3">
      <div className="card shadow-sm border-0 p-3">
        <h6 className="text-muted">{title}</h6>
        <h2 style={{ color: colors[color] || colors.default }}>{value}</h2>
      </div>
    </div>
  );
}

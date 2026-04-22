import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Spinner from "../../components/Spinner";
import Toast from "../../components/Toast";

export default function ClassStudents() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [toast, setToast] = useState("");
  const [modal, setModal] = useState({ show: false, student: null });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get(`/teacher/classes/${id}`);
      setStudents(res.data.students || []);
      setFiltered(res.data.students || []);
      setClassName(res.data.name);
    } catch (err) {
      console.error(err);
      setToast("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value.toLowerCase();
    setSearch(val);
    setCurrentPage(1);
    setFiltered(
      students.filter(
        (s) =>
          s.name.toLowerCase().includes(val) ||
          s.email.toLowerCase().includes(val)
      )
    );
  };

  const confirmRemoveStudent = (student) => {
    setModal({ show: true, student });
  };

  const removeStudent = async () => {
    try {
      await api.delete(`/teacher/classes/${id}/students/${modal.student._id}`);
      setToast("Student removed successfully");

      setStudents((prev) =>
        prev.filter((s) => s._id !== modal.student._id)
      );
      setFiltered((prev) =>
        prev.filter((s) => s._id !== modal.student._id)
      );
    } catch (err) {
      console.error(err);
      setToast("Failed to remove student");
    } finally {
      setModal({ show: false, student: null });
    }
  };

  if (loading) return <Spinner message="Loading students..." />;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentStudents = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="container py-5">
      <Toast message={toast} onClose={() => setToast("")} />

      {/* Back Button */}
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
        <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            <h3 className="fw-bold mb-1">👩‍🎓 Students — {className}</h3>
            <p className="mb-0 opacity-75">
              Total: <span className="fw-semibold">{students.length}</span>
            </p>
          </div>
          <input
            type="text"
            className="form-control"
            placeholder="Search students..."
            value={search}
            onChange={handleSearch}
            style={{ maxWidth: "300px" }}
          />
        </div>
      </div>

      {/* Students List */}
      {currentStudents.length === 0 ? (
        <div className="card border-0 shadow-sm p-4 text-center">
          <p className="text-muted mb-0">
            No students found {search ? `for "${search}"` : ""}
          </p>
        </div>
      ) : (
        <div
          className="card shadow-sm border-0"
          style={{ borderRadius: "12px", maxHeight: "500px", overflowY: "auto" }}
        >
          <ul className="list-group list-group-flush">
            {currentStudents.map((s, index) => (
              <li
                key={s._id}
                className="list-group-item d-flex align-items-center justify-content-between"
                style={{
                  transition: "all 0.2s ease",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  margin: "0.2rem 0",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#f8f9fa")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div className="d-flex align-items-center gap-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{
                      backgroundColor: "#0d6efd",
                      width: "40px",
                      height: "40px",
                    }}
                  >
                    {s.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div>
                    <strong>{s.name}</strong>
                    <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                      {s.email}
                    </div>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted">
                    {indexOfFirst + index + 1}
                  </span>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => confirmRemoveStudent(s)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 py-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ⬅ Prev
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="btn btn-outline-secondary btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next ➡
              </button>
            </div>
          )}
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {modal.show && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.4)", zIndex: 1050 }}
        >
          <div className="card p-4" style={{ maxWidth: "400px", borderRadius: "12px" }}>
            <h5 className="mb-3">Confirm Remove</h5>
            <p>
              Are you sure you want to remove{" "}
              <strong>{modal.student?.name}</strong> from this class?
            </p>
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setModal({ show: false, student: null })}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={removeStudent}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

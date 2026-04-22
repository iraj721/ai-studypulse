import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Spinner from "../../components/Spinner";

export default function ClassAssignments() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [modal, setModal] = useState({
    show: false,
    type: "",
    assignment: null,
    title: "",
    instructions: "",
    dueDate: "",
    attachment: null, 
    marks: "", // ✅ added marks field
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await api.get(`/teacher/classes/${id}/assignments`);
      setAssignments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async () => {
    try {
      await api.delete(
        `/teacher/classes/${id}/assignments/${modal.assignment._id}`
      );
      setAssignments(assignments.filter(a => a._id !== modal.assignment._id));
    } catch (err) {
      console.error(err);
    } finally {
      setModal({ show: false });
    }
  };

  const updateAssignment = async () => {
    try {
      const formData = new FormData();
      formData.append("title", modal.title);
      formData.append("instructions", modal.instructions);
      formData.append("dueDate", modal.dueDate || "");
      formData.append("marks", modal.marks || ""); // ✅ send marks to backend

      if (modal.attachment) {
        formData.append("attachment", modal.attachment);
      }

      await api.put(
        `/teacher/classes/${id}/assignments/${modal.assignment._id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      fetchAssignments();
    } catch (err) {
      console.error(err);
    } finally {
      setModal({ show: false });
    }
  };

  if (loading) return <Spinner message="Loading assignments..." />;

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentAssignments = assignments.slice(indexOfFirst, indexOfLast);

  return (
    <div className="container py-5">
      <button className="btn btn-outline-secondary mb-4" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      {/* Header */}
      <div
        className="card mb-4 border-0"
        style={{
          background: "linear-gradient(135deg, #598edcff, #4f8cff)",
          color: "#fff",
          boxShadow: "0 10px 25px rgba(13,110,253,0.25)",
          borderRadius: "12px",
        }}
      >
        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h3 className="fw-bold mb-0">📝 Assignments</h3>
          <span className="badge bg-light text-dark">Total: {assignments.length}</span>
        </div>
      </div>

      <button
        className="btn btn-primary mb-4"
        onClick={() => navigate(`/teacher/classes/${id}/assignments/create`)}
      >
        + Create Assignment
      </button>

      {assignments.length > 0 && (
        <h5 className="mb-3 mt-4 text-muted border-bottom pb-2">
          📌 Uploaded Assignments
        </h5>
      )}

      {currentAssignments.length === 0 ? (
        <div className="card border-0 shadow-sm p-4 text-center">
          <p className="text-muted mb-0">No assignments yet.</p>
        </div>
      ) : (
        <div className="row g-3">
          {currentAssignments.map((a) => (
            <div key={a._id} className="col-md-6">
              <div
                className="card border-0 shadow-sm"
                style={{ borderRadius: "12px", cursor: "pointer" }} // ✅ pointer on hover
                onClick={() =>
                  navigate(`/teacher/classes/${id}/assignments/${a._id}/submissions`)
                }
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <h5 className="fw-semibold">{a.title}</h5>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModal({
                            show: true,
                            type: "edit",
                            assignment: a,
                            title: a.title,
                            instructions: a.instructions,
                            dueDate: a.dueDate ? a.dueDate.slice(0, 10) : "",
                            attachment: null,
                            marks: a.marks || "", // ✅ show existing marks
                          });
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModal({ show: true, type: "delete", assignment: a });
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-muted mb-2">{a.instructions}</p>
                  <div className="text-muted small">
                    Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "N/A"}
                  </div>
                  {a.marks && <div className="text-muted small">Marks: {a.marks}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {modal.show && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.4)", zIndex: 1050 }}
        >
          <div className="card p-4" style={{ maxWidth: "420px", borderRadius: "12px" }}>
            {modal.type === "delete" && (
              <>
                <h5>Delete Assignment</h5>
                <p>Are you sure you want to delete this assignment?</p>
                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setModal({ show: false })}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={deleteAssignment}>
                    Delete
                  </button>
                </div>
              </>
            )}

            {modal.type === "edit" && (
              <>
                <h5>Edit Assignment</h5>

                <input
                  className="form-control mb-2"
                  value={modal.title}
                  onChange={(e) => setModal({ ...modal, title: e.target.value })}
                />

                <textarea
                  className="form-control mb-2"
                  rows={3}
                  value={modal.instructions}
                  onChange={(e) => setModal({ ...modal, instructions: e.target.value })}
                />

                <input
                  type="date"
                  className="form-control mb-2"
                  value={modal.dueDate}
                  onChange={(e) => setModal({ ...modal, dueDate: e.target.value })}
                />

                <input
                  type="number"
                  className="form-control mb-2"
                  placeholder="Marks (optional)"
                  value={modal.marks}
                  onChange={(e) => setModal({ ...modal, marks: e.target.value })}
                />

                <input
                  type="file"
                  className="form-control mb-2"
                  onChange={(e) => setModal({ ...modal, attachment: e.target.files[0] })}
                />
                <small className="text-muted">Leave empty to keep existing attachment</small>

                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setModal({ show: false })}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={updateAssignment}>
                    Save
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

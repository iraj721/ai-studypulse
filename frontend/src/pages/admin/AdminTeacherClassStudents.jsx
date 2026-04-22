import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";

export default function AdminTeacherClassStudents() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    apiAdmin.get(`/admin/teacher/classes/${classId}`).then(res => {
      setStudents(res.data.students || []);
    });
  }, []);

  return (
    <div className="container py-5">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
        ⬅ Back
      </button>

      <h3>👨‍🎓 Class Students</h3>

      <table className="table table-striped mt-3">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s._id}>
              <td>{s.name}</td>
              <td>{s.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

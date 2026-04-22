import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";

/* ================= PUBLIC ================= */
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
/* ================= STUDENT ================= */
import Dashboard from "./pages/students/Dashboard";
import Activities from "./pages/students/activities/Activities";
import AddActivity from "./pages/students/activities/AddActivity";
import JoinClass from "./pages/students/classes/JoinClass";
import StudentClasses from "./pages/students/classes/StudentClasses";
import AIChat from "./pages/students/chat/AIChat";
import Notes from "./pages/students/notes/Notes";
import CreateNote from "./pages/students/notes/CreateNote";
import EditNote from "./pages/students/notes/EditNote";
import QuizzesList from "./pages/students/quizzes/QuizzesList";
import GenerateQuiz from "./pages/students/quizzes/GenerateQuiz";
import TakeQuiz from "./pages/students/quizzes/TakeQuiz";
import StudentClassDashboard from "./pages/students/classes/StudentClassDashboard";
import StudentAssignment from "./pages/students/classes/StudentAssignment";
import StudentAnnouncements from "./pages/students/classes/StudentAnnouncements";
import StudentMaterials from "./pages/students/classes/StudentMaterials";

/* ================= ADMIN ================= */
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUserDetails from "./pages/admin/AdminUserDetails";
import AdminNoteDetails from "./pages/admin/AdminNoteDetails";
import AdminQuizDetails from "./pages/admin/AdminQuizDetails";
import AdminActivityDetails from "./pages/admin/AdminActivityDetails";
import AdminTeacherDetails from "./pages/admin/AdminTeacherDetails";
import AdminTeacherClassDetails from "./pages/admin/AdminTeacherClassDetails";
import AdminClassAnnouncements from "./pages/admin/AdminClassAnnouncements";
import AdminClassMaterials from "./pages/admin/AdminClassMaterials";
import AdminClassAssignments from "./pages/admin/AdminClassAssignments";
import AdminStudentClassDetails from "./pages/admin/AdminClassStudents";
import AdminClassAssignmentSubmissions from "./pages/admin/AdminClassAssignmentSubmissions";
import AdminClassStudents from "./pages/admin/AdminClassStudents";

/* ================= TEACHER ================= */
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import CreateClass from "./pages/teacher/CreateClass";
import ClassDetails from "./pages/teacher/ClassDetails";
import ClassStudents from "./pages/teacher/ClassStudents";
import ClassAnnouncements from "./pages/teacher/ClassAnouncements";
import ClassAssignments from "./pages/teacher/ClassAssignments";
import AssignmentSubmissions from "./pages/teacher/AssignmentSubmissions";
import CreateAssignment from "./pages/teacher/CreateAssignment";
import ClassMaterials from "./pages/teacher/ClassMaterials";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========= PUBLIC ========= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ========= STUDENT ========= */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/activities/add" element={<AddActivity />} />

          <Route path="/classes" element={<StudentClasses />} />
          <Route path="/classes/join" element={<JoinClass />} />

          <Route path="/chat" element={<AIChat />} />

          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/create" element={<CreateNote />} />
          <Route path="/notes/edit/:id" element={<EditNote />} />

          <Route path="/quizzes" element={<QuizzesList />} />
          <Route path="/quizzes/generate" element={<GenerateQuiz />} />
          <Route path="/quizzes/:id" element={<TakeQuiz />} />

          <Route
            path="/student/class/:classId"
            element={<StudentClassDashboard />}
          />
          <Route
            path="/student/class/:classId/assignments"
            element={<StudentAssignment />}
          />
          <Route
            path="/student/class/:classId/assignments/:assignmentId"
            element={<StudentAssignment />}
          />
          <Route
            path="/student/class/:classId/announcements"
            element={<StudentAnnouncements />}
          />
          <Route
            path="/student/class/:classId/materials"
            element={<StudentMaterials />}
          />
        </Route>

        {/* ========= ADMIN ========= */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users/:id" element={<AdminUserDetails />} />
        <Route path="/admin/users/:id/notes" element={<AdminNoteDetails />} />
        <Route path="/admin/users/:id/quizzes" element={<AdminQuizDetails />} />
        <Route
          path="/admin/users/:id/activities"
          element={<AdminActivityDetails />}
        />

        <Route path="/admin/teacher/:id" element={<AdminTeacherDetails />} />
        <Route
          path="/admin/teacher/class/:classId"
          element={<AdminTeacherClassDetails />}
        />

        <Route
          path="/admin/student/class/:classId"
          element={<AdminStudentClassDetails />}
        />

        {/* ADMIN CLASS ROUTES */}
        <Route
          path="/admin/class/:classId/announcements"
          element={<AdminClassAnnouncements />}
        />
        <Route
          path="/admin/class/:classId/materials"
          element={<AdminClassMaterials />}
        />
        <Route
          path="/admin/class/:classId/assignments"
          element={<AdminClassAssignments />}
        />
        <Route
          path="/admin/assignment/:assignmentId/submissions"
          element={<AdminClassAssignmentSubmissions />}
        />

        {/* ========= TEACHER ========= */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/classes/create" element={<CreateClass />} />
        <Route path="/teacher/classes/:id" element={<ClassDetails />} />
        <Route
          path="/teacher/classes/:id/students"
          element={<ClassStudents />}
        />
        <Route
          path="/teacher/classes/:id/announcements"
          element={<ClassAnnouncements />}
        />
        <Route
          path="/teacher/classes/:id/assignments"
          element={<ClassAssignments />}
        />
        <Route
          path="/teacher/classes/:id/assignments/create"
          element={<CreateAssignment />}
        />
        <Route
          path="/teacher/classes/:id/materials"
          element={<ClassMaterials />}
        />
        <Route
          path="/admin/teacher/class/:classId/students"
          element={<AdminClassStudents />}
        />
        <Route
          path="/admin/teacher/class/:classId/materials"
          element={<AdminClassMaterials />}
        />
        <Route
          path="/admin/teacher/class/:classId/announcements"
          element={<AdminClassAnnouncements />}
        />
        <Route
          path="/admin/teacher/class/:classId/assignments"
          element={<AdminClassAssignments />}
        />
        <Route
          path="/teacher/classes/:id/assignments/:assignmentId/submissions"
          element={<AssignmentSubmissions />}
        />
      </Routes>
    </BrowserRouter>
  );
}

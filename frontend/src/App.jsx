import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";

/* ================= PUBLIC ================= */
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Register from "./pages/Register";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

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
import FlashcardsPage from "./pages/students/FlashcardsPage";
import VideoSummarizerPage from "./pages/students/VideoSummarizerPage";
import StudyGroupsPage from "./pages/students/StudyGroupsPage";
import BookmarksPage from "./pages/students/BookmarksPage";
import TimerPage from "./pages/students/TimerPage";

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
import AdminClassStudents from "./pages/admin/AdminClassStudents";
import AdminClassAssignmentSubmissions from "./pages/admin/AdminClassAssignmentSubmissions";
import AdminStudentFullDetails from "./pages/admin/AdminStudentFullDetails";
import AdminFlashcardsView from "./pages/admin/AdminFlashcardsView";
import AdminBookmarksView from "./pages/admin/AdminBookmarksView";
import AdminVideosView from "./pages/admin/AdminVideosView";
import AdminGroupsView from "./pages/admin/AdminGroupsView";
import AdminChatView from "./pages/admin/AdminChatView";
import AdminAIAnalytics from "./pages/admin/AdminAIAnalytics";
import AdminTeacherManagement from "./pages/admin/AdminTeacherManagement";
// ✅ Import the student class details page (rename to avoid conflict)
import AdminStudentClassDetailsPage from "./pages/admin/AdminStudentClassDetails";

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
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ========= STUDENT ========= */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/activities" element={<Activities />} />
          <Route path="/activities/add" element={<AddActivity />} />
          <Route path="/classes" element={<StudentClasses />} />
          <Route path="/classes/join" element={<JoinClass />} />
          <Route path="/chat" element={<AIChat />} />
          <Route path="/chat/:sessionId?" element={<AIChat />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/notes/create" element={<CreateNote />} />
          <Route path="/notes/edit/:id" element={<EditNote />} />
          <Route path="/quizzes" element={<QuizzesList />} />
          <Route path="/quizzes/generate" element={<GenerateQuiz />} />
          <Route path="/quizzes/:id" element={<TakeQuiz />} />
          <Route path="/student/class/:classId" element={<StudentClassDashboard />} />
          <Route path="/student/class/:classId/assignments" element={<StudentAssignment />} />
          <Route path="/student/class/:classId/assignments/:assignmentId" element={<StudentAssignment />} />
          <Route path="/student/class/:classId/announcements" element={<StudentAnnouncements />} />
          <Route path="/student/class/:classId/materials" element={<StudentMaterials />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/video-summarizer" element={<VideoSummarizerPage />} />
          <Route path="/study-groups" element={<StudyGroupsPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/timer" element={<TimerPage />} />
        </Route>

        {/* ========= ADMIN ========= */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users/:id" element={<AdminUserDetails />} />
        <Route path="/admin/users/:id/notes" element={<AdminNoteDetails />} />
        <Route path="/admin/users/:id/quizzes" element={<AdminQuizDetails />} />
        <Route path="/admin/users/:id/activities" element={<AdminActivityDetails />} />
        <Route path="/admin/teacher/:id" element={<AdminTeacherDetails />} />
        <Route path="/admin/teacher/class/:classId" element={<AdminTeacherClassDetails />} />
        <Route path="/admin/student/class/:classId" element={<AdminClassStudents />} />
        <Route path="/admin/student-full/:id" element={<AdminStudentFullDetails />} />
        <Route path="/admin/users/:id/flashcards" element={<AdminFlashcardsView />} />
        <Route path="/admin/users/:id/bookmarks" element={<AdminBookmarksView />} />
        <Route path="/admin/users/:id/videos" element={<AdminVideosView />} />
        <Route path="/admin/users/:id/groups" element={<AdminGroupsView />} />
        <Route path="/admin/users/:id/chat" element={<AdminChatView />} />
        <Route path="/admin/analytics" element={<AdminAIAnalytics />} />
        <Route path="/admin/teacher-management" element={<AdminTeacherManagement />} />
        
        {/* ✅ Student Class Details Route */}
        <Route path="/admin/student/:studentId/class/:classId" element={<AdminStudentClassDetailsPage />} />

        {/* ADMIN CLASS ROUTES */}
        <Route path="/admin/class/:classId/announcements" element={<AdminClassAnnouncements />} />
        <Route path="/admin/class/:classId/materials" element={<AdminClassMaterials />} />
        <Route path="/admin/class/:classId/assignments" element={<AdminClassAssignments />} />
        <Route path="/admin/assignment/:assignmentId/submissions" element={<AdminClassAssignmentSubmissions />} />
        <Route path="/admin/teacher/class/:classId/students" element={<AdminClassStudents />} />
        <Route path="/admin/teacher/class/:classId/materials" element={<AdminClassMaterials />} />
        <Route path="/admin/teacher/class/:classId/announcements" element={<AdminClassAnnouncements />} />
        <Route path="/admin/teacher/class/:classId/assignments" element={<AdminClassAssignments />} />

        {/* ========= TEACHER ========= */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/classes/create" element={<CreateClass />} />
        <Route path="/teacher/classes/:id" element={<ClassDetails />} />
        <Route path="/teacher/classes/:id/students" element={<ClassStudents />} />
        <Route path="/teacher/classes/:id/announcements" element={<ClassAnnouncements />} />
        <Route path="/teacher/classes/:id/assignments" element={<ClassAssignments />} />
        <Route path="/teacher/classes/:id/assignments/create" element={<CreateAssignment />} />
        <Route path="/teacher/classes/:id/materials" element={<ClassMaterials />} />
        <Route path="/teacher/classes/:id/assignments/:assignmentId/submissions" element={<AssignmentSubmissions />} />
      </Routes>
    </BrowserRouter>
  );
}
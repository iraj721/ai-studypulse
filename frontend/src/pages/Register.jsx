import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthCard from "../components/AuthCard";

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = async (form, setToast) => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setToast({ message: "Please fill all fields", type: "error" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setToast({ message: "Passwords do not match", type: "error" });
      return;
    }
    try {
      const res = await api.post("/auth/register", form);
      localStorage.setItem("token", res.data.token);
      if (form.role === "teacher") navigate("/teacher/dashboard");
      else navigate("/dashboard");
      setToast({ message: "Registration successful!", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Registration failed", type: "error" });
    }
  };
  

  return (
    <AuthCard
      title="AI StudyPulse"
      subtitle="Create a new account"
      fields={[
        { name: "name", label: "Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "role", label: "Role", type: "select", options: [
          { value: "student", label: "Student" },
          { value: "teacher", label: "Teacher" },
        ], required: true },
        { name: "password", label: "Password", type: "password", required: true },
        { name: "confirmPassword", label: "Confirm Password", type: "password", required: true },
      ]}
      submitText="Register"
      onSubmit={handleRegister}
      linkText="Already have an account? Login"
      linkTo="/login"
    />
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import AuthCard from "../components/AuthCard";

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = async (form, setToast) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setToast({ message: "Please fill all fields", type: "error" });
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      setToast({ message: "Passwords do not match", type: "error" });
      return;
    }
    
    if (!passwordRegex.test(form.password)) {
      setToast({ 
        message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character", 
        type: "error" 
      });
      return;
    }

    try {
      const res = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role || "student"
      });
      
      localStorage.setItem("pendingEmail", form.email);
      navigate("/verify-email", { state: { email: form.email } });
      setToast({ message: "Verification code sent to your email!", type: "success" });
    } catch (err) {
      // ✅ Handle teacher approval error
      if (err.response?.data?.requiresApproval) {
        setToast({ 
          message: "This email is not authorized for teacher registration. Please contact admin.", 
          type: "error" 
        });
      } else {
        setToast({ message: err.response?.data?.message || "Registration failed", type: "error" });
      }
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
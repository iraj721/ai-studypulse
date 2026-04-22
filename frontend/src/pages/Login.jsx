import React from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import AuthCard from "../components/AuthCard";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = async (form, setToast) => {
    if (!form.email || !form.password) {
      setToast({ message: "Please fill all fields", type: "error" });
      return;
    }
    
    try {
      const res = await api.post("/auth/login", form);
      
      localStorage.setItem("token", res.data.token);
      
      const role = res.data.user?.role || res.data.role;
      
      if (role === "teacher") {
        navigate("/teacher/dashboard");
      } else if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
      
      setToast({ message: "Login successful!", type: "success" });
    } catch (err) {
      // Check if email not verified
      if (err.response?.data?.requiresVerification) {
        localStorage.setItem("pendingEmail", form.email);
        navigate("/verify-email", { state: { email: form.email } });
        setToast({ message: "Please verify your email first", type: "warning" });
      } else {
        setToast({ message: err.response?.data?.message || "Login failed", type: "error" });
      }
    }
  };

  return (
    <>
      <AuthCard
        title="AI StudyPulse"
        subtitle="Login to access your dashboard"
        fields={[
          { name: "email", label: "Email", type: "email", required: true },
          { name: "password", label: "Password", type: "password", required: true },
        ]}
        submitText="Login"
        onSubmit={handleLogin}
        linkText="Don't have an account? Register"
        linkTo="/register"
      />
      <div className="text-center mt-4">
        <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700">
          Forgot Password?
        </Link>
      </div>
    </>
  );
}
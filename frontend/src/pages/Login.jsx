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
      // const userRes = await api.get("/auth/me", { headers: { Authorization: `Bearer ${res.data.token}` } });
      const role = res.data.role;
      if (role === "teacher") navigate("/teacher/dashboard");
      else navigate("/dashboard");
      setToast({ message: "Login successful!", type: "success" });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Login failed", type: "error" });
    }
  };


  return (
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
  );
}

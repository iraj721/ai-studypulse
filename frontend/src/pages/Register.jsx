import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "student",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [focused, setFocused] = useState("");
  const toastTimer = useRef(null);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validatePassword = (password) => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[@$!%*?&#]/.test(password);
    const isLongEnough = password.length >= 8;
    
    return {
      isValid: hasLower && hasUpper && hasNumber && hasSpecial && isLongEnough,
      hasLower,
      hasUpper,
      hasNumber,
      hasSpecial,
      isLongEnough
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      showToast("Please fill in all fields.", "error");
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    
    const passwordValidation = validatePassword(form.password);
    if (!passwordValidation.isValid) {
      showToast("Password must be at least 8 characters with uppercase, lowercase, number, and special character.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      });
      
      localStorage.setItem("pendingEmail", form.email);
      navigate("/verify-email", { state: { email: form.email } });
      showToast("Verification code sent to your email!", "success");
    } catch (err) {
      setIsLoading(false);
      if (err.response?.data?.requiresApproval) {
        showToast("This email is not authorized for teacher registration. Please contact admin.", "error");
      } else {
        showToast(err.response?.data?.message || "Registration failed. Please try again.", "error");
      }
    }
  };

  const passwordValidation = validatePassword(form.password);
  const showPasswordStrength = form.password.length > 0;

  // Role options with icons and descriptions
  const roleOptions = [
    { value: "student", label: "Student", icon: "🎓", description: "Access courses, assignments, quizzes, and AI study tools" },
    { value: "teacher", label: "Teacher", icon: "👨‍🏫", description: "Create classes, manage students, track progress" },
  ];

  return (
    <div className="reg-root">
      {/* Background Elements */}
      <div className="reg-bg" />
      <div className="reg-grid" />
      <div className="reg-orb reg-orb-a" />
      <div className="reg-orb reg-orb-b" />
      <div className="reg-orb reg-orb-c" />

      {/* Nav */}
      <nav className="reg-nav">
        <Link to="/" className="reg-logo">
          <span className="reg-logo-gem">◈</span>
          StudyPulse
        </Link>
        <div className="reg-nav-right">
          <span className="reg-nav-label">Already a member?</span>
          <Link to="/login" className="reg-nav-solid">Sign In</Link>
        </div>
      </nav>

      {/* Toast */}
      {toast && (
        <div className={`reg-toast reg-toast-${toast.type}`}>
          <span className="reg-toast-icon">
            {toast.type === "success" ? "✓" : toast.type === "warning" ? "⚠" : "✕"}
          </span>
          {toast.message}
        </div>
      )}

      {/* Main Content */}
      <main className="reg-main">
        {/* Card */}
        <div className="reg-card">
          <div className="reg-card-glow" />

          <div className="reg-card-head">
            <div className="reg-card-eyebrow">Get started</div>
            <h1 className="reg-card-title">Create an account</h1>
            <p className="reg-card-sub">
              Join thousands of students learning smarter with AI.
            </p>
          </div>

          <form className="reg-form" onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className={`reg-field ${focused === "name" ? "reg-field-focus" : ""} ${form.name ? "reg-field-filled" : ""}`}>
              <label className="reg-label" htmlFor="name">Full name</label>
              <div className="reg-input-wrap">
                <svg className="reg-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13 14v-1.5a3.5 3.5 0 00-7 0V14M8 8a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused("")}
                  className="reg-input"
                  placeholder="e.g., John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div className={`reg-field ${focused === "email" ? "reg-field-focus" : ""} ${form.email ? "reg-field-filled" : ""}`}>
              <label className="reg-label" htmlFor="email">Email address</label>
              <div className="reg-input-wrap">
                <svg className="reg-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M1 5.5l6.293 4.207a1 1 0 001.414 0L15 5.5" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  className="reg-input"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Role - Custom Styled Select */}
            <div className={`reg-field ${focused === "role" ? "reg-field-focus" : ""}`}>
              <label className="reg-label" htmlFor="role">Role</label>
              <div className="reg-input-wrap">
                <svg className="reg-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="5" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
                  <circle cx="11" cy="5" r="3" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M1 13v-1a3 3 0 013-3h2a3 3 0 013 3v1M9 13v-1a3 3 0 013-3h2a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  onFocus={() => setFocused("role")}
                  onBlur={() => setFocused("")}
                  className="reg-select"
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
                <div className="reg-select-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
              {/* Role description */}
              <div className="reg-role-description">
                {form.role === "student" && (
                  <span>🎓 Access courses, assignments, quizzes, and AI study tools</span>
                )}
                {form.role === "teacher" && (
                  <span>👨‍🏫 Create classes, manage students, track progress, and create assignments</span>
                )}
              </div>
            </div>

            {/* Password */}
            <div className={`reg-field ${focused === "password" ? "reg-field-focus" : ""} ${form.password ? "reg-field-filled" : ""}`}>
              <label className="reg-label" htmlFor="password">Password</label>
              <div className="reg-input-wrap">
                <svg className="reg-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  className="reg-input"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="reg-eye"
                  onClick={() => setShowPass((s) => !s)}
                  tabIndex={-1}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 2l12 12M6.5 6.6A2 2 0 019.4 9.5M4.2 4.3C2.8 5.3 1.7 6.5 1 8c1.3 3 4 5 7 5 1.3 0 2.5-.4 3.5-1M6 3.1C6.6 3 7.3 3 8 3c3 0 5.7 2 7 5-.5 1.2-1.3 2.2-2.3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8c1.3-3 4-5 7-5s5.7 2 7 5c-1.3 3-4 5-7 5s-5.7-2-7-5z" stroke="currentColor" strokeWidth="1.3"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
                    </svg>
                  )}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {showPasswordStrength && (
                <div className="reg-password-strength">
                  <div className="reg-strength-bars">
                    <div className={`reg-strength-bar ${passwordValidation.isLongEnough ? "active" : ""}`} />
                    <div className={`reg-strength-bar ${passwordValidation.hasLower && passwordValidation.hasUpper ? "active" : ""}`} />
                    <div className={`reg-strength-bar ${passwordValidation.hasNumber ? "active" : ""}`} />
                    <div className={`reg-strength-bar ${passwordValidation.hasSpecial ? "active" : ""}`} />
                  </div>
                  <div className="reg-strength-text">
                    {passwordValidation.isValid ? (
                      <span className="reg-strength-valid">✓ Strong password</span>
                    ) : (
                      <span>Must have 8+ chars, A-Z, a-z, 0-9, and special character</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className={`reg-field ${focused === "confirmPassword" ? "reg-field-focus" : ""} ${form.confirmPassword ? "reg-field-filled" : ""}`}>
              <label className="reg-label" htmlFor="confirmPassword">Confirm password</label>
              <div className="reg-input-wrap">
                <svg className="reg-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPass ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => setFocused("confirmPassword")}
                  onBlur={() => setFocused("")}
                  className="reg-input"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="reg-eye"
                  onClick={() => setShowConfirmPass((s) => !s)}
                  tabIndex={-1}
                  aria-label={showConfirmPass ? "Hide password" : "Show password"}
                >
                  {showConfirmPass ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 2l12 12M6.5 6.6A2 2 0 019.4 9.5M4.2 4.3C2.8 5.3 1.7 6.5 1 8c1.3 3 4 5 7 5 1.3 0 2.5-.4 3.5-1M6 3.1C6.6 3 7.3 3 8 3c3 0 5.7 2 7 5-.5 1.2-1.3 2.2-2.3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8c1.3-3 4-5 7-5s5.7 2 7 5c-1.3 3-4 5-7 5s-5.7-2-7-5z" stroke="currentColor" strokeWidth="1.3"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
                    </svg>
                  )}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <div className="reg-error-msg">✗ Passwords do not match</div>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && form.password.length > 0 && (
                <div className="reg-success-msg">✓ Passwords match</div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`reg-submit ${isLoading ? "reg-submit-loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="reg-spinner" />
                  Creating account…
                </>
              ) : (
                <>
                  Create free account
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="reg-card-foot">
            Already have an account?{" "}
            <Link to="/login" className="reg-card-link">Sign in instead</Link>
          </div>

          <p className="reg-terms">
            By creating an account, you agree to our{' '}
            <Link to="/terms">Terms of Service</Link> and{' '}
            <Link to="/privacy">Privacy Policy</Link>.
          </p>
        </div>

        {/* Side Panel */}
        <div className="reg-side">
          <div className="reg-side-content">
            <div className="reg-side-eyebrow">Join the future of learning</div>
            <h2 className="reg-side-title">
              Study smarter,
              <br />
              <span className="reg-grad">not harder.</span>
            </h2>
            <p className="reg-side-sub">
              Get access to AI-powered quizzes, real-time analytics, personalized insights, and a complete learning ecosystem.
            </p>
            <div className="reg-side-stats">
              {[
                { v: "12+", l: "AI Features" },
                { v: "3×",  l: "Faster Learning" },
                { v: "24/7", l: "Always Available" },
                { v: "98%", l: "Success Rate" },
              ].map((s, i) => (
                <div key={i} className="reg-side-stat">
                  <div className="reg-side-stat-v">{s.v}</div>
                  <div className="reg-side-stat-l">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .reg-root {
          --bg: #0a0c12;
          --surface: #111318;
          --surface2: #181b22;
          --border: rgba(88, 130, 255, 0.12);
          --border-h: rgba(88, 130, 255, 0.3);
          --accent: #5882ff;
          --accent2: #20e6d0;
          --violet: #9b7aff;
          --text: #edf2ff;
          --muted: #8e9cc4;
          --faint: #49587a;
          --fd: 'Syne', sans-serif;
          --fb: 'Inter', sans-serif;
          --success: #10b981;
          --error: #ef4444;
        }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        .reg-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .reg-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 60%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background */
        .reg-bg {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.13) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 90% 70%, rgba(32, 230, 208, 0.06) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 10% 80%, rgba(155, 122, 255, 0.06) 0%, transparent 55%);
        }
        .reg-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 80%);
        }
        .reg-orb {
          position: fixed; border-radius: 50%; filter: blur(90px);
          pointer-events: none; z-index: 0;
        }
        .reg-orb-a {
          width: 460px; height: 460px; top: -140px; left: 50%;
          transform: translateX(-50%);
          background: rgba(88, 130, 255, 0.09);
          animation: orbA 9s ease-in-out infinite;
        }
        .reg-orb-b {
          width: 280px; height: 280px; bottom: 10%; right: -3%;
          background: rgba(32, 230, 208, 0.06);
          animation: orbB 11s 2s ease-in-out infinite;
        }
        .reg-orb-c {
          width: 240px; height: 240px; top: 30%; left: -4%;
          background: rgba(155, 122, 255, 0.06);
          animation: orbB 10s 4s ease-in-out infinite;
        }
        @keyframes orbA {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.06); }
        }
        @keyframes orbB {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.09); }
        }

        /* Nav */
        .reg-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2.5rem; height: 64px;
          background: rgba(10, 12, 18, 0.7);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid var(--border);
          animation: navDown 0.5s cubic-bezier(.2, .9, .3, 1.1) both;
        }
        @keyframes navDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: none; }
        }
        .reg-logo {
          font-family: var(--fd); font-size: 1.15rem; font-weight: 700;
          letter-spacing: -0.02em; color: var(--text);
          display: flex; align-items: center; gap: 7px;
          text-decoration: none;
        }
        .reg-logo-gem {
          color: var(--accent);
          filter: drop-shadow(0 0 6px rgba(88, 130, 255, 0.55));
        }
        .reg-nav-right {
          display: flex; align-items: center; gap: 12px;
        }
        .reg-nav-label {
          font-size: 0.82rem; color: var(--faint);
        }
        .reg-nav-solid {
          font-size: 0.85rem; font-weight: 600;
          padding: 7px 20px; border-radius: 40px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: #fff; text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(88, 130, 255, 0.3);
        }
        .reg-nav-solid:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(88, 130, 255, 0.45);
        }

        /* Toast */
        .reg-toast {
          position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
          z-index: 300; display: flex; align-items: center; gap: 10px;
          padding: 12px 24px; border-radius: 48px;
          font-size: 0.85rem; font-weight: 500;
          backdrop-filter: blur(16px);
          animation: toastIn 0.35s cubic-bezier(.2, .9, .3, 1.1) both;
          white-space: nowrap;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .reg-toast-success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #6ee7b7;
        }
        .reg-toast-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
        }
        .reg-toast-warning {
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.35);
          color: #fcd34d;
        }
        .reg-toast-icon {
          font-size: 1rem; line-height: 1;
        }

        /* Main Layout */
        .reg-main {
          position: relative; z-index: 10;
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          padding: 5.5rem 2rem 3rem;
          gap: 5rem;
        }

        /* Card */
        .reg-card {
          position: relative; overflow: hidden;
          width: 100%; max-width: 480px;
          background: rgba(17, 19, 24, 0.85);
          border: 1px solid var(--border);
          border-radius: 28px;
          padding: 2.5rem;
          backdrop-filter: blur(24px);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(88, 130, 255, 0.06);
          animation: cardIn 0.6s cubic-bezier(.2, .9, .3, 1.1) 0.1s both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: none; }
        }
        .reg-card-glow {
          position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
          width: 280px; height: 180px; border-radius: 50%; filter: blur(60px);
          background: rgba(88, 130, 255, 0.1); pointer-events: none;
        }
        .reg-card-head {
          margin-bottom: 1.75rem;
          position: relative;
        }
        .reg-card-eyebrow {
          font-size: 0.68rem; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--accent); margin-bottom: 0.6rem;
        }
        .reg-card-title {
          font-family: var(--fd); font-size: 1.75rem; font-weight: 700;
          letter-spacing: -0.025em; line-height: 1.2; margin-bottom: 0.5rem;
          color: var(--text);
        }
        .reg-card-sub {
          font-size: 0.85rem; color: var(--muted); font-weight: 400; line-height: 1.5;
        }

        /* Form */
        .reg-form {
          display: flex; flex-direction: column; gap: 1rem;
          position: relative;
        }
        .reg-field {
          display: flex; flex-direction: column; gap: 0.4rem;
        }
        .reg-label {
          font-size: 0.78rem; font-weight: 500;
          color: var(--muted); letter-spacing: 0.01em;
          transition: color 0.2s;
        }
        .reg-field-focus .reg-label {
          color: var(--accent);
        }
        .reg-input-wrap {
          position: relative; display: flex; align-items: center;
        }
        .reg-input-icon {
          position: absolute; left: 13px; color: var(--faint);
          pointer-events: none; transition: color 0.2s;
          z-index: 2;
        }
        .reg-field-focus .reg-input-icon {
          color: var(--accent);
        }
        .reg-input {
          width: 100%; font-family: var(--fb); font-size: 0.9rem; font-weight: 400;
          color: var(--text);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 11px 42px 11px 40px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .reg-input::placeholder {
          color: var(--faint); font-size: 0.85rem;
        }
        .reg-input:focus {
          border-color: rgba(88, 130, 255, 0.5);
          background: rgba(88, 130, 255, 0.04);
          box-shadow: 0 0 0 3px rgba(88, 130, 255, 0.1);
        }
        
        /* Custom Select Styling */
        .reg-select {
          width: 100%; font-family: var(--fb); font-size: 0.9rem; font-weight: 400;
          color: var(--text);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 11px 42px 11px 40px;
          outline: none;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          appearance: none;
          -webkit-appearance: none;
        }
        .reg-select:focus {
          border-color: rgba(88, 130, 255, 0.5);
          background: rgba(88, 130, 255, 0.04);
          box-shadow: 0 0 0 3px rgba(88, 130, 255, 0.1);
        }
        .reg-select option {
          background: var(--surface);
          color: var(--text);
          padding: 10px;
        }
        .reg-select-arrow {
          position: absolute;
          right: 14px;
          pointer-events: none;
          color: var(--faint);
          transition: color 0.2s;
        }
        .reg-field-focus .reg-select-arrow {
          color: var(--accent);
        }
        
        /* Role Description */
        .reg-role-description {
          font-size: 0.7rem;
          color: var(--faint);
          margin-top: 0.3rem;
          padding-left: 4px;
        }
        
        .reg-eye {
          position: absolute; right: 12px;
          background: transparent; border: none; cursor: pointer;
          color: var(--faint); display: flex; align-items: center;
          transition: color 0.2s; padding: 4px;
          z-index: 2;
        }
        .reg-eye:hover {
          color: var(--muted);
        }

        /* Password Strength */
        .reg-password-strength {
          margin-top: 0.5rem;
        }
        .reg-strength-bars {
          display: flex; gap: 6px; margin-bottom: 0.5rem;
        }
        .reg-strength-bar {
          flex: 1; height: 4px; background: rgba(255, 255, 255, 0.1);
          border-radius: 4px; transition: background 0.3s;
        }
        .reg-strength-bar.active {
          background: var(--success);
        }
        .reg-strength-text {
          font-size: 0.7rem; color: var(--faint);
        }
        .reg-strength-valid {
          color: var(--success);
        }
        .reg-error-msg {
          font-size: 0.7rem; color: var(--error); margin-top: 0.3rem;
        }
        .reg-success-msg {
          font-size: 0.7rem; color: var(--success); margin-top: 0.3rem;
        }

        /* Submit Button */
        .reg-submit {
          margin-top: 0.6rem;
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
          font-family: var(--fb); font-size: 0.95rem; font-weight: 600;
          padding: 13px 24px; border-radius: 48px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          border: none; color: #fff; cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(88, 130, 255, 0.35);
          position: relative; overflow: hidden;
        }
        .reg-submit::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .reg-submit:hover:not(:disabled)::before {
          opacity: 1;
        }
        .reg-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(88, 130, 255, 0.5);
        }
        .reg-submit:active:not(:disabled) {
          transform: translateY(0);
        }
        .reg-submit:disabled {
          opacity: 0.7; cursor: not-allowed;
        }
        .reg-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Card Footer */
        .reg-card-foot {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.82rem; color: var(--faint);
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .reg-card-link {
          color: var(--accent); text-decoration: none; font-weight: 500;
          transition: color 0.2s;
        }
        .reg-card-link:hover {
          color: #7fa3ff;
        }
        .reg-terms {
          text-align: center;
          font-size: 0.7rem;
          color: var(--faint);
          margin-top: 1rem;
        }
        .reg-terms a {
          color: var(--accent);
          text-decoration: none;
        }
        .reg-terms a:hover {
          text-decoration: underline;
        }

        /* Side Panel */
        .reg-side {
          flex: 1; max-width: 420px;
          animation: cardIn 0.6s cubic-bezier(.2, .9, .3, 1.1) 0.2s both;
        }
        .reg-side-eyebrow {
          font-size: 0.68rem; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--accent); margin-bottom: 1rem;
        }
        .reg-side-title {
          font-family: var(--fd); font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 800; line-height: 1.1; letter-spacing: -0.03em;
          margin-bottom: 1rem; color: var(--text);
        }
        .reg-side-sub {
          font-size: 0.9rem; color: var(--muted); line-height: 1.7;
          font-weight: 400; max-width: 340px; margin-bottom: 2rem;
        }
        .reg-side-stats {
          display: grid; grid-template-columns: repeat(2, 1fr);
          gap: 1px; background: var(--border);
          border: 1px solid var(--border); border-radius: 20px; overflow: hidden;
        }
        .reg-side-stat {
          background: var(--surface);
          padding: 1.2rem 1rem; text-align: center;
          transition: background 0.2s;
        }
        .reg-side-stat:hover {
          background: rgba(88, 130, 255, 0.06);
        }
        .reg-side-stat-v {
          font-family: var(--fd); font-size: 1.5rem; font-weight: 800;
          letter-spacing: -0.02em; line-height: 1;
          background: linear-gradient(135deg, #fff, #b0c2ff);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin-bottom: 0.3rem;
        }
        .reg-side-stat-l {
          font-size: 0.72rem; color: var(--muted); font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .reg-side {
            display: none;
          }
          .reg-main {
            justify-content: center;
            gap: 0;
          }
        }
        @media (max-width: 768px) {
          .reg-nav {
            padding: 0 1.25rem; height: 58px;
          }
          .reg-nav-label {
            display: none;
          }
          .reg-main {
            padding: 5rem 1.25rem 3rem;
          }
          .reg-card {
            padding: 2rem 1.5rem;
          }
        }
        @media (max-width: 480px) {
          .reg-card {
            border-radius: 20px;
            padding: 1.75rem 1.25rem;
          }
          .reg-card-title {
            font-size: 1.5rem;
          }
          .reg-toast {
            white-space: normal;
            text-align: center;
            max-width: 90%;
            padding: 10px 18px;
          }
          .reg-select {
            font-size: 0.85rem;
            padding: 10px 38px 10px 36px;
          }
        }
      `}</style>
    </div>
  );
}
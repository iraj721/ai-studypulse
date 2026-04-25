import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../services/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [focused, setFocused] = useState("");
  const [toast, setToast] = useState(null);
  const sidebarRef = useRef(null);
  const toastTimer = useRef(null);

  const showToast = (msg, type = "error") => {
    setToast({ message: msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  // Open sidebar
  const openSidebar = () => {
    setSidebarOpen(true);
    document.body.style.overflow = "hidden";
  };

  // Close sidebar
  const closeSidebar = () => {
    setSidebarOpen(false);
    document.body.style.overflow = "unset";
  };

  // Handle navigation from sidebar
  const handleNavClick = (path) => {
    closeSidebar();
    navigate(path);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeSidebar();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  // Clear toasts on unmount
  useEffect(() => {
    return () => clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const checkPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/\d/)) strength++;
    if (pass.match(/[@$!%*?&]/)) strength++;
    setPasswordStrength(strength);
  };

  const validatePassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pass);
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "#ef4444";
    if (passwordStrength <= 2) return "#f59e0b";
    if (passwordStrength <= 3) return "#06b6d4";
    return "#10b981";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 2) return "Fair";
    if (passwordStrength <= 3) return "Good";
    return "Strong";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validatePassword(password)) {
      const msg = "Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)";
      setError(msg);
      showToast(msg, "error");
      return;
    }

    if (password !== confirmPassword) {
      const msg = "Passwords do not match";
      setError(msg);
      showToast(msg, "error");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setSuccess("Password reset successfully! Redirecting to login...");
      showToast("Password reset successful!", "success");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to reset password";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rp-root">
      {/* Background Elements */}
      <div className="rp-bg" />
      <div className="rp-grid" />
      <div className="rp-orb rp-orb-a" />
      <div className="rp-orb rp-orb-b" />
      <div className="rp-orb rp-orb-c" />

      {/* Toast Notification */}
      {toast && (
        <div className={`rp-toast rp-toast-${toast.type}`}>
          <span className="rp-toast-icon">
            {toast.type === "success" ? "✓" : "✕"}
          </span>
          {toast.message}
        </div>
      )}

      {/* Dark Overlay for Sidebar */}
      <div className={`rp-overlay ${sidebarOpen ? "rp-overlay--visible" : ""}`} onClick={closeSidebar} />

      {/* Sidebar Drawer */}
      <div className={`rp-sidebar ${sidebarOpen ? "rp-sidebar--open" : ""}`} ref={sidebarRef}>
        <div className="rp-sidebar-header">
          <div className="rp-logo">
            <span className="rp-logo-gem">◈</span>
            StudyPulse
          </div>
          <button className="rp-sidebar-close" onClick={closeSidebar}>
            ✕
          </button>
        </div>
        <div className="rp-sidebar-links">
          <button onClick={() => handleNavClick("/")} className="rp-sidebar-link">
            <span className="rp-sidebar-icon">🏠</span>
            Home
          </button>
          <button onClick={() => handleNavClick("/about")} className="rp-sidebar-link">
            <span className="rp-sidebar-icon">📖</span>
            About
          </button>
          <button onClick={() => handleNavClick("/contact")} className="rp-sidebar-link">
            <span className="rp-sidebar-icon">📧</span>
            Contact
          </button>
          <button onClick={() => handleNavClick("/login")} className="rp-sidebar-link">
            <span className="rp-sidebar-icon">🔐</span>
            Sign In
          </button>
          <button onClick={() => handleNavClick("/register")} className="rp-sidebar-solid">
            Get Started
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="rp-nav">
        <div className="rp-nav-container">
          <Link to="/" className="rp-logo">
            <span className="rp-logo-gem">◈</span>
            StudyPulse
          </Link>

          {/* Desktop Navigation */}
          <div className="rp-nav-desktop">
            <Link to="/" className="rp-nav-link">Home</Link>
            <Link to="/about" className="rp-nav-link">About</Link>
            <Link to="/contact" className="rp-nav-link">Contact</Link>
            <Link to="/login" className="rp-nav-ghost">Sign In</Link>
            <Link to="/register" className="rp-nav-solid">Get Started</Link>
          </div>

          {/* Hamburger Menu Button */}
          <button className="rp-hamburger" onClick={openSidebar}>
            <span className="rp-hamburger-line"></span>
            <span className="rp-hamburger-line"></span>
            <span className="rp-hamburger-line"></span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="rp-main">
        <div className="rp-card">
          <div className="rp-card-glow" />
          
          <div className="rp-card-header">
            <div className="rp-icon-wrapper">
              <svg className="rp-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM9 12h3l-2.5 3 2.5 3H9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v3m0 0v3m0-3h3m-3 0H9" />
              </svg>
            </div>
            <h1 className="rp-title">Reset <span className="rp-grad">Password</span></h1>
            <p className="rp-subtitle">
              Enter your new password below.
            </p>
          </div>

          <form className="rp-form" onSubmit={handleSubmit} noValidate>
            {/* New Password */}
            <div className={`rp-field ${focused === "password" ? "rp-field-focus" : ""} ${password ? "rp-field-filled" : ""}`}>
              <label className="rp-label" htmlFor="password">New Password</label>
              <div className="rp-input-wrap">
                <svg className="rp-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    checkPasswordStrength(e.target.value);
                  }}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  className="rp-input"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  className="rp-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
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
              {password && (
                <div className="rp-strength">
                  <div className="rp-strength-bars">
                    <div className={`rp-strength-bar ${passwordStrength >= 1 ? "active" : ""}`} style={{ backgroundColor: passwordStrength >= 1 ? getStrengthColor() : "" }} />
                    <div className={`rp-strength-bar ${passwordStrength >= 2 ? "active" : ""}`} style={{ backgroundColor: passwordStrength >= 2 ? getStrengthColor() : "" }} />
                    <div className={`rp-strength-bar ${passwordStrength >= 3 ? "active" : ""}`} style={{ backgroundColor: passwordStrength >= 3 ? getStrengthColor() : "" }} />
                    <div className={`rp-strength-bar ${passwordStrength >= 4 ? "active" : ""}`} style={{ backgroundColor: passwordStrength >= 4 ? getStrengthColor() : "" }} />
                  </div>
                  <div className="rp-strength-text">
                    <span style={{ color: getStrengthColor() }}>{getStrengthText()}</span> password
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className={`rp-field ${focused === "confirmPassword" ? "rp-field-focus" : ""} ${confirmPassword ? "rp-field-filled" : ""}`}>
              <label className="rp-label" htmlFor="confirmPassword">Confirm Password</label>
              <div className="rp-input-wrap">
                <svg className="rp-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocused("confirmPassword")}
                  onBlur={() => setFocused("")}
                  className="rp-input"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="rp-eye"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
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
              {confirmPassword && password !== confirmPassword && (
                <div className="rp-error-msg">✗ Passwords do not match</div>
              )}
              {confirmPassword && password === confirmPassword && password.length > 0 && (
                <div className="rp-success-msg">✓ Passwords match</div>
              )}
            </div>

            <button
              type="submit"
              className={`rp-submit ${loading ? "rp-submit-loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="rp-spinner" />
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="rp-card-footer">
            <Link to="/login" className="rp-back-link">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M11.5 7h-9M6 3.5L2.5 7 6 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Login
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="rp-footer">
        <div className="rp-footer-inner">
          <div className="rp-logo rp-logo-sm">
            <span className="rp-logo-gem">◈</span> StudyPulse
          </div>
          <div className="rp-footer-links">
            <Link to="/about" className="rp-footer-link">About</Link>
            <Link to="/contact" className="rp-footer-link">Contact</Link>
            <Link to="/privacy" className="rp-footer-link">Privacy Policy</Link>
            <Link to="/terms" className="rp-footer-link">Terms of Service</Link>
          </div>
          <div className="rp-footer-copy">
            © 2025 StudyPulse — Built for students who want more.
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .rp-root {
          --bg: #0a0c12;
          --surface: #111318;
          --surface2: #181b22;
          --border: rgba(88, 130, 255, 0.12);
          --border-h: rgba(88, 130, 255, 0.28);
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

        .rp-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .rp-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background */
        .rp-bg {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.1) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 90% 70%, rgba(32, 230, 208, 0.05) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 10% 80%, rgba(155, 122, 255, 0.05) 0%, transparent 55%);
        }
        .rp-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 80%);
        }
        .rp-orb {
          position: fixed; border-radius: 50%; filter: blur(90px);
          pointer-events: none; z-index: 0;
        }
        .rp-orb-a {
          width: 460px; height: 460px; top: -140px; left: 50%;
          transform: translateX(-50%);
          background: rgba(88, 130, 255, 0.08);
          animation: orbA 9s ease-in-out infinite;
        }
        .rp-orb-b {
          width: 280px; height: 280px; bottom: 10%; right: -3%;
          background: rgba(32, 230, 208, 0.05);
          animation: orbB 11s 2s ease-in-out infinite;
        }
        .rp-orb-c {
          width: 240px; height: 240px; top: 30%; left: -4%;
          background: rgba(155, 122, 255, 0.05);
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

        /* Toast */
        .rp-toast {
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
        .rp-toast-success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #6ee7b7;
        }
        .rp-toast-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
        }
        .rp-toast-icon {
          font-size: 1rem; line-height: 1;
        }

        /* Nav */
        .rp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(10, 12, 18, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .rp-nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .rp-logo {
          font-family: var(--fd); font-size: 1.15rem; font-weight: 700;
          letter-spacing: -0.02em; color: var(--text);
          display: flex; align-items: center; gap: 7px;
          text-decoration: none;
        }
        .rp-logo-sm { font-size: 1rem; }
        .rp-logo-gem {
          color: var(--accent);
          filter: drop-shadow(0 0 6px rgba(88, 130, 255, 0.55));
        }
        .rp-nav-desktop {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .rp-nav-link {
          font-size: 0.85rem; font-weight: 500;
          color: var(--muted); text-decoration: none;
          transition: color 0.2s;
          padding: 0.5rem 0.75rem;
        }
        .rp-nav-link:hover { color: var(--text); }
        .rp-nav-ghost {
          font-size: 0.85rem; font-weight: 500;
          padding: 0.5rem 1.25rem;
          border-radius: 40px;
          border: 1px solid var(--border-h);
          color: var(--muted); background: transparent;
          text-decoration: none; transition: all 0.2s;
        }
        .rp-nav-ghost:hover {
          color: var(--text);
          background: rgba(88, 130, 255, 0.08);
        }
        .rp-nav-solid {
          font-size: 0.85rem; font-weight: 600;
          padding: 0.5rem 1.5rem;
          border-radius: 40px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: #fff; text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(88, 130, 255, 0.3);
        }
        .rp-nav-solid:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(88, 130, 255, 0.45);
        }

        /* Hamburger Menu Button */
        .rp-hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          cursor: pointer;
          z-index: 110;
        }
        .rp-hamburger-line {
          width: 22px;
          height: 2px;
          background: var(--text);
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        /* Sidebar Overlay */
        .rp-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0);
          z-index: 198;
          transition: background 0.3s ease;
          pointer-events: none;
        }
        .rp-overlay--visible {
          background: rgba(0, 0, 0, 0.7);
          pointer-events: auto;
        }

        /* Sidebar Drawer */
        .rp-sidebar {
          position: fixed;
          top: 0;
          right: -100%;
          width: 280px;
          height: 100vh;
          background: rgba(17, 19, 24, 0.98);
          backdrop-filter: blur(20px);
          border-left: 1px solid var(--border);
          z-index: 199;
          transition: right 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        .rp-sidebar--open {
          right: 0;
        }
        .rp-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .rp-sidebar-close {
          background: transparent;
          border: none;
          color: var(--muted);
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.5rem;
          transition: color 0.2s;
        }
        .rp-sidebar-close:hover {
          color: var(--text);
        }
        .rp-sidebar-links {
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          gap: 0.75rem;
        }
        .rp-sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 1rem;
          font-weight: 500;
          color: var(--text);
          text-decoration: none;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          transition: background 0.2s;
          background: transparent;
          border: none;
          cursor: pointer;
          width: 100%;
          text-align: left;
          font-family: var(--fb);
        }
        .rp-sidebar-link:hover {
          background: rgba(88, 130, 255, 0.1);
        }
        .rp-sidebar-icon {
          font-size: 1.1rem;
        }
        .rp-sidebar-solid {
          font-size: 1rem;
          font-weight: 600;
          text-align: center;
          padding: 0.75rem 1rem;
          border-radius: 40px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: #fff;
          text-decoration: none;
          margin-top: 0.5rem;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          font-family: var(--fb);
        }
        .rp-sidebar-solid:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(88, 130, 255, 0.4);
        }

        /* Main Content */
        .rp-main {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6rem 2rem 4rem;
          position: relative;
          z-index: 10;
        }

        /* Card */
        .rp-card {
          max-width: 460px;
          width: 100%;
          background: rgba(17, 19, 24, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 28px;
          padding: 2.5rem;
          position: relative;
          transition: all 0.3s ease;
          animation: cardIn 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.1) both;
        }
        .rp-card:hover {
          border-color: var(--border-h);
          transform: translateY(-4px);
        }
        .rp-card-glow {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(88, 130, 255, 0.1), transparent);
          filter: blur(60px);
          pointer-events: none;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Card Header */
        .rp-card-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .rp-icon-wrapper {
          width: 70px;
          height: 70px;
          background: rgba(88, 130, 255, 0.1);
          border: 1px solid rgba(88, 130, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }
        .rp-icon {
          color: var(--accent);
        }
        .rp-title {
          font-family: var(--fd);
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }
        .rp-subtitle {
          font-size: 0.85rem;
          color: var(--muted);
          line-height: 1.5;
        }

        /* Form */
        .rp-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .rp-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .rp-label {
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--muted);
          transition: color 0.2s;
        }
        .rp-field-focus .rp-label {
          color: var(--accent);
        }
        .rp-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .rp-input-icon {
          position: absolute;
          left: 13px;
          color: var(--faint);
          pointer-events: none;
          transition: color 0.2s;
        }
        .rp-field-focus .rp-input-icon {
          color: var(--accent);
        }
        .rp-input {
          width: 100%;
          font-family: var(--fb);
          font-size: 0.9rem;
          color: var(--text);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 11px 42px 11px 40px;
          outline: none;
          transition: all 0.2s;
        }
        .rp-input:focus {
          border-color: rgba(88, 130, 255, 0.5);
          background: rgba(88, 130, 255, 0.04);
          box-shadow: 0 0 0 3px rgba(88, 130, 255, 0.1);
        }
        .rp-input::placeholder {
          color: var(--faint);
          font-size: 0.85rem;
        }
        .rp-eye {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--faint);
          padding: 4px;
          transition: color 0.2s;
        }
        .rp-eye:hover {
          color: var(--muted);
        }

        /* Password Strength */
        .rp-strength {
          margin-top: 0.5rem;
        }
        .rp-strength-bars {
          display: flex;
          gap: 6px;
          margin-bottom: 0.5rem;
        }
        .rp-strength-bar {
          flex: 1;
          height: 3px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          transition: background 0.3s;
        }
        .rp-strength-bar.active {
          background: var(--accent);
        }
        .rp-strength-text {
          font-size: 0.7rem;
          color: var(--faint);
        }
        .rp-error-msg {
          font-size: 0.7rem;
          color: var(--error);
          margin-top: 0.3rem;
        }
        .rp-success-msg {
          font-size: 0.7rem;
          color: var(--success);
          margin-top: 0.3rem;
        }

        /* Submit Button */
        .rp-submit {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-family: var(--fb);
          font-size: 0.95rem;
          font-weight: 600;
          padding: 13px 24px;
          border-radius: 48px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          border: none;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(88, 130, 255, 0.35);
        }
        .rp-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(88, 130, 255, 0.5);
        }
        .rp-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .rp-spinner {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: #fff;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Card Footer */
        .rp-card-footer {
          margin-top: 1.5rem;
          text-align: center;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .rp-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .rp-back-link:hover {
          color: var(--accent);
        }

        /* Footer */
        .rp-footer {
          padding: 2rem 2rem 1.5rem;
          border-top: 1px solid var(--border);
          background: rgba(10, 12, 18, 0.8);
          position: relative;
          z-index: 10;
        }
        .rp-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .rp-footer-links {
          display: flex;
          gap: 1.8rem;
          flex-wrap: wrap;
        }
        .rp-footer-link {
          font-size: 0.8rem;
          color: var(--faint);
          text-decoration: none;
          transition: color 0.2s;
        }
        .rp-footer-link:hover {
          color: var(--accent);
        }
        .rp-footer-copy {
          font-size: 0.75rem;
          color: var(--faint);
          width: 100%;
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
          margin-top: 0.5rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .rp-nav-desktop {
            display: none;
          }
          .rp-hamburger {
            display: flex;
          }
          .rp-nav-container {
            padding: 0 1.25rem;
            height: 58px;
          }
          .rp-main {
            padding: 5rem 1.25rem 3rem;
          }
          .rp-card {
            padding: 1.75rem;
          }
          .rp-title {
            font-size: 1.5rem;
          }
          .rp-toast {
            white-space: normal;
            text-align: center;
            max-width: 90%;
          }
          .rp-footer-inner {
            flex-direction: column;
            text-align: center;
          }
          .rp-footer-links {
            justify-content: center;
          }
        }
        @media (max-width: 480px) {
          .rp-card {
            padding: 1.5rem;
          }
          .rp-icon-wrapper {
            width: 55px;
            height: 55px;
          }
          .rp-icon {
            width: 30px;
            height: 30px;
          }
        }
      `}</style>
    </div>
  );
}
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showToast("Please enter your email address.", "error");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      await api.post("/auth/forgot-password", { email });
      setMessage("Password reset link sent to your email!");
      showToast("Reset link sent! Check your email.", "success");
      setEmail("");
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to send reset link";
      setError(errorMsg);
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-root">
      {/* Background Elements */}
      <div className="fp-bg" />
      <div className="fp-grid" />
      <div className="fp-orb fp-orb-a" />
      <div className="fp-orb fp-orb-b" />
      <div className="fp-orb fp-orb-c" />

      {/* Toast Notification */}
      {toast && (
        <div className={`fp-toast fp-toast-${toast.type}`}>
          <span className="fp-toast-icon">
            {toast.type === "success" ? "✓" : "✕"}
          </span>
          {toast.message}
        </div>
      )}

      {/* Dark Overlay for Sidebar */}
      <div className={`fp-overlay ${sidebarOpen ? "fp-overlay--visible" : ""}`} onClick={closeSidebar} />

      {/* Sidebar Drawer */}
      <div className={`fp-sidebar ${sidebarOpen ? "fp-sidebar--open" : ""}`} ref={sidebarRef}>
        <div className="fp-sidebar-header">
          <div className="fp-logo">
            <span className="fp-logo-gem">◈</span>
            StudyPulse
          </div>
          <button className="fp-sidebar-close" onClick={closeSidebar}>
            ✕
          </button>
        </div>
        <div className="fp-sidebar-links">
          <button onClick={() => handleNavClick("/")} className="fp-sidebar-link">
            <span className="fp-sidebar-icon">🏠</span>
            Home
          </button>
          <button onClick={() => handleNavClick("/about")} className="fp-sidebar-link">
            <span className="fp-sidebar-icon">📖</span>
            About
          </button>
          <button onClick={() => handleNavClick("/contact")} className="fp-sidebar-link">
            <span className="fp-sidebar-icon">📧</span>
            Contact
          </button>
          <button onClick={() => handleNavClick("/login")} className="fp-sidebar-link">
            <span className="fp-sidebar-icon">🔐</span>
            Sign In
          </button>
          <button onClick={() => handleNavClick("/register")} className="fp-sidebar-solid">
            Get Started
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="fp-nav">
        <div className="fp-nav-container">
          <Link to="/" className="fp-logo">
            <span className="fp-logo-gem">◈</span>
            StudyPulse
          </Link>

          {/* Desktop Navigation */}
          <div className="fp-nav-desktop">
            <Link to="/" className="fp-nav-link">Home</Link>
            <Link to="/about" className="fp-nav-link">About</Link>
            <Link to="/contact" className="fp-nav-link">Contact</Link>
            <Link to="/login" className="fp-nav-ghost">Sign In</Link>
            <Link to="/register" className="fp-nav-solid">Get Started</Link>
          </div>

          {/* Hamburger Menu Button */}
          <button className="fp-hamburger" onClick={openSidebar}>
            <span className="fp-hamburger-line"></span>
            <span className="fp-hamburger-line"></span>
            <span className="fp-hamburger-line"></span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="fp-main">
        <div className="fp-card">
          <div className="fp-card-glow" />
          
          <div className="fp-card-header">
            <div className="fp-icon-wrapper">
              <svg className="fp-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7.5a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM9 12h3l-2.5 3 2.5 3H9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v3m0 0v3m0-3h3m-3 0H9" />
              </svg>
            </div>
            <h1 className="fp-title">Forgot <span className="fp-grad">Password?</span></h1>
            <p className="fp-subtitle">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form className="fp-form" onSubmit={handleSubmit} noValidate>
            <div className={`fp-field ${focused === "email" ? "fp-field-focus" : ""} ${email ? "fp-field-filled" : ""}`}>
              <label className="fp-label" htmlFor="email">Email address</label>
              <div className="fp-input-wrap">
                <svg className="fp-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M1 5.5l6.293 4.207a1 1 0 001.414 0L15 5.5" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  className="fp-input"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`fp-submit ${loading ? "fp-submit-loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="fp-spinner" />
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Link
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="fp-card-footer">
            <Link to="/login" className="fp-back-link">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M11.5 7h-9M6 3.5L2.5 7 6 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Login
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fp-footer">
        <div className="fp-footer-inner">
          <div className="fp-logo fp-logo-sm">
            <span className="fp-logo-gem">◈</span> StudyPulse
          </div>
          <div className="fp-footer-links">
            <Link to="/about" className="fp-footer-link">About</Link>
            <Link to="/contact" className="fp-footer-link">Contact</Link>
            <Link to="/privacy" className="fp-footer-link">Privacy Policy</Link>
            <Link to="/terms" className="fp-footer-link">Terms of Service</Link>
          </div>
          <div className="fp-footer-copy">
            © 2025 StudyPulse — Built for students who want more.
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .fp-root {
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

        .fp-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .fp-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background */
        .fp-bg {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.1) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 90% 70%, rgba(32, 230, 208, 0.05) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 10% 80%, rgba(155, 122, 255, 0.05) 0%, transparent 55%);
        }
        .fp-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 80%);
        }
        .fp-orb {
          position: fixed; border-radius: 50%; filter: blur(90px);
          pointer-events: none; z-index: 0;
        }
        .fp-orb-a {
          width: 460px; height: 460px; top: -140px; left: 50%;
          transform: translateX(-50%);
          background: rgba(88, 130, 255, 0.08);
          animation: orbA 9s ease-in-out infinite;
        }
        .fp-orb-b {
          width: 280px; height: 280px; bottom: 10%; right: -3%;
          background: rgba(32, 230, 208, 0.05);
          animation: orbB 11s 2s ease-in-out infinite;
        }
        .fp-orb-c {
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
        .fp-toast {
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
        .fp-toast-success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #6ee7b7;
        }
        .fp-toast-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
        }
        .fp-toast-icon {
          font-size: 1rem; line-height: 1;
        }

        /* Nav */
        .fp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(10, 12, 18, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .fp-nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .fp-logo {
          font-family: var(--fd); font-size: 1.15rem; font-weight: 700;
          letter-spacing: -0.02em; color: var(--text);
          display: flex; align-items: center; gap: 7px;
          text-decoration: none;
        }
        .fp-logo-sm { font-size: 1rem; }
        .fp-logo-gem {
          color: var(--accent);
          filter: drop-shadow(0 0 6px rgba(88, 130, 255, 0.55));
        }
        .fp-nav-desktop {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .fp-nav-link {
          font-size: 0.85rem; font-weight: 500;
          color: var(--muted); text-decoration: none;
          transition: color 0.2s;
          padding: 0.5rem 0.75rem;
        }
        .fp-nav-link:hover { color: var(--text); }
        .fp-nav-ghost {
          font-size: 0.85rem; font-weight: 500;
          padding: 0.5rem 1.25rem;
          border-radius: 40px;
          border: 1px solid var(--border-h);
          color: var(--muted); background: transparent;
          text-decoration: none; transition: all 0.2s;
        }
        .fp-nav-ghost:hover {
          color: var(--text);
          background: rgba(88, 130, 255, 0.08);
        }
        .fp-nav-solid {
          font-size: 0.85rem; font-weight: 600;
          padding: 0.5rem 1.5rem;
          border-radius: 40px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: #fff; text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(88, 130, 255, 0.3);
        }
        .fp-nav-solid:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(88, 130, 255, 0.45);
        }

        /* Hamburger Menu Button */
        .fp-hamburger {
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
        .fp-hamburger-line {
          width: 22px;
          height: 2px;
          background: var(--text);
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        /* Sidebar Overlay */
        .fp-overlay {
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
        .fp-overlay--visible {
          background: rgba(0, 0, 0, 0.7);
          pointer-events: auto;
        }

        /* Sidebar Drawer */
        .fp-sidebar {
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
        .fp-sidebar--open {
          right: 0;
        }
        .fp-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .fp-sidebar-close {
          background: transparent;
          border: none;
          color: var(--muted);
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.5rem;
          transition: color 0.2s;
        }
        .fp-sidebar-close:hover {
          color: var(--text);
        }
        .fp-sidebar-links {
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          gap: 0.75rem;
        }
        .fp-sidebar-link {
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
        .fp-sidebar-link:hover {
          background: rgba(88, 130, 255, 0.1);
        }
        .fp-sidebar-icon {
          font-size: 1.1rem;
        }
        .fp-sidebar-solid {
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
        .fp-sidebar-solid:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(88, 130, 255, 0.4);
        }

        /* Main Content */
        .fp-main {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6rem 2rem 4rem;
          position: relative;
          z-index: 10;
        }

        /* Card */
        .fp-card {
          max-width: 440px;
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
        .fp-card:hover {
          border-color: var(--border-h);
          transform: translateY(-4px);
        }
        .fp-card-glow {
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
        .fp-card-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .fp-icon-wrapper {
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
        .fp-icon {
          color: var(--accent);
        }
        .fp-title {
          font-family: var(--fd);
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }
        .fp-subtitle {
          font-size: 0.85rem;
          color: var(--muted);
          line-height: 1.5;
        }

        /* Form */
        .fp-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .fp-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .fp-label {
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--muted);
          transition: color 0.2s;
        }
        .fp-field-focus .fp-label {
          color: var(--accent);
        }
        .fp-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .fp-input-icon {
          position: absolute;
          left: 13px;
          color: var(--faint);
          pointer-events: none;
          transition: color 0.2s;
        }
        .fp-field-focus .fp-input-icon {
          color: var(--accent);
        }
        .fp-input {
          width: 100%;
          font-family: var(--fb);
          font-size: 0.9rem;
          color: var(--text);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 11px 14px 11px 40px;
          outline: none;
          transition: all 0.2s;
        }
        .fp-input:focus {
          border-color: rgba(88, 130, 255, 0.5);
          background: rgba(88, 130, 255, 0.04);
          box-shadow: 0 0 0 3px rgba(88, 130, 255, 0.1);
        }
        .fp-input::placeholder {
          color: var(--faint);
          font-size: 0.85rem;
        }

        /* Submit Button */
        .fp-submit {
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
        .fp-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(88, 130, 255, 0.5);
        }
        .fp-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .fp-spinner {
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
        .fp-card-footer {
          margin-top: 1.5rem;
          text-align: center;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .fp-back-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .fp-back-link:hover {
          color: var(--accent);
        }

        /* Footer */
        .fp-footer {
          padding: 2rem 2rem 1.5rem;
          border-top: 1px solid var(--border);
          background: rgba(10, 12, 18, 0.8);
          position: relative;
          z-index: 10;
        }
        .fp-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .fp-footer-links {
          display: flex;
          gap: 1.8rem;
          flex-wrap: wrap;
        }
        .fp-footer-link {
          font-size: 0.8rem;
          color: var(--faint);
          text-decoration: none;
          transition: color 0.2s;
        }
        .fp-footer-link:hover {
          color: var(--accent);
        }
        .fp-footer-copy {
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
          .fp-nav-desktop {
            display: none;
          }
          .fp-hamburger {
            display: flex;
          }
          .fp-nav-container {
            padding: 0 1.25rem;
            height: 58px;
          }
          .fp-main {
            padding: 5rem 1.25rem 3rem;
          }
          .fp-card {
            padding: 1.75rem;
          }
          .fp-title {
            font-size: 1.5rem;
          }
          .fp-toast {
            white-space: normal;
            text-align: center;
            max-width: 90%;
          }
          .fp-footer-inner {
            flex-direction: column;
            text-align: center;
          }
          .fp-footer-links {
            justify-content: center;
          }
        }
        @media (max-width: 480px) {
          .fp-card {
            padding: 1.5rem;
          }
          .fp-icon-wrapper {
            width: 55px;
            height: 55px;
          }
          .fp-icon {
            width: 30px;
            height: 30px;
          }
        }
      `}</style>
    </div>
  );
}
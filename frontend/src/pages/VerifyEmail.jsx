import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../services/api";

export default function VerifyEmail() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const sidebarRef = useRef(null);
  const toastTimer = useRef(null);
  const email = location.state?.email || localStorage.getItem("pendingEmail");

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
    if (!email) {
      navigate("/register");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      setError("Please enter 6-digit code");
      showToast("Please enter 6-digit code", "error");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/auth/verify-email", {
        email,
        code: verificationCode,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.removeItem("pendingEmail");
      
      setSuccess("Email verified successfully! Redirecting...");
      showToast("Email verified successfully!", "success");
      
      setTimeout(() => {
        if (res.data.user?.role === "teacher") {
          navigate("/teacher/dashboard");
        } else if (res.data.user?.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || "Verification failed";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/resend-verification", { email });
      setTimeLeft(600);
      setCanResend(false);
      setSuccess("New verification code sent to your email!");
      showToast("New verification code sent!", "success");
      
      setCode(["", "", "", "", "", ""]);
      document.getElementById("code-0")?.focus();
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to resend code";
      setError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="ve-root">
      {/* Background Elements */}
      <div className="ve-bg" />
      <div className="ve-grid" />
      <div className="ve-orb ve-orb-a" />
      <div className="ve-orb ve-orb-b" />
      <div className="ve-orb ve-orb-c" />

      {/* Toast Notification */}
      {toast && (
        <div className={`ve-toast ve-toast-${toast.type}`}>
          <span className="ve-toast-icon">
            {toast.type === "success" ? "✓" : "✕"}
          </span>
          {toast.message}
        </div>
      )}

      {/* Dark Overlay for Sidebar */}
      <div className={`ve-overlay ${sidebarOpen ? "ve-overlay--visible" : ""}`} onClick={closeSidebar} />

      {/* Sidebar Drawer */}
      <div className={`ve-sidebar ${sidebarOpen ? "ve-sidebar--open" : ""}`} ref={sidebarRef}>
        <div className="ve-sidebar-header">
          <div className="ve-logo">
            <span className="ve-logo-gem">◈</span>
            StudyPulse
          </div>
          <button className="ve-sidebar-close" onClick={closeSidebar}>
            ✕
          </button>
        </div>
        <div className="ve-sidebar-links">
          <button onClick={() => handleNavClick("/")} className="ve-sidebar-link">
            <span className="ve-sidebar-icon">🏠</span>
            Home
          </button>
          <button onClick={() => handleNavClick("/about")} className="ve-sidebar-link">
            <span className="ve-sidebar-icon">📖</span>
            About
          </button>
          <button onClick={() => handleNavClick("/contact")} className="ve-sidebar-link">
            <span className="ve-sidebar-icon">📧</span>
            Contact
          </button>
          <button onClick={() => handleNavClick("/login")} className="ve-sidebar-link">
            <span className="ve-sidebar-icon">🔐</span>
            Sign In
          </button>
          <button onClick={() => handleNavClick("/register")} className="ve-sidebar-solid">
            Get Started
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="ve-nav">
        <div className="ve-nav-container">
          <Link to="/" className="ve-logo">
            <span className="ve-logo-gem">◈</span>
            StudyPulse
          </Link>

          {/* Desktop Navigation */}
          <div className="ve-nav-desktop">
            <Link to="/" className="ve-nav-link">Home</Link>
            <Link to="/about" className="ve-nav-link">About</Link>
            <Link to="/contact" className="ve-nav-link">Contact</Link>
            <Link to="/login" className="ve-nav-ghost">Sign In</Link>
            <Link to="/register" className="ve-nav-solid">Get Started</Link>
          </div>

          {/* Hamburger Menu Button */}
          <button className="ve-hamburger" onClick={openSidebar}>
            <span className="ve-hamburger-line"></span>
            <span className="ve-hamburger-line"></span>
            <span className="ve-hamburger-line"></span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="ve-main">
        <div className="ve-card">
          <div className="ve-card-glow" />
          
          <div className="ve-card-header">
            <div className="ve-icon-wrapper">
              <svg className="ve-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="ve-title">Verify Your <span className="ve-grad">Email</span></h1>
            <p className="ve-subtitle">
              We've sent a verification code to
            </p>
            <p className="ve-email">{email}</p>
          </div>

          <div className="ve-otp-section">
            <label className="ve-otp-label">Enter 6-Digit Code</label>
            <div className="ve-otp-inputs">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="ve-otp-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={loading}
            className={`ve-submit ${loading ? "ve-submit-loading" : ""}`}
          >
            {loading ? (
              <>
                <span className="ve-spinner" />
                Verifying...
              </>
            ) : (
              <>
                Verify Email
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>

          <div className="ve-resend">
            {canResend ? (
              <button
                onClick={handleResendCode}
                disabled={loading}
                className="ve-resend-btn"
              >
                Resend Verification Code
              </button>
            ) : (
              <p className="ve-timer">
                Resend code in <span className="ve-timer-value">{formatTime(timeLeft)}</span>
              </p>
            )}
          </div>

          <div className="ve-card-footer">
            <p className="ve-footer-text">
              Wrong email?{" "}
              <button
                onClick={() => navigate("/register")}
                className="ve-footer-link"
              >
                Go back to Register
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="ve-footer">
        <div className="ve-footer-inner">
          <div className="ve-logo ve-logo-sm">
            <span className="ve-logo-gem">◈</span> StudyPulse
          </div>
          <div className="ve-footer-links">
            <Link to="/about" className="ve-footer-link">About</Link>
            <Link to="/contact" className="ve-footer-link">Contact</Link>
            <Link to="/privacy" className="ve-footer-link">Privacy Policy</Link>
            <Link to="/terms" className="ve-footer-link">Terms of Service</Link>
          </div>
          <div className="ve-footer-copy">
            © 2025 StudyPulse — Built for students who want more.
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .ve-root {
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

        .ve-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .ve-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background */
        .ve-bg {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.1) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 90% 70%, rgba(32, 230, 208, 0.05) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 10% 80%, rgba(155, 122, 255, 0.05) 0%, transparent 55%);
        }
        .ve-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 80%);
        }
        .ve-orb {
          position: fixed; border-radius: 50%; filter: blur(90px);
          pointer-events: none; z-index: 0;
        }
        .ve-orb-a {
          width: 460px; height: 460px; top: -140px; left: 50%;
          transform: translateX(-50%);
          background: rgba(88, 130, 255, 0.08);
          animation: orbA 9s ease-in-out infinite;
        }
        .ve-orb-b {
          width: 280px; height: 280px; bottom: 10%; right: -3%;
          background: rgba(32, 230, 208, 0.05);
          animation: orbB 11s 2s ease-in-out infinite;
        }
        .ve-orb-c {
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
        .ve-toast {
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
        .ve-toast-success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #6ee7b7;
        }
        .ve-toast-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
        }
        .ve-toast-icon {
          font-size: 1rem; line-height: 1;
        }

        /* Nav */
        .ve-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(10, 12, 18, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .ve-nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ve-logo {
          font-family: var(--fd); font-size: 1.15rem; font-weight: 700;
          letter-spacing: -0.02em; color: var(--text);
          display: flex; align-items: center; gap: 7px;
          text-decoration: none;
        }
        .ve-logo-sm { font-size: 1rem; }
        .ve-logo-gem {
          color: var(--accent);
          filter: drop-shadow(0 0 6px rgba(88, 130, 255, 0.55));
        }
        .ve-nav-desktop {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .ve-nav-link {
          font-size: 0.85rem; font-weight: 500;
          color: var(--muted); text-decoration: none;
          transition: color 0.2s;
          padding: 0.5rem 0.75rem;
        }
        .ve-nav-link:hover { color: var(--text); }
        .ve-nav-ghost {
          font-size: 0.85rem; font-weight: 500;
          padding: 0.5rem 1.25rem;
          border-radius: 40px;
          border: 1px solid var(--border-h);
          color: var(--muted); background: transparent;
          text-decoration: none; transition: all 0.2s;
        }
        .ve-nav-ghost:hover {
          color: var(--text);
          background: rgba(88, 130, 255, 0.08);
        }
        .ve-nav-solid {
          font-size: 0.85rem; font-weight: 600;
          padding: 0.5rem 1.5rem;
          border-radius: 40px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: #fff; text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(88, 130, 255, 0.3);
        }
        .ve-nav-solid:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(88, 130, 255, 0.45);
        }

        /* Hamburger Menu Button */
        .ve-hamburger {
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
        .ve-hamburger-line {
          width: 22px;
          height: 2px;
          background: var(--text);
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        /* Sidebar Overlay */
        .ve-overlay {
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
        .ve-overlay--visible {
          background: rgba(0, 0, 0, 0.7);
          pointer-events: auto;
        }

        /* Sidebar Drawer */
        .ve-sidebar {
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
        .ve-sidebar--open {
          right: 0;
        }
        .ve-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .ve-sidebar-close {
          background: transparent;
          border: none;
          color: var(--muted);
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.5rem;
          transition: color 0.2s;
        }
        .ve-sidebar-close:hover {
          color: var(--text);
        }
        .ve-sidebar-links {
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          gap: 0.75rem;
        }
        .ve-sidebar-link {
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
        .ve-sidebar-link:hover {
          background: rgba(88, 130, 255, 0.1);
        }
        .ve-sidebar-icon {
          font-size: 1.1rem;
        }
        .ve-sidebar-solid {
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
        .ve-sidebar-solid:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(88, 130, 255, 0.4);
        }

        /* Main Content */
        .ve-main {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6rem 2rem 4rem;
          position: relative;
          z-index: 10;
        }

        /* Card */
        .ve-card {
          max-width: 480px;
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
        .ve-card:hover {
          border-color: var(--border-h);
          transform: translateY(-4px);
        }
        .ve-card-glow {
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
        .ve-card-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .ve-icon-wrapper {
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
        .ve-icon {
          color: var(--accent);
        }
        .ve-title {
          font-family: var(--fd);
          font-size: 1.75rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 0.5rem;
        }
        .ve-subtitle {
          font-size: 0.85rem;
          color: var(--muted);
        }
        .ve-email {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--accent);
          margin-top: 0.25rem;
          word-break: break-all;
        }

        /* OTP Section */
        .ve-otp-section {
          margin-bottom: 2rem;
        }
        .ve-otp-label {
          display: block;
          text-align: center;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--muted);
          margin-bottom: 1rem;
        }
        .ve-otp-inputs {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
        }
        .ve-otp-input {
          width: 55px;
          height: 60px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 600;
          font-family: var(--fd);
          color: var(--text);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 16px;
          transition: all 0.2s;
        }
        .ve-otp-input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(88, 130, 255, 0.2);
        }

        /* Submit Button */
        .ve-submit {
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
          margin-bottom: 1.5rem;
        }
        .ve-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(88, 130, 255, 0.5);
        }
        .ve-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .ve-spinner {
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

        /* Resend Section */
        .ve-resend {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .ve-resend-btn {
          background: transparent;
          border: none;
          color: var(--accent);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .ve-resend-btn:hover:not(:disabled) {
          opacity: 0.8;
        }
        .ve-resend-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ve-timer {
          font-size: 0.8rem;
          color: var(--faint);
        }
        .ve-timer-value {
          font-weight: 600;
          color: var(--accent);
        }

        /* Card Footer */
        .ve-card-footer {
          text-align: center;
          padding-top: 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .ve-footer-text {
          font-size: 0.8rem;
          color: var(--faint);
        }
        .ve-footer-link {
          background: transparent;
          border: none;
          color: var(--accent);
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .ve-footer-link:hover {
          opacity: 0.8;
        }

        /* Main Footer */
        .ve-footer {
          padding: 2rem 2rem 1.5rem;
          border-top: 1px solid var(--border);
          background: rgba(10, 12, 18, 0.8);
          position: relative;
          z-index: 10;
        }
        .ve-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .ve-footer-links {
          display: flex;
          gap: 1.8rem;
          flex-wrap: wrap;
        }
        .ve-footer-link {
          font-size: 0.8rem;
          color: var(--faint);
          text-decoration: none;
          transition: color 0.2s;
        }
        .ve-footer-link:hover {
          color: var(--accent);
        }
        .ve-footer-copy {
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
          .ve-nav-desktop {
            display: none;
          }
          .ve-hamburger {
            display: flex;
          }
          .ve-nav-container {
            padding: 0 1.25rem;
            height: 58px;
          }
          .ve-main {
            padding: 5rem 1.25rem 3rem;
          }
          .ve-card {
            padding: 1.75rem;
          }
          .ve-title {
            font-size: 1.5rem;
          }
          .ve-otp-input {
            width: 45px;
            height: 50px;
            font-size: 1.25rem;
          }
          .ve-toast {
            white-space: normal;
            text-align: center;
            max-width: 90%;
          }
          .ve-footer-inner {
            flex-direction: column;
            text-align: center;
          }
          .ve-footer-links {
            justify-content: center;
          }
        }
        @media (max-width: 480px) {
          .ve-card {
            padding: 1.5rem;
          }
          .ve-icon-wrapper {
            width: 55px;
            height: 55px;
          }
          .ve-icon {
            width: 30px;
            height: 30px;
          }
          .ve-otp-input {
            width: 40px;
            height: 45px;
            font-size: 1rem;
          }
          .ve-otp-inputs {
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
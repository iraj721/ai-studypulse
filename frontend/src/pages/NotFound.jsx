import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const sidebarRef = useRef(null);
  const timerRef = useRef(null);

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

  // Auto redirect countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [navigate]);

  return (
    <div className="nf-root">
      {/* Background Elements */}
      <div className="nf-bg" />
      <div className="nf-grid" />
      <div className="nf-orb nf-orb-a" />
      <div className="nf-orb nf-orb-b" />
      <div className="nf-orb nf-orb-c" />

      {/* Dark Overlay for Sidebar */}
      <div className={`nf-overlay ${sidebarOpen ? "nf-overlay--visible" : ""}`} onClick={closeSidebar} />

      {/* Sidebar Drawer */}
      <div className={`nf-sidebar ${sidebarOpen ? "nf-sidebar--open" : ""}`} ref={sidebarRef}>
        <div className="nf-sidebar-header">
          <div className="nf-logo">
            <span className="nf-logo-gem">◈</span>
            StudyPulse
          </div>
          <button className="nf-sidebar-close" onClick={closeSidebar}>
            ✕
          </button>
        </div>
        <div className="nf-sidebar-links">
          <button onClick={() => handleNavClick("/")} className="nf-sidebar-link">
            <span className="nf-sidebar-icon">🏠</span>
            Home
          </button>
          <button onClick={() => handleNavClick("/about")} className="nf-sidebar-link">
            <span className="nf-sidebar-icon">📖</span>
            About
          </button>
          <button onClick={() => handleNavClick("/contact")} className="nf-sidebar-link">
            <span className="nf-sidebar-icon">📧</span>
            Contact
          </button>
          <button onClick={() => handleNavClick("/login")} className="nf-sidebar-link">
            <span className="nf-sidebar-icon">🔐</span>
            Sign In
          </button>
          <button onClick={() => handleNavClick("/register")} className="nf-sidebar-solid">
            Get Started
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="nf-nav">
        <div className="nf-nav-container">
          <Link to="/" className="nf-logo">
            <span className="nf-logo-gem">◈</span>
            StudyPulse
          </Link>

          {/* Desktop Navigation */}
          <div className="nf-nav-desktop">
            <Link to="/" className="nf-nav-link">Home</Link>
            <Link to="/about" className="nf-nav-link">About</Link>
            <Link to="/contact" className="nf-nav-link">Contact</Link>
            <Link to="/login" className="nf-nav-ghost">Sign In</Link>
            <Link to="/register" className="nf-nav-solid">Get Started</Link>
          </div>

          {/* Hamburger Menu Button */}
          <button className="nf-hamburger" onClick={openSidebar}>
            <span className="nf-hamburger-line"></span>
            <span className="nf-hamburger-line"></span>
            <span className="nf-hamburger-line"></span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="nf-main">
        <div className="nf-card">
          <div className="nf-card-glow" />
          
          <div className="nf-404-animation">
            <div className="nf-404-circle"></div>
            <div className="nf-404-circle-delayed"></div>
            <div className="nf-404-content">
              <span className="nf-404-digit">4</span>
              <span className="nf-404-zero">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                </svg>
              </span>
              <span className="nf-404-digit">4</span>
            </div>
          </div>

          <h1 className="nf-title">Page Not <span className="nf-grad">Found</span></h1>
          
          <p className="nf-subtitle">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="nf-buttons">
            <Link to="/" className="nf-btn-primary">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3.333 8h9.334M9.333 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Back to Home
            </Link>
            <button onClick={() => navigate(-1)} className="nf-btn-secondary">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Go Back
            </button>
          </div>

          <div className="nf-redirect">
            <div className="nf-redirect-bar">
              <div className="nf-redirect-progress" style={{ width: `${(countdown / 5) * 100}%` }} />
            </div>
            <p>Redirecting to home in <span className="nf-countdown">{countdown}</span> seconds</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="nf-footer">
        <div className="nf-footer-inner">
          <div className="nf-logo nf-logo-sm">
            <span className="nf-logo-gem">◈</span> StudyPulse
          </div>
          <div className="nf-footer-links">
            <Link to="/about" className="nf-footer-link">About</Link>
            <Link to="/contact" className="nf-footer-link">Contact</Link>
            <Link to="/privacy" className="nf-footer-link">Privacy Policy</Link>
            <Link to="/terms" className="nf-footer-link">Terms of Service</Link>
          </div>
          <div className="nf-footer-copy">
            © 2025 StudyPulse — Built for students who want more.
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .nf-root {
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
        }

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        .nf-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .nf-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background */
        .nf-bg {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.1) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 90% 70%, rgba(32, 230, 208, 0.05) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 10% 80%, rgba(155, 122, 255, 0.05) 0%, transparent 55%);
        }
        .nf-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 80%);
        }
        .nf-orb {
          position: fixed; border-radius: 50%; filter: blur(90px);
          pointer-events: none; z-index: 0;
        }
        .nf-orb-a {
          width: 460px; height: 460px; top: -140px; left: 50%;
          transform: translateX(-50%);
          background: rgba(88, 130, 255, 0.08);
          animation: orbA 9s ease-in-out infinite;
        }
        .nf-orb-b {
          width: 280px; height: 280px; bottom: 10%; right: -3%;
          background: rgba(32, 230, 208, 0.05);
          animation: orbB 11s 2s ease-in-out infinite;
        }
        .nf-orb-c {
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

        /* Nav */
        .nf-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(10, 12, 18, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .nf-nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .nf-logo {
          font-family: var(--fd); font-size: 1.15rem; font-weight: 700;
          letter-spacing: -0.02em; color: var(--text);
          display: flex; align-items: center; gap: 7px;
          text-decoration: none;
        }
        .nf-logo-sm { font-size: 1rem; }
        .nf-logo-gem {
          color: var(--accent);
          filter: drop-shadow(0 0 6px rgba(88, 130, 255, 0.55));
        }
        .nf-nav-desktop {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .nf-nav-link {
          font-size: 0.85rem; font-weight: 500;
          color: var(--muted); text-decoration: none;
          transition: color 0.2s;
          padding: 0.5rem 0.75rem;
        }
        .nf-nav-link:hover { color: var(--text); }
        .nf-nav-ghost {
          font-size: 0.85rem; font-weight: 500;
          padding: 0.5rem 1.25rem;
          border-radius: 40px;
          border: 1px solid var(--border-h);
          color: var(--muted); background: transparent;
          text-decoration: none; transition: all 0.2s;
        }
        .nf-nav-ghost:hover {
          color: var(--text);
          background: rgba(88, 130, 255, 0.08);
        }
        .nf-nav-solid {
          font-size: 0.85rem; font-weight: 600;
          padding: 0.5rem 1.5rem;
          border-radius: 40px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: #fff; text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(88, 130, 255, 0.3);
        }
        .nf-nav-solid:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(88, 130, 255, 0.45);
        }

        /* Hamburger Menu Button */
        .nf-hamburger {
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
        .nf-hamburger-line {
          width: 22px;
          height: 2px;
          background: var(--text);
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        /* Sidebar Overlay */
        .nf-overlay {
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
        .nf-overlay--visible {
          background: rgba(0, 0, 0, 0.7);
          pointer-events: auto;
        }

        /* Sidebar Drawer */
        .nf-sidebar {
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
        .nf-sidebar--open {
          right: 0;
        }
        .nf-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .nf-sidebar-close {
          background: transparent;
          border: none;
          color: var(--muted);
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.5rem;
          transition: color 0.2s;
        }
        .nf-sidebar-close:hover {
          color: var(--text);
        }
        .nf-sidebar-links {
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          gap: 0.75rem;
        }
        .nf-sidebar-link {
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
        .nf-sidebar-link:hover {
          background: rgba(88, 130, 255, 0.1);
        }
        .nf-sidebar-icon {
          font-size: 1.1rem;
        }
        .nf-sidebar-solid {
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
        .nf-sidebar-solid:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(88, 130, 255, 0.4);
        }

        /* Main Content */
        .nf-main {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6rem 2rem 4rem;
          position: relative;
          z-index: 10;
        }

        /* Card */
        .nf-card {
          max-width: 520px;
          width: 100%;
          background: rgba(17, 19, 24, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 32px;
          padding: 3rem 2.5rem;
          position: relative;
          text-align: center;
          transition: all 0.3s ease;
          animation: cardIn 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.1) both;
        }
        .nf-card:hover {
          border-color: var(--border-h);
          transform: translateY(-4px);
        }
        .nf-card-glow {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 350px;
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

        /* 404 Animation */
        .nf-404-animation {
          position: relative;
          margin-bottom: 2rem;
          display: flex;
          justify-content: center;
        }
        .nf-404-circle {
          position: absolute;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: rgba(88, 130, 255, 0.05);
          animation: pulse 2s ease-in-out infinite;
        }
        .nf-404-circle-delayed {
          position: absolute;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: rgba(88, 130, 255, 0.03);
          animation: pulse 2s ease-in-out infinite 0.6s;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(0.9); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0; }
        }
        .nf-404-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          position: relative;
          z-index: 2;
        }
        .nf-404-digit {
          font-family: var(--fd);
          font-size: 5rem;
          font-weight: 800;
          color: var(--text);
        }
        .nf-404-zero {
          display: inline-flex;
          color: var(--accent);
          animation: float 3s ease-in-out infinite;
        }
        .nf-404-zero svg {
          width: 70px;
          height: 70px;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        /* Title */
        .nf-title {
          font-family: var(--fd);
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 1rem;
        }
        .nf-subtitle {
          font-size: 0.9rem;
          color: var(--muted);
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        /* Buttons */
        .nf-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }
        .nf-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 48px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: #fff;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(88, 130, 255, 0.35);
        }
        .nf-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(88, 130, 255, 0.5);
        }
        .nf-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          padding: 12px 24px;
          border-radius: 48px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--muted);
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--fb);
        }
        .nf-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.04);
          color: var(--text);
          border-color: rgba(255, 255, 255, 0.22);
          transform: translateY(-2px);
        }

        /* Redirect */
        .nf-redirect {
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .nf-redirect-bar {
          width: 100%;
          height: 3px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }
        .nf-redirect-progress {
          height: 100%;
          background: linear-gradient(90deg, var(--accent), var(--accent2));
          border-radius: 3px;
          transition: width 0.3s linear;
        }
        .nf-redirect p {
          font-size: 0.75rem;
          color: var(--faint);
        }
        .nf-countdown {
          font-weight: 600;
          color: var(--accent);
          font-size: 0.85rem;
        }

        /* Footer */
        .nf-footer {
          padding: 2rem 2rem 1.5rem;
          border-top: 1px solid var(--border);
          background: rgba(10, 12, 18, 0.8);
          position: relative;
          z-index: 10;
        }
        .nf-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .nf-footer-links {
          display: flex;
          gap: 1.8rem;
          flex-wrap: wrap;
        }
        .nf-footer-link {
          font-size: 0.8rem;
          color: var(--faint);
          text-decoration: none;
          transition: color 0.2s;
        }
        .nf-footer-link:hover {
          color: var(--accent);
        }
        .nf-footer-copy {
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
          .nf-nav-desktop {
            display: none;
          }
          .nf-hamburger {
            display: flex;
          }
          .nf-nav-container {
            padding: 0 1.25rem;
            height: 58px;
          }
          .nf-main {
            padding: 5rem 1.25rem 3rem;
          }
          .nf-card {
            padding: 2rem 1.5rem;
          }
          .nf-404-digit {
            font-size: 3.5rem;
          }
          .nf-404-zero svg {
            width: 50px;
            height: 50px;
          }
          .nf-404-circle, .nf-404-circle-delayed {
            width: 110px;
            height: 110px;
          }
          .nf-title {
            font-size: 1.6rem;
          }
          .nf-buttons {
            flex-direction: column;
            align-items: center;
          }
          .nf-btn-primary, .nf-btn-secondary {
            width: 200px;
            justify-content: center;
          }
          .nf-footer-inner {
            flex-direction: column;
            text-align: center;
          }
          .nf-footer-links {
            justify-content: center;
          }
        }
        @media (max-width: 480px) {
          .nf-card {
            padding: 1.5rem;
          }
          .nf-404-digit {
            font-size: 2.5rem;
          }
          .nf-404-zero svg {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </div>
  );
}
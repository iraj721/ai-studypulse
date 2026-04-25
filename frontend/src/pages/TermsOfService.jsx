import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaFileContract, FaCheckCircle, FaUserLock, FaShieldAlt, 
  FaBrain, FaGavel, FaCopyright, FaServer, FaBan, FaBell 
} from "react-icons/fa";

export default function TermsOfService() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [focusedCard, setFocusedCard] = useState(null);
  const sectionRefs = useRef([]);
  const sidebarRef = useRef(null);

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

  // Intersection Observer for animations
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("tos-in"); }),
      { threshold: 0.1 }
    );
    sectionRefs.current.forEach(el => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  const sections = [
    { 
      icon: <FaFileContract />, 
      title: "1. Acceptance of Terms", 
      content: "By accessing or using AI StudyPulse, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services." 
    },
    { 
      icon: <FaUserLock />, 
      title: "2. Account Registration", 
      content: "You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials and for all activities that occur under your account." 
    },
    { 
      icon: <FaBrain />, 
      title: "3. AI Services", 
      content: "Our AI services generate content based on your inputs and learning patterns. While we strive for accuracy, AI-generated content may not always be perfect. You agree to use AI-generated content as a learning aid, not as definitive source material." 
    },
    { 
      icon: <FaShieldAlt />, 
      title: "4. User Conduct", 
      content: "You agree not to misuse our services, including but not limited to: attempting to bypass security measures, interfering with service operations, uploading malicious content, or using our services for any illegal activities." 
    },
    { 
      icon: <FaCopyright />, 
      title: "5. Intellectual Property", 
      content: "AI StudyPulse and its content, features, and functionality are owned by us and are protected by copyright, trademark, and other intellectual property laws. You retain ownership of your submitted content but grant us a license to use it to provide and improve our services." 
    },
    { 
      icon: <FaServer />, 
      title: "6. Subscription and Payments", 
      content: "Certain features may require a paid subscription. Fees are billed in advance and are non-refundable except as required by law. We reserve the right to change pricing with prior notice." 
    },
    { 
      icon: <FaCheckCircle />, 
      title: "7. Content Moderation", 
      content: "We reserve the right to review, moderate, and remove any content that violates these terms or applicable laws. We may suspend or terminate accounts that repeatedly violate our content policies." 
    },
    { 
      icon: <FaBan />, 
      title: "8. Termination", 
      content: "We may terminate or suspend your account immediately, without prior notice, for conduct that violates these terms or is harmful to other users. You may delete your account at any time through your account settings." 
    },
    { 
      icon: <FaBell />, 
      title: "9. Disclaimer of Warranties", 
      content: "Our services are provided 'as is' without warranties of any kind. We do not guarantee that the service will be uninterrupted, error-free, or completely secure. Use of AI-generated content is at your own discretion." 
    },
    { 
      icon: <FaGavel />, 
      title: "10. Limitation of Liability", 
      content: "To the maximum extent permitted by law, AI StudyPulse shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount paid by you, if any." 
    },
    { 
      icon: <FaFileContract />, 
      title: "11. Changes to Terms", 
      content: "We may modify these terms at any time. We will notify users of significant changes via email or through our platform. Continued use of the service after changes constitutes acceptance of the new terms." 
    },
    { 
      icon: <FaGavel />, 
      title: "12. Governing Law", 
      content: "These terms shall be governed by and construed in accordance with the laws of Pakistan, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of Pakistan." 
    },
  ];

  return (
    <div className="tos-root">
      {/* Background Elements */}
      <div className="tos-bg" />
      <div className="tos-grid" />
      <div className="tos-orb tos-orb-a" />
      <div className="tos-orb tos-orb-b" />
      <div className="tos-orb tos-orb-c" />

      {/* Dark Overlay for Sidebar */}
      <div className={`tos-overlay ${sidebarOpen ? "tos-overlay--visible" : ""}`} onClick={closeSidebar} />

      {/* Sidebar Drawer */}
      <div className={`tos-sidebar ${sidebarOpen ? "tos-sidebar--open" : ""}`} ref={sidebarRef}>
        <div className="tos-sidebar-header">
          <div className="tos-logo">
            <span className="tos-logo-gem">◈</span>
            StudyPulse
          </div>
          <button className="tos-sidebar-close" onClick={closeSidebar}>
            ✕
          </button>
        </div>
        <div className="tos-sidebar-links">
          <button onClick={() => handleNavClick("/")} className="tos-sidebar-link">
            <span className="tos-sidebar-icon">🏠</span>
            Home
          </button>
          <button onClick={() => handleNavClick("/about")} className="tos-sidebar-link">
            <span className="tos-sidebar-icon">📖</span>
            About
          </button>
          <button onClick={() => handleNavClick("/contact")} className="tos-sidebar-link">
            <span className="tos-sidebar-icon">📧</span>
            Contact
          </button>
          <button onClick={() => handleNavClick("/privacy")} className="tos-sidebar-link">
            <span className="tos-sidebar-icon">🔒</span>
            Privacy
          </button>
          <button onClick={() => handleNavClick("/login")} className="tos-sidebar-link">
            <span className="tos-sidebar-icon">🔐</span>
            Sign In
          </button>
          <button onClick={() => handleNavClick("/register")} className="tos-sidebar-solid">
            Get Started
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="tos-nav">
        <div className="tos-nav-container">
          <Link to="/" className="tos-logo">
            <span className="tos-logo-gem">◈</span>
            StudyPulse
          </Link>

          {/* Desktop Navigation */}
          <div className="tos-nav-desktop">
            <Link to="/" className="tos-nav-link">Home</Link>
            <Link to="/about" className="tos-nav-link">About</Link>
            <Link to="/contact" className="tos-nav-link">Contact</Link>
            <Link to="/privacy" className="tos-nav-link">Privacy</Link>
            <Link to="/login" className="tos-nav-ghost">Sign In</Link>
            <Link to="/register" className="tos-nav-solid">Get Started</Link>
          </div>

          {/* Hamburger Menu Button */}
          <button className="tos-hamburger" onClick={openSidebar}>
            <span className="tos-hamburger-line"></span>
            <span className="tos-hamburger-line"></span>
            <span className="tos-hamburger-line"></span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="tos-hero">
        <div className="tos-hero-content">
          <div className="tos-hero-icon-wrapper">
            <FaFileContract className="tos-hero-icon" />
          </div>
          <div className="tos-hero-eyebrow">Legal Agreement</div>
          <h1 className="tos-hero-title">
            Terms of <span className="tos-grad">Service</span>
          </h1>
          <p className="tos-hero-subtitle">
            Last Updated: January 2026
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="tos-main">
        <div className="tos-card">
          <div className="tos-card-glow" />
          
          <div className="tos-intro">
            <p>Welcome to AI StudyPulse. By using our platform, you agree to these Terms of Service. Please read them carefully.</p>
          </div>

          <div className="tos-sections">
            {sections.map((section, idx) => (
              <div 
                key={idx} 
                className="tos-section"
                ref={el => (sectionRefs.current[idx] = el)}
                onMouseEnter={() => setFocusedCard(idx)}
                onMouseLeave={() => setFocusedCard(null)}
                style={{ transitionDelay: `${idx * 0.03}s` }}
              >
                <div className="tos-section-icon">{section.icon}</div>
                <div className="tos-section-content">
                  <h3>{section.title}</h3>
                  <p>{section.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="tos-footer">
            <p>By using AI StudyPulse, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.</p>
          </div>
        </div>
      </main>

      {/* CTA Section */}
      <section className="tos-cta-section">
        <div className="tos-cta-glow" />
        <div className="tos-cta-content">
          <div className="tos-eyebrow" style={{ textAlign: "center" }}>Questions?</div>
          <h2 className="tos-cta-title">
            Need Clarification
            <br />
            <span className="tos-grad">About Our Terms?</span>
          </h2>
          <p className="tos-cta-sub">
            Our legal team is available to answer your questions about these terms.
          </p>
          <div className="tos-cta-buttons">
            <Link to="/contact" className="tos-btn-primary">
              Contact Us
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link to="/" className="tos-btn-secondary">Return Home</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="tos-footer-section">
        <div className="tos-footer-inner">
          <div className="tos-logo tos-logo-sm">
            <span className="tos-logo-gem">◈</span> StudyPulse
          </div>
          <div className="tos-footer-links">
            <Link to="/about" className="tos-footer-link">About</Link>
            <Link to="/contact" className="tos-footer-link">Contact</Link>
            <Link to="/privacy" className="tos-footer-link">Privacy Policy</Link>
            <Link to="/terms" className="tos-footer-link">Terms of Service</Link>
          </div>
          <div className="tos-footer-copy">
            © 2025 StudyPulse — Built for students who want more.
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .tos-root {
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

        .tos-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .tos-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background */
        .tos-bg {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.1) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 90% 70%, rgba(32, 230, 208, 0.05) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 10% 80%, rgba(155, 122, 255, 0.05) 0%, transparent 55%);
        }
        .tos-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 80%);
        }
        .tos-orb {
          position: fixed; border-radius: 50%; filter: blur(90px);
          pointer-events: none; z-index: 0;
        }
        .tos-orb-a {
          width: 460px; height: 460px; top: -140px; left: 50%;
          transform: translateX(-50%);
          background: rgba(88, 130, 255, 0.08);
          animation: orbA 9s ease-in-out infinite;
        }
        .tos-orb-b {
          width: 280px; height: 280px; bottom: 10%; right: -3%;
          background: rgba(32, 230, 208, 0.05);
          animation: orbB 11s 2s ease-in-out infinite;
        }
        .tos-orb-c {
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
        .tos-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(10, 12, 18, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .tos-nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .tos-logo {
          font-family: var(--fd); font-size: 1.15rem; font-weight: 700;
          letter-spacing: -0.02em; color: var(--text);
          display: flex; align-items: center; gap: 7px;
          text-decoration: none;
        }
        .tos-logo-sm { font-size: 1rem; }
        .tos-logo-gem {
          color: var(--accent);
          filter: drop-shadow(0 0 6px rgba(88, 130, 255, 0.55));
        }
        .tos-nav-desktop {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .tos-nav-link {
          font-size: 0.85rem; font-weight: 500;
          color: var(--muted); text-decoration: none;
          transition: color 0.2s;
          padding: 0.5rem 0.75rem;
        }
        .tos-nav-link:hover { color: var(--text); }
        .tos-nav-ghost {
          font-size: 0.85rem; font-weight: 500;
          padding: 0.5rem 1.25rem;
          border-radius: 40px;
          border: 1px solid var(--border-h);
          color: var(--muted); background: transparent;
          text-decoration: none; transition: all 0.2s;
        }
        .tos-nav-ghost:hover {
          color: var(--text);
          background: rgba(88, 130, 255, 0.08);
        }
        .tos-nav-solid {
          font-size: 0.85rem; font-weight: 600;
          padding: 0.5rem 1.5rem;
          border-radius: 40px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: #fff; text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(88, 130, 255, 0.3);
        }
        .tos-nav-solid:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(88, 130, 255, 0.45);
        }

        /* Hamburger Menu Button */
        .tos-hamburger {
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
        .tos-hamburger-line {
          width: 22px;
          height: 2px;
          background: var(--text);
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        /* Sidebar Overlay */
        .tos-overlay {
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
        .tos-overlay--visible {
          background: rgba(0, 0, 0, 0.7);
          pointer-events: auto;
        }

        /* Sidebar Drawer */
        .tos-sidebar {
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
        .tos-sidebar--open {
          right: 0;
        }
        .tos-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .tos-sidebar-close {
          background: transparent;
          border: none;
          color: var(--muted);
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.5rem;
          transition: color 0.2s;
        }
        .tos-sidebar-close:hover {
          color: var(--text);
        }
        .tos-sidebar-links {
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          gap: 0.75rem;
        }
        .tos-sidebar-link {
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
        .tos-sidebar-link:hover {
          background: rgba(88, 130, 255, 0.1);
        }
        .tos-sidebar-icon {
          font-size: 1.1rem;
        }
        .tos-sidebar-solid {
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
        .tos-sidebar-solid:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(88, 130, 255, 0.4);
        }

        /* Hero */
        .tos-hero {
          min-height: 45vh;
          display: flex; align-items: center; justify-content: center;
          text-align: center;
          position: relative;
          padding: 7rem 2rem 4rem;
        }
        .tos-hero-content {
          position: relative; z-index: 10;
          max-width: 800px; margin: 0 auto;
        }
        .tos-hero-icon-wrapper {
          margin-bottom: 1rem;
        }
        .tos-hero-icon {
          font-size: 3rem;
          color: var(--accent);
          filter: drop-shadow(0 0 12px rgba(88, 130, 255, 0.5));
        }
        .tos-hero-eyebrow {
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--accent);
          margin-bottom: 1rem;
          animation: fadeUp 0.6s 0.2s both;
        }
        .tos-hero-title {
          font-family: var(--fd);
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800; line-height: 1.15; letter-spacing: -0.03em;
          margin-bottom: 1rem;
          animation: fadeUp 0.6s 0.3s both;
        }
        .tos-hero-subtitle {
          font-size: clamp(0.9rem, 1.2vw, 1rem);
          color: var(--muted);
          max-width: 550px; margin: 0 auto;
          line-height: 1.6;
          animation: fadeUp 0.6s 0.4s both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }

        /* Main Content */
        .tos-main {
          position: relative;
          z-index: 10;
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem 2rem 4rem;
        }

        /* Card */
        .tos-card {
          background: rgba(17, 19, 24, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 28px;
          padding: 2.5rem;
          position: relative;
          transition: all 0.3s ease;
        }
        .tos-card:hover {
          border-color: var(--border-h);
        }
        .tos-card-glow {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 400px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(88, 130, 255, 0.1), transparent);
          filter: blur(60px);
          pointer-events: none;
        }

        /* Intro */
        .tos-intro {
          font-size: 1rem;
          font-weight: 500;
          color: var(--text);
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border);
          line-height: 1.6;
        }

        /* Sections */
        .tos-sections {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .tos-section {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          padding: 1rem;
          border-radius: 20px;
          transition: all 0.3s ease;
          opacity: 0;
          transform: translateY(15px);
        }
        .tos-section.tos-in {
          opacity: 1;
          transform: translateY(0);
        }
        .tos-section:hover {
          background: rgba(88, 130, 255, 0.05);
          transform: translateX(5px);
        }
        .tos-section-icon {
          font-size: 1.5rem;
          color: var(--accent);
          margin-top: 0.25rem;
          flex-shrink: 0;
        }
        .tos-section-content {
          flex: 1;
        }
        .tos-section-content h3 {
          font-family: var(--fd);
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text);
        }
        .tos-section-content p {
          font-size: 0.85rem;
          color: var(--muted);
          line-height: 1.6;
        }

        /* Footer within card */
        .tos-footer {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
          text-align: center;
        }
        .tos-footer p {
          font-size: 0.85rem;
          color: var(--faint);
        }

        /* CTA Section */
        .tos-cta-section {
          padding: 5rem 2rem;
          text-align: center;
          position: relative;
          border-top: 1px solid var(--border);
          margin-top: 2rem;
        }
        .tos-cta-glow {
          position: absolute;
          top: -80px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 300px;
          background: radial-gradient(ellipse, rgba(88, 130, 255, 0.1), transparent);
          filter: blur(70px);
          pointer-events: none;
        }
        .tos-cta-content {
          position: relative;
          z-index: 10;
          max-width: 700px;
          margin: 0 auto;
        }
        .tos-eyebrow {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 0.8rem;
        }
        .tos-cta-title {
          font-family: var(--fd);
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin: 0.8rem 0 1rem;
        }
        .tos-cta-sub {
          font-size: 0.95rem;
          color: var(--muted);
          margin-bottom: 2rem;
        }
        .tos-cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .tos-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          padding: 12px 32px;
          border-radius: 48px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: #fff;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(88, 130, 255, 0.35);
        }
        .tos-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(88, 130, 255, 0.5);
        }
        .tos-btn-secondary {
          display: inline-flex;
          align-items: center;
          font-size: 0.9rem;
          font-weight: 500;
          padding: 12px 32px;
          border-radius: 48px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--muted);
          text-decoration: none;
          transition: all 0.2s;
        }
        .tos-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.04);
          color: var(--text);
          border-color: rgba(255, 255, 255, 0.22);
          transform: translateY(-2px);
        }

        /* Footer Section */
        .tos-footer-section {
          padding: 2rem 2rem 1.5rem;
          border-top: 1px solid var(--border);
          background: rgba(10, 12, 18, 0.8);
          position: relative;
          z-index: 10;
        }
        .tos-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .tos-footer-links {
          display: flex;
          gap: 1.8rem;
          flex-wrap: wrap;
        }
        .tos-footer-link {
          font-size: 0.8rem;
          color: var(--faint);
          text-decoration: none;
          transition: color 0.2s;
        }
        .tos-footer-link:hover {
          color: var(--accent);
        }
        .tos-footer-copy {
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
          .tos-nav-desktop {
            display: none;
          }
          .tos-hamburger {
            display: flex;
          }
          .tos-nav-container {
            padding: 0 1.25rem;
            height: 58px;
          }
          .tos-hero {
            padding: 6rem 1.25rem 3rem;
          }
          .tos-main {
            padding: 1rem 1.25rem 3rem;
          }
          .tos-card {
            padding: 1.5rem;
          }
          .tos-section {
            flex-direction: column;
            gap: 0.5rem;
            padding: 0.75rem;
          }
          .tos-section-icon {
            font-size: 1.25rem;
          }
          .tos-section-content h3 {
            font-size: 0.9rem;
          }
          .tos-section-content p {
            font-size: 0.8rem;
          }
          .tos-cta-section {
            padding: 4rem 1.25rem;
          }
          .tos-cta-buttons {
            flex-direction: column;
            align-items: center;
          }
          .tos-btn-primary, .tos-btn-secondary {
            width: 220px;
            justify-content: center;
          }
          .tos-footer-inner {
            flex-direction: column;
            text-align: center;
          }
          .tos-footer-links {
            justify-content: center;
          }
        }
        @media (max-width: 480px) {
          .tos-card {
            padding: 1.25rem;
          }
          .tos-intro {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
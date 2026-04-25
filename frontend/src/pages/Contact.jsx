import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState("");
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const formRef = useRef(null);
  const toastTimer = useRef(null);
  const sidebarRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    return () => clearTimeout(toastTimer.current);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      showToast("Please fill in all fields.", "error");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
      showToast("Thank you! Your message has been sent. We'll get back to you soon.", "success");
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
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

  const contactInfo = [
    { icon: "📧", label: "Email", value: "hello@studypulse.com", link: "mailto:hello@studypulse.com" },
    { icon: "📱", label: "Phone", value: "+1 (555) 123-4567", link: "tel:+15551234567" },
    { icon: "📍", label: "Office", value: "123 AI Avenue, San Francisco, CA 94105", link: null },
    { icon: "⏰", label: "Support Hours", value: "Mon-Fri, 9 AM - 6 PM PST", link: null },
  ];

  return (
    <div className="ct-root">
      {/* Background Elements */}
      <div className="ct-bg" />
      <div className="ct-grid" />
      <div className="ct-orb ct-orb-a" />
      <div className="ct-orb ct-orb-b" />
      <div className="ct-orb ct-orb-c" />

      {/* Dark Overlay for Sidebar */}
      <div className={`ct-overlay ${sidebarOpen ? "ct-overlay--visible" : ""}`} onClick={closeSidebar} />

      {/* Sidebar Drawer */}
      <div className={`ct-sidebar ${sidebarOpen ? "ct-sidebar--open" : ""}`} ref={sidebarRef}>
        <div className="ct-sidebar-header">
          <div className="ct-logo">
            <span className="ct-logo-gem">◈</span>
            StudyPulse
          </div>
          <button className="ct-sidebar-close" onClick={closeSidebar}>
            ✕
          </button>
        </div>
        <div className="ct-sidebar-links">
          <button onClick={() => handleNavClick("/")} className="ct-sidebar-link">
            <span className="ct-sidebar-icon">🏠</span>
            Home
          </button>
          <button onClick={() => handleNavClick("/about")} className="ct-sidebar-link">
            <span className="ct-sidebar-icon">📖</span>
            About
          </button>
          <button onClick={() => handleNavClick("/login")} className="ct-sidebar-link">
            <span className="ct-sidebar-icon">🔐</span>
            Sign In
          </button>
          <button onClick={() => handleNavClick("/register")} className="ct-sidebar-solid">
            Get Started
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`ct-toast ct-toast-${toast.type}`}>
          <span className="ct-toast-icon">
            {toast.type === "success" ? "✓" : "✕"}
          </span>
          {toast.message}
        </div>
      )}

      {/* Nav */}
      <nav className="ct-nav">
        <div className="ct-nav-container">
          <Link to="/" className="ct-logo">
            <span className="ct-logo-gem">◈</span>
            StudyPulse
          </Link>

          {/* Desktop Navigation */}
          <div className="ct-nav-desktop">
            <Link to="/" className="ct-nav-link">Home</Link>
            <Link to="/about" className="ct-nav-link">About</Link>
            <Link to="/login" className="ct-nav-ghost">Sign In</Link>
            <Link to="/register" className="ct-nav-solid">Get Started</Link>
          </div>

          {/* Hamburger Menu Button */}
          <button className="ct-hamburger" onClick={openSidebar}>
            <span className="ct-hamburger-line"></span>
            <span className="ct-hamburger-line"></span>
            <span className="ct-hamburger-line"></span>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="ct-hero">
        <div className="ct-hero-content">
          <div className="ct-hero-eyebrow">Contact Us</div>
          <h1 className="ct-hero-title">
            Let's Talk.
            <br />
            <span className="ct-grad">We're Here to Help.</span>
          </h1>
          <p className="ct-hero-subtitle">
            Have questions about AI StudyPulse? Need support? Want to partner with us? 
            Reach out — we'd love to hear from you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="ct-main">
        {/* Contact Info Cards */}
        <div className="ct-info-grid">
          {contactInfo.map((info, idx) => (
            <div key={idx} className="ct-info-card">
              <div className="ct-info-icon">{info.icon}</div>
              <div className="ct-info-label">{info.label}</div>
              {info.link ? (
                <a href={info.link} className="ct-info-value-link">{info.value}</a>
              ) : (
                <div className="ct-info-value">{info.value}</div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Form Card */}
        <div className="ct-form-card" ref={formRef}>
          <div className="ct-form-glow" />
          
          <div className="ct-form-header">
            <div className="ct-eyebrow">Get in Touch</div>
            <h2 className="ct-form-title">
              Send Us a <span className="ct-grad">Message</span>
            </h2>
            <p className="ct-form-sub">
              We typically respond within a few hours.
            </p>
          </div>

          <form className="ct-form" onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className={`ct-field ${focused === "name" ? "ct-field-focus" : ""}`}>
              <label className="ct-label" htmlFor="name">Full name</label>
              <div className="ct-input-wrap">
                <svg className="ct-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13 14v-1.5a3.5 3.5 0 00-7 0V14M8 8a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused("")}
                  className="ct-input"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div className={`ct-field ${focused === "email" ? "ct-field-focus" : ""}`}>
              <label className="ct-label" htmlFor="email">Email address</label>
              <div className="ct-input-wrap">
                <svg className="ct-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M1 5.5l6.293 4.207a1 1 0 001.414 0L15 5.5" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  className="ct-input"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Subject */}
            <div className={`ct-field ${focused === "subject" ? "ct-field-focus" : ""}`}>
              <label className="ct-label" htmlFor="subject">Subject</label>
              <div className="ct-input-wrap">
                <svg className="ct-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8h12M8 2v12M13 3L3 13M3 3l10 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  value={formData.subject}
                  onChange={handleChange}
                  onFocus={() => setFocused("subject")}
                  onBlur={() => setFocused("")}
                  className="ct-input"
                  placeholder="How can we help you?"
                />
              </div>
            </div>

            {/* Message */}
            <div className={`ct-field ${focused === "message" ? "ct-field-focus" : ""}`}>
              <label className="ct-label" htmlFor="message">Message</label>
              <div className="ct-input-wrap">
                <svg className="ct-input-icon ct-textarea-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M2 8h8M2 12h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M11 11l3-3-3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  onFocus={() => setFocused("message")}
                  onBlur={() => setFocused("")}
                  className="ct-textarea"
                  placeholder="Tell us more about your question or feedback..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`ct-submit ${loading ? "ct-submit-loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="ct-spinner" />
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* FAQ Section */}
      <section className="ct-faq-section">
        <div className="ct-container">
          <div className="ct-section-header">
            <div className="ct-eyebrow">Quick Answers</div>
            <h2 className="ct-section-title">
              Frequently Asked <span className="ct-grad">Questions</span>
            </h2>
            <p className="ct-section-sub">
              Find quick answers to common questions.
            </p>
          </div>
          <div className="ct-faq-grid">
            <div className="ct-faq-card">
              <div className="ct-faq-q">❓ How do I get started?</div>
              <div className="ct-faq-a">Sign up for a free account, join your class using a code, and start exploring AI-powered study tools immediately.</div>
            </div>
            <div className="ct-faq-card">
              <div className="ct-faq-q">💰 Is there a free plan?</div>
              <div className="ct-faq-a">Yes! We offer a generous free tier with access to core features. Upgrade anytime for premium AI capabilities.</div>
            </div>
            <div className="ct-faq-card">
              <div className="ct-faq-q">🔒 Is my data secure?</div>
              <div className="ct-faq-a">Absolutely. We use enterprise-grade encryption and follow industry best practices to protect your information.</div>
            </div>
            <div className="ct-faq-card">
              <div className="ct-faq-q">🤝 Can I request a demo?</div>
              <div className="ct-faq-a">Of course! Contact our team and we'll schedule a personalized demo for you or your institution.</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="ct-cta-section">
        <div className="ct-cta-glow" />
        <div className="ct-cta-content">
          <div className="ct-eyebrow" style={{ textAlign: "center" }}>Join the Community</div>
          <h2 className="ct-cta-title">
            Ready to Transform
            <br />
            <span className="ct-grad">Your Learning Experience?</span>
          </h2>
          <p className="ct-cta-sub">
            Join thousands of students already using AI StudyPulse to learn smarter, not harder.
          </p>
          <div className="ct-cta-buttons">
            <Link to="/register" className="ct-btn-primary">
              Get Started Free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link to="/login" className="ct-btn-secondary">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ct-footer">
        <div className="ct-footer-inner">
          <div className="ct-logo ct-logo-sm">
            <span className="ct-logo-gem">◈</span> StudyPulse
          </div>
          <div className="ct-footer-links">
            <Link to="/about" className="ct-footer-link">About</Link>
            <Link to="/contact" className="ct-footer-link">Contact</Link>
            <Link to="/privacy" className="ct-footer-link">Privacy Policy</Link>
            <Link to="/terms" className="ct-footer-link">Terms of Service</Link>
          </div>
          <div className="ct-footer-copy">
            © 2025 StudyPulse — Built for students who want more.
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .ct-root {
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

        .ct-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .ct-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background */
        .ct-bg {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.1) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 90% 70%, rgba(32, 230, 208, 0.05) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 10% 80%, rgba(155, 122, 255, 0.05) 0%, transparent 55%);
        }
        .ct-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 80%);
        }
        .ct-orb {
          position: fixed; border-radius: 50%; filter: blur(90px);
          pointer-events: none; z-index: 0;
        }
        .ct-orb-a {
          width: 460px; height: 460px; top: -140px; left: 50%;
          transform: translateX(-50%);
          background: rgba(88, 130, 255, 0.08);
          animation: orbA 9s ease-in-out infinite;
        }
        .ct-orb-b {
          width: 280px; height: 280px; bottom: 10%; right: -3%;
          background: rgba(32, 230, 208, 0.05);
          animation: orbB 11s 2s ease-in-out infinite;
        }
        .ct-orb-c {
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
        .ct-toast {
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
        .ct-toast-success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          color: #6ee7b7;
        }
        .ct-toast-error {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
        }
        .ct-toast-icon {
          font-size: 1rem; line-height: 1;
        }

        /* Nav */
        .ct-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          background: rgba(10, 12, 18, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }
        .ct-nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ct-logo {
          font-family: var(--fd); font-size: 1.15rem; font-weight: 700;
          letter-spacing: -0.02em; color: var(--text);
          display: flex; align-items: center; gap: 7px;
          text-decoration: none;
        }
        .ct-logo-sm { font-size: 1rem; }
        .ct-logo-gem {
          color: var(--accent);
          filter: drop-shadow(0 0 6px rgba(88, 130, 255, 0.55));
        }
        .ct-nav-desktop {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .ct-nav-link {
          font-size: 0.85rem; font-weight: 500;
          color: var(--muted); text-decoration: none;
          transition: color 0.2s;
          padding: 0.5rem 0.75rem;
        }
        .ct-nav-link:hover { color: var(--text); }
        .ct-nav-ghost {
          font-size: 0.85rem; font-weight: 500;
          padding: 0.5rem 1.25rem;
          border-radius: 40px;
          border: 1px solid var(--border-h);
          color: var(--muted); background: transparent;
          text-decoration: none; transition: all 0.2s;
        }
        .ct-nav-ghost:hover {
          color: var(--text);
          background: rgba(88, 130, 255, 0.08);
        }
        .ct-nav-solid {
          font-size: 0.85rem; font-weight: 600;
          padding: 0.5rem 1.5rem;
          border-radius: 40px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: #fff; text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(88, 130, 255, 0.3);
        }
        .ct-nav-solid:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(88, 130, 255, 0.45);
        }

        /* Hamburger Menu Button */
        .ct-hamburger {
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
        .ct-hamburger-line {
          width: 22px;
          height: 2px;
          background: var(--text);
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        /* Sidebar Overlay */
        .ct-overlay {
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
        .ct-overlay--visible {
          background: rgba(0, 0, 0, 0.7);
          pointer-events: auto;
        }

        /* Sidebar Drawer */
        .ct-sidebar {
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
        .ct-sidebar--open {
          right: 0;
        }
        .ct-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .ct-sidebar-close {
          background: transparent;
          border: none;
          color: var(--muted);
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.5rem;
          transition: color 0.2s;
        }
        .ct-sidebar-close:hover {
          color: var(--text);
        }
        .ct-sidebar-links {
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          gap: 0.75rem;
        }
        .ct-sidebar-link {
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
        .ct-sidebar-link:hover {
          background: rgba(88, 130, 255, 0.1);
        }
        .ct-sidebar-icon {
          font-size: 1.1rem;
        }
        .ct-sidebar-solid {
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
        .ct-sidebar-solid:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(88, 130, 255, 0.4);
        }

        /* Hero */
        .ct-hero {
          min-height: 45vh;
          display: flex; align-items: center; justify-content: center;
          text-align: center;
          position: relative;
          padding: 7rem 2rem 4rem;
        }
        .ct-hero-content {
          position: relative; z-index: 10;
          max-width: 800px; margin: 0 auto;
        }
        .ct-hero-eyebrow {
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--accent);
          margin-bottom: 1rem;
          animation: fadeUp 0.6s 0.2s both;
        }
        .ct-hero-title {
          font-family: var(--fd);
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800; line-height: 1.15; letter-spacing: -0.03em;
          margin-bottom: 1.2rem;
          animation: fadeUp 0.6s 0.3s both;
        }
        .ct-hero-subtitle {
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
        .ct-main {
          position: relative;
          z-index: 10;
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem 2rem 4rem;
        }

        /* Info Cards */
        .ct-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }
        .ct-info-card {
          background: rgba(17, 19, 24, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
        }
        .ct-info-card:hover {
          border-color: var(--border-h);
          transform: translateY(-4px);
          background: rgba(88, 130, 255, 0.05);
        }
        .ct-info-icon {
          font-size: 2rem;
          margin-bottom: 0.75rem;
        }
        .ct-info-label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 0.5rem;
        }
        .ct-info-value {
          font-size: 0.85rem;
          color: var(--muted);
        }
        .ct-info-value-link {
          font-size: 0.85rem;
          color: var(--accent);
          text-decoration: none;
          transition: color 0.2s;
        }
        .ct-info-value-link:hover {
          color: var(--accent2);
        }

        /* Form Card */
        .ct-form-card {
          background: rgba(17, 19, 24, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: 28px;
          padding: 2.5rem;
          position: relative;
          transition: all 0.3s ease;
        }
        .ct-form-card:hover {
          border-color: var(--border-h);
        }
        .ct-form-glow {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(88, 130, 255, 0.1), transparent);
          filter: blur(50px);
          pointer-events: none;
        }
        .ct-form-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .ct-eyebrow {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 0.8rem;
        }
        .ct-form-title {
          font-family: var(--fd);
          font-size: clamp(1.4rem, 2.5vw, 1.8rem);
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .ct-form-sub {
          font-size: 0.85rem;
          color: var(--muted);
        }

        /* Form Fields */
        .ct-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .ct-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .ct-label {
          font-size: 0.78rem;
          font-weight: 500;
          color: var(--muted);
          transition: color 0.2s;
        }
        .ct-field-focus .ct-label {
          color: var(--accent);
        }
        .ct-input-wrap {
          position: relative;
          display: flex;
          align-items: flex-start;
        }
        .ct-input-icon {
          position: absolute;
          left: 13px;
          top: 12px;
          color: var(--faint);
          pointer-events: none;
          transition: color 0.2s;
        }
        .ct-textarea-icon {
          top: 14px;
        }
        .ct-field-focus .ct-input-icon {
          color: var(--accent);
        }
        .ct-input {
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
        .ct-input:focus {
          border-color: rgba(88, 130, 255, 0.5);
          background: rgba(88, 130, 255, 0.04);
          box-shadow: 0 0 0 3px rgba(88, 130, 255, 0.1);
        }
        .ct-input::placeholder {
          color: var(--faint);
          font-size: 0.85rem;
        }
        .ct-textarea {
          width: 100%;
          font-family: var(--fb);
          font-size: 0.9rem;
          color: var(--text);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 11px 14px 11px 40px;
          outline: none;
          resize: vertical;
          transition: all 0.2s;
        }
        .ct-textarea:focus {
          border-color: rgba(88, 130, 255, 0.5);
          background: rgba(88, 130, 255, 0.04);
          box-shadow: 0 0 0 3px rgba(88, 130, 255, 0.1);
        }
        .ct-textarea::placeholder {
          color: var(--faint);
          font-size: 0.85rem;
        }

        /* Submit Button */
        .ct-submit {
          margin-top: 0.5rem;
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
        .ct-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(88, 130, 255, 0.5);
        }
        .ct-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .ct-spinner {
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

        /* FAQ Section */
        .ct-faq-section {
          padding: 4rem 2rem;
          position: relative;
          z-index: 10;
          background: rgba(17, 19, 24, 0.3);
        }
        .ct-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .ct-section-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .ct-section-title {
          font-family: var(--fd);
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .ct-section-sub {
          font-size: 0.9rem;
          color: var(--muted);
        }
        .ct-faq-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .ct-faq-card {
          background: rgba(17, 19, 24, 0.6);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }
        .ct-faq-card:hover {
          border-color: var(--border-h);
          transform: translateY(-4px);
        }
        .ct-faq-q {
          font-family: var(--fd);
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--text);
        }
        .ct-faq-a {
          font-size: 0.85rem;
          color: var(--muted);
          line-height: 1.6;
        }

        /* CTA Section */
        .ct-cta-section {
          padding: 5rem 2rem;
          text-align: center;
          position: relative;
          border-top: 1px solid var(--border);
          margin-top: 2rem;
        }
        .ct-cta-glow {
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
        .ct-cta-content {
          position: relative;
          z-index: 10;
          max-width: 700px;
          margin: 0 auto;
        }
        .ct-cta-title {
          font-family: var(--fd);
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin: 0.8rem 0 1rem;
        }
        .ct-cta-sub {
          font-size: 0.95rem;
          color: var(--muted);
          margin-bottom: 2rem;
        }
        .ct-cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .ct-btn-primary {
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
        .ct-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(88, 130, 255, 0.5);
        }
        .ct-btn-secondary {
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
        .ct-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.04);
          color: var(--text);
          border-color: rgba(255, 255, 255, 0.22);
          transform: translateY(-2px);
        }

        /* Footer */
        .ct-footer {
          padding: 2rem 2rem 1.5rem;
          border-top: 1px solid var(--border);
          background: rgba(10, 12, 18, 0.8);
          position: relative;
          z-index: 10;
        }
        .ct-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .ct-footer-links {
          display: flex;
          gap: 1.8rem;
          flex-wrap: wrap;
        }
        .ct-footer-link {
          font-size: 0.8rem;
          color: var(--faint);
          text-decoration: none;
          transition: color 0.2s;
        }
        .ct-footer-link:hover {
          color: var(--accent);
        }
        .ct-footer-copy {
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
          .ct-nav-desktop {
            display: none;
          }
          .ct-hamburger {
            display: flex;
          }
          .ct-nav-container {
            padding: 0 1.25rem;
            height: 58px;
          }
          .ct-hero {
            padding: 6rem 1.25rem 3rem;
          }
          .ct-main {
            padding: 1rem 1.25rem 3rem;
          }
          .ct-info-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .ct-form-card {
            padding: 1.75rem;
          }
          .ct-faq-section {
            padding: 3rem 1.25rem;
          }
          .ct-faq-grid {
            grid-template-columns: 1fr;
          }
          .ct-cta-section {
            padding: 4rem 1.25rem;
          }
          .ct-cta-buttons {
            flex-direction: column;
            align-items: center;
          }
          .ct-btn-primary, .ct-btn-secondary {
            width: 220px;
            justify-content: center;
          }
          .ct-footer-inner {
            flex-direction: column;
            text-align: center;
          }
        }
        @media (max-width: 560px) {
          .ct-info-grid {
            grid-template-columns: 1fr;
          }
          .ct-toast {
            white-space: normal;
            text-align: center;
            max-width: 90%;
          }
        }
      `}</style>
    </div>
  );
}
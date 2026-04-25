import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function About() {
  const [focusedCard, setFocusedCard] = useState(null);
  const missionRefs = useRef([]);
  const featureRefs = useRef([]);
  const techRef = useRef(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("ab-in"); }),
      { threshold: 0.1 }
    );
    [...missionRefs.current, ...featureRefs.current].forEach(el => el && io.observe(el));
    if (techRef.current) io.observe(techRef.current);
    return () => io.disconnect();
  }, []);

  const features = [
    { icon: "📊", title: "Real-Time Analytics", desc: "Track study hours, assignment completion, and quiz performance with actionable suggestions." },
    { icon: "🧠", title: "AI Insights", desc: "Get personalized AI-generated feedback on your learning progress and weak areas." },
    { icon: "💬", title: "AI Chat", desc: "Chat with AI assistant for study guidance, question solving, and topic explanations." },
    { icon: "📋", title: "Smart Quizzes", desc: "Generate AI-tailored quizzes for your courses and performance level." },
    { icon: "📝", title: "AI Notes", desc: "Auto-generate structured notes tailored to your course topics and learning pace." },
    { icon: "📚", title: "Class Management", desc: "Join classes, view class details, and access teacher information." },
    { icon: "👥", title: "Study Groups", desc: "Collaborate with peers, share resources, and learn together." },
    { icon: "🎥", title: "YouTube Summarizer", desc: "Get instant AI summaries of educational videos to save study time." },
  ];

  const teamValues = [
    { icon: "🎯", title: "Mission", desc: "Democratize quality education through intelligent technology. Every student deserves personalized learning experiences that adapt to their unique pace and style." },
    { icon: "🌟", title: "Vision", desc: "Create a world where AI-powered learning assistants help students achieve their full potential, making education accessible, engaging, and effective for everyone, everywhere." },
    { icon: "💡", title: "Values", desc: "Innovation, accessibility, integrity, and student-first approach drive everything we do. We believe in continuous improvement and putting learners first." },
  ];

  const techStack = [
    { name: "React.js", icon: "⚛️" },
    { name: "Node.js", icon: "🟢" },
    { name: "Express.js", icon: "🚂" },
    { name: "MongoDB", icon: "🍃" },
    { name: "Vite", icon: "⚡" },
    { name: "AI/ML", icon: "🧠" },
    { name: "Cloudinary", icon: "☁️" },
    { name: "Socket.io", icon: "🔌" },
  ];

  return (
    <div className="ab-root">
      {/* Background Elements */}
      <div className="ab-bg" />
      <div className="ab-grid" />
      <div className="ab-orb ab-orb-a" />
      <div className="ab-orb ab-orb-b" />
      <div className="ab-orb ab-orb-c" />

      {/* Nav */}
      <nav className="ab-nav">
        <Link to="/" className="ab-logo">
          <span className="ab-logo-gem">◈</span>
          StudyPulse
        </Link>
        <div className="ab-nav-right">
          <Link to="/" className="ab-nav-link">Home</Link>
          <Link to="/login" className="ab-nav-ghost">Sign In</Link>
          <Link to="/register" className="ab-nav-solid">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="ab-hero">
        <div className="ab-hero-content">
          <div className="ab-hero-eyebrow">About Us</div>
          <h1 className="ab-hero-title">
            Redefining Education
            <br />
            <span className="ab-grad">With Artificial Intelligence</span>
          </h1>
          <p className="ab-hero-subtitle">
            We're building the future of learning — one intelligent tool at a time.
          </p>
          <div className="ab-scroll-indicator">
            <div className="ab-scroll-dot" />
            <span>Learn more about our journey</span>
          </div>
        </div>
      </section>

      {/* Mission/Vision/Values Section */}
      <section className="ab-section">
        <div className="ab-container">
          <div className="ab-section-header">
            <div className="ab-eyebrow">Who We Are</div>
            <h2 className="ab-section-title">
              Our <span className="ab-grad">Core Purpose</span>
            </h2>
            <p className="ab-section-sub">
              Driven by a mission to transform how students learn and succeed.
            </p>
          </div>
          <div className="ab-values-grid">
            {teamValues.map((item, idx) => (
              <div
                key={idx}
                className="ab-value-card"
                ref={el => (missionRefs.current[idx] = el)}
                onMouseEnter={() => setFocusedCard(idx)}
                onMouseLeave={() => setFocusedCard(null)}
                style={{ transitionDelay: `${idx * 0.1}s` }}
              >
                <div className="ab-value-shine" />
                <div className="ab-value-icon">{item.icon}</div>
                <h3 className="ab-value-title">{item.title}</h3>
                <p className="ab-value-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="ab-section ab-features-section">
        <div className="ab-container">
          <div className="ab-section-header">
            <div className="ab-eyebrow">Capabilities</div>
            <h2 className="ab-section-title">
              Everything You Need
              <br />
              <span className="ab-grad">To Succeed</span>
          </h2>
            <p className="ab-section-sub">
              A complete ecosystem of AI-powered tools designed for modern learners.
            </p>
          </div>
          <div className="ab-features-grid">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="ab-feature-card"
                ref={el => (featureRefs.current[idx] = el)}
                style={{ transitionDelay: `${(idx % 4) * 0.07}s` }}
              >
                <div className="ab-feature-shine" />
                <div className="ab-feature-border-glow" />
                <div className="ab-feature-icon">{feature.icon}</div>
                <h4 className="ab-feature-title">{feature.title}</h4>
                <p className="ab-feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="ab-section ab-tech-section">
        <div className="ab-container">
          <div className="ab-tech-card" ref={techRef}>
            <div className="ab-tech-glow" />
            <div className="ab-tech-header">
              <div className="ab-eyebrow">Built With</div>
              <h2 className="ab-section-title">
                Modern <span className="ab-grad">Technology Stack</span>
              </h2>
              <p className="ab-section-sub">
                Cutting-edge tools and frameworks powering your learning experience.
              </p>
            </div>
            <div className="ab-tech-badges">
              {techStack.map((tech, idx) => (
                <div key={idx} className="ab-tech-badge">
                  <span className="ab-tech-icon">{tech.icon}</span>
                  {tech.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="ab-cta-section">
        <div className="ab-cta-glow" />
        <div className="ab-cta-content">
          <div className="ab-eyebrow" style={{ textAlign: "center" }}>Join Us</div>
          <h2 className="ab-cta-title">
            Ready to Transform
            <br />
            <span className="ab-grad">Your Learning Journey?</span>
          </h2>
          <p className="ab-cta-sub">
            Start studying smarter today. Join thousands of students already using AI StudyPulse.
          </p>
          <div className="ab-cta-buttons">
            <Link to="/register" className="ab-btn-primary">
              Get Started Free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link to="/login" className="ab-btn-secondary">Sign In</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ab-footer">
        <div className="ab-footer-inner">
          <div className="ab-logo ab-logo-sm">
            <span className="ab-logo-gem">◈</span> StudyPulse
          </div>
          <div className="ab-footer-links">
            <Link to="/about" className="ab-footer-link">About</Link>
            <Link to="/contact" className="ab-footer-link">Contact</Link>
            <Link to="/privacy" className="ab-footer-link">Privacy Policy</Link>
            <Link to="/terms" className="ab-footer-link">Terms of Service</Link>
          </div>
          <div className="ab-footer-copy">
            © 2025 StudyPulse — Built for students who want more.
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        .ab-root {
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

        .ab-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .ab-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Background */
        .ab-bg {
          position: fixed; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88, 130, 255, 0.1) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 90% 70%, rgba(32, 230, 208, 0.05) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 10% 80%, rgba(155, 122, 255, 0.05) 0%, transparent 55%);
        }
        .ab-grid {
          position: fixed; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(88, 130, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(88, 130, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 80%);
        }
        .ab-orb {
          position: fixed; border-radius: 50%; filter: blur(90px);
          pointer-events: none; z-index: 0;
        }
        .ab-orb-a {
          width: 460px; height: 460px; top: -140px; left: 50%;
          transform: translateX(-50%);
          background: rgba(88, 130, 255, 0.08);
          animation: orbA 9s ease-in-out infinite;
        }
        .ab-orb-b {
          width: 280px; height: 280px; bottom: 10%; right: -3%;
          background: rgba(32, 230, 208, 0.05);
          animation: orbB 11s 2s ease-in-out infinite;
        }
        .ab-orb-c {
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
        .ab-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 2.5rem; height: 64px;
          background: rgba(10, 12, 18, 0.75);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid var(--border);
          animation: navDown 0.5s cubic-bezier(.2, .9, .3, 1.1) both;
        }
        @keyframes navDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: none; }
        }
        .ab-logo {
          font-family: var(--fd); font-size: 1.15rem; font-weight: 700;
          letter-spacing: -0.02em; color: var(--text);
          display: flex; align-items: center; gap: 7px;
          text-decoration: none;
        }
        .ab-logo-sm { font-size: 1rem; }
        .ab-logo-gem {
          color: var(--accent);
          filter: drop-shadow(0 0 6px rgba(88, 130, 255, 0.55));
        }
        .ab-nav-right {
          display: flex; align-items: center; gap: 12px;
        }
        .ab-nav-link {
          font-size: 0.85rem; font-weight: 500;
          color: var(--muted); text-decoration: none;
          transition: color 0.2s;
        }
        .ab-nav-link:hover { color: var(--text); }
        .ab-nav-ghost {
          font-size: 0.85rem; font-weight: 500;
          padding: 7px 18px; border-radius: 40px;
          border: 1px solid var(--border-h);
          color: var(--muted); background: transparent;
          text-decoration: none; transition: all 0.2s;
        }
        .ab-nav-ghost:hover {
          color: var(--text);
          background: rgba(88, 130, 255, 0.08);
        }
        .ab-nav-solid {
          font-size: 0.85rem; font-weight: 600;
          padding: 7px 20px; border-radius: 40px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: #fff; text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(88, 130, 255, 0.3);
        }
        .ab-nav-solid:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(88, 130, 255, 0.45);
        }

        /* Hero */
        .ab-hero {
          min-height: 60vh;
          display: flex; align-items: center; justify-content: center;
          text-align: center;
          position: relative;
          padding: 8rem 2rem 5rem;
        }
        .ab-hero-content {
          position: relative; z-index: 10;
          max-width: 800px; margin: 0 auto;
        }
        .ab-hero-eyebrow {
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--accent);
          margin-bottom: 1rem;
          animation: fadeUp 0.6s 0.2s both;
        }
        .ab-hero-title {
          font-family: var(--fd);
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 800; line-height: 1.15; letter-spacing: -0.03em;
          margin-bottom: 1.2rem;
          animation: fadeUp 0.6s 0.3s both;
        }
        .ab-hero-subtitle {
          font-size: clamp(0.9rem, 1.2vw, 1rem);
          color: var(--muted);
          max-width: 550px; margin: 0 auto;
          line-height: 1.6;
          animation: fadeUp 0.6s 0.4s both;
        }
        .ab-scroll-indicator {
          display: flex; flex-direction: column; align-items: center;
          gap: 8px; margin-top: 3rem;
          font-size: 0.7rem; color: var(--faint);
          letter-spacing: 0.1em; text-transform: uppercase;
          animation: fadeUp 0.6s 0.5s both;
        }
        .ab-scroll-dot {
          width: 2px; height: 32px;
          background: linear-gradient(to bottom, var(--accent), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(0.7); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }

        /* Sections */
        .ab-section {
          padding: 5rem 2rem;
          position: relative;
          z-index: 10;
        }
        .ab-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        .ab-section-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .ab-eyebrow {
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.15em;
          text-transform: uppercase; color: var(--accent);
          margin-bottom: 0.8rem;
        }
        .ab-section-title {
          font-family: var(--fd);
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          font-weight: 700; line-height: 1.2; letter-spacing: -0.02em;
          margin-bottom: 0.8rem;
        }
        .ab-section-sub {
          font-size: 0.9rem; color: var(--muted);
          max-width: 500px; margin: 0 auto;
        }

        /* Values Cards */
        .ab-values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .ab-value-card {
          background: rgba(17, 19, 24, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease, border-color 0.2s;
        }
        .ab-value-card.ab-in {
          opacity: 1; transform: translateY(0);
        }
        .ab-value-card:hover {
          border-color: var(--border-h);
          background: rgba(88, 130, 255, 0.05);
        }
        .ab-value-shine {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(88, 130, 255, 0.08), transparent 70%);
          opacity: 0; transition: opacity 0.3s;
          pointer-events: none;
        }
        .ab-value-card:hover .ab-value-shine {
          opacity: 1;
        }
        .ab-value-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        .ab-value-title {
          font-family: var(--fd);
          font-size: 1.1rem; font-weight: 700;
          margin-bottom: 0.8rem;
        }
        .ab-value-desc {
          font-size: 0.85rem;
          color: var(--muted);
          line-height: 1.6;
        }

        /* Features Grid */
        .ab-features-section {
          background: rgba(17, 19, 24, 0.3);
        }
        .ab-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: 24px;
          overflow: hidden;
        }
        .ab-feature-card {
          background: var(--surface);
          padding: 1.8rem;
          position: relative;
          overflow: hidden;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.1), transform 0.5s ease, background 0.3s;
        }
        .ab-feature-card.ab-in {
          opacity: 1; transform: translateY(0);
        }
        .ab-feature-card:hover {
          background: rgba(88, 130, 255, 0.05);
        }
        .ab-feature-shine {
          position: absolute; inset: 0;
          background: radial-gradient(circle at var(--mx, 50%) var(--my, 0%), rgba(88, 130, 255, 0.1), transparent 70%);
          opacity: 0; transition: opacity 0.3s;
          pointer-events: none;
        }
        .ab-feature-card:hover .ab-feature-shine {
          opacity: 1;
        }
        .ab-feature-border-glow {
          position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(88, 130, 255, 0.6), transparent);
          opacity: 0; transition: opacity 0.3s;
        }
        .ab-feature-card:hover .ab-feature-border-glow {
          opacity: 1;
        }
        .ab-feature-icon {
          font-size: 1.8rem;
          width: 56px; height: 56px;
          background: rgba(88, 130, 255, 0.1);
          border: 1px solid rgba(88, 130, 255, 0.2);
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.2rem;
          transition: transform 0.25s;
        }
        .ab-feature-card:hover .ab-feature-icon {
          transform: scale(1.05);
        }
        .ab-feature-title {
          font-family: var(--fd);
          font-size: 0.95rem; font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .ab-feature-desc {
          font-size: 0.8rem;
          color: var(--muted);
          line-height: 1.6;
        }

        /* Tech Section */
        .ab-tech-section {
          padding: 3rem 2rem 5rem;
        }
        .ab-tech-card {
          background: rgba(17, 19, 24, 0.6);
          backdrop-filter: blur(12px);
          border: 1px solid var(--border);
          border-radius: 32px;
          padding: 3rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .ab-tech-card.ab-in {
          opacity: 1; transform: translateY(0);
        }
        .ab-tech-glow {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 400px; height: 200px;
          background: radial-gradient(ellipse, rgba(88, 130, 255, 0.1), transparent);
          filter: blur(60px);
          pointer-events: none;
        }
        .ab-tech-badges {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
          margin-top: 2rem;
        }
        .ab-tech-badge {
          background: rgba(88, 130, 255, 0.1);
          border: 1px solid rgba(88, 130, 255, 0.2);
          padding: 0.6rem 1.2rem;
          border-radius: 48px;
          font-size: 0.85rem;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .ab-tech-badge:hover {
          background: rgba(88, 130, 255, 0.2);
          border-color: rgba(88, 130, 255, 0.4);
          transform: translateY(-2px);
        }
        .ab-tech-icon {
          font-size: 1rem;
        }

        /* CTA Section */
        .ab-cta-section {
          padding: 5rem 2rem;
          text-align: center;
          position: relative;
          border-top: 1px solid var(--border);
          margin-top: 2rem;
        }
        .ab-cta-glow {
          position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
          width: 600px; height: 300px;
          background: radial-gradient(ellipse, rgba(88, 130, 255, 0.1), transparent);
          filter: blur(70px);
          pointer-events: none;
        }
        .ab-cta-content {
          position: relative;
          z-index: 10;
          max-width: 700px;
          margin: 0 auto;
        }
        .ab-cta-title {
          font-family: var(--fd);
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin: 0.8rem 0 1rem;
        }
        .ab-cta-sub {
          font-size: 0.95rem;
          color: var(--muted);
          margin-bottom: 2rem;
          line-height: 1.7;
        }
        .ab-cta-buttons {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .ab-btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 0.9rem; font-weight: 600;
          padding: 12px 32px; border-radius: 48px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: #fff; text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(88, 130, 255, 0.35);
        }
        .ab-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(88, 130, 255, 0.5);
        }
        .ab-btn-secondary {
          display: inline-flex; align-items: center;
          font-size: 0.9rem; font-weight: 500;
          padding: 12px 32px; border-radius: 48px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: var(--muted); text-decoration: none;
          transition: all 0.2s;
        }
        .ab-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.04);
          color: var(--text);
          border-color: rgba(255, 255, 255, 0.22);
          transform: translateY(-2px);
        }

        /* Footer */
        .ab-footer {
          padding: 2rem 2rem 1.5rem;
          border-top: 1px solid var(--border);
          background: rgba(10, 12, 18, 0.8);
          position: relative;
          z-index: 10;
        }
        .ab-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .ab-footer-links {
          display: flex;
          gap: 1.8rem;
          flex-wrap: wrap;
        }
        .ab-footer-link {
          font-size: 0.8rem;
          color: var(--faint);
          text-decoration: none;
          transition: color 0.2s;
        }
        .ab-footer-link:hover {
          color: var(--accent);
        }
        .ab-footer-copy {
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
          .ab-nav {
            padding: 0 1.25rem;
            height: 58px;
          }
          .ab-nav-right {
            gap: 8px;
          }
          .ab-nav-link {
            display: none;
          }
          .ab-nav-ghost, .ab-nav-solid {
            padding: 5px 14px;
            font-size: 0.8rem;
          }
          .ab-hero {
            padding: 6rem 1.25rem 4rem;
          }
          .ab-section {
            padding: 3rem 1.25rem;
          }
          .ab-values-grid {
            grid-template-columns: 1fr;
          }
          .ab-features-grid {
            grid-template-columns: 1fr;
          }
          .ab-tech-card {
            padding: 2rem 1.25rem;
          }
          .ab-tech-badge {
            padding: 0.4rem 0.9rem;
            font-size: 0.75rem;
          }
          .ab-cta-section {
            padding: 4rem 1.25rem;
          }
          .ab-cta-buttons {
            flex-direction: column;
            align-items: center;
          }
          .ab-btn-primary, .ab-btn-secondary {
            width: 220px;
            justify-content: center;
          }
          .ab-footer-inner {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
          .ab-footer-links {
            justify-content: center;
          }
        }
        @media (max-width: 480px) {
          .ab-value-card {
            padding: 1.5rem;
          }
          .ab-feature-card {
            padding: 1.2rem;
          }
          .ab-feature-icon {
            width: 48px;
            height: 48px;
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
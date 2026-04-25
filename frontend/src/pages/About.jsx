import React from "react";
import { Link } from "react-router-dom";
import Stars from "../components/Stars";

export default function About() {
  const features = [
    { icon: "📊", title: "Real-time Analytics", desc: "Track study hours, assignment completion, and quiz performance with actionable suggestions." },
    { icon: "🧠", title: "AI Insights", desc: "Get personalized AI-generated feedback on your learning progress and weak areas." },
    { icon: "💬", title: "AI Chat", desc: "Chat with AI assistant for study guidance, question solving, and topic explanations." },
    { icon: "📋", title: "AI Quizzes", desc: "Generate AI-tailored quizzes for your courses and performance level." },
    { icon: "📝", title: "AI Notes", desc: "Generate AI-tailored notes for your courses and performance level." },
    { icon: "📚", title: "Class Management", desc: "Join classes, view class details, and access teacher information." },
  ];

  return (
    <div className="about-page min-vh-100 d-flex flex-column">
      <Stars />

      <div className="back-home-container">
        <Link to="/" className="back-home-btn">← Back to Home</Link>
      </div>

      <section className="about-hero-section">
        <div className="about-hero-content">
          <h1 className="about-hero-title">About AI StudyPulse</h1>
          <p className="about-hero-subtitle">Discover how we're transforming education with artificial intelligence</p>
        </div>
      </section>

      <section className="container my-5">
        <div className="row g-4">
          <div className="col-md-6">
            <div className="mission-card">
              <div className="mission-icon">🎯</div>
              <h3>Our Mission</h3>
              <p>At AI StudyPulse, we're on a mission to democratize quality education through intelligent technology. Every student deserves personalized learning experiences that adapt to their unique pace and style.</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mission-card">
              <div className="mission-icon">🌟</div>
              <h3>Our Vision</h3>
              <p>To create a world where AI-powered learning assistants help students achieve their full potential, making education accessible, engaging, and effective for everyone, everywhere.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container my-5">
        <h2 className="text-center fw-bold mb-5"><span className="section-title">What We Offer</span></h2>
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div className="about-feature-card" key={idx}>
              <div className="feature-icon">{feature.icon}</div>
              <h5>{feature.title}</h5>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container my-5">
        <div className="tech-stack-card">
          <h3>Built With Modern Technology</h3>
          <div className="tech-badges">
            <span className="tech-badge">React.js</span>
            <span className="tech-badge">Node.js</span>
            <span className="tech-badge">Express.js</span>
            <span className="tech-badge">MongoDB</span>
            <span className="tech-badge">Vite</span>
            <span className="tech-badge">AI Integration</span>
            <span className="tech-badge">Cloudinary</span>
            <span className="tech-badge">Socket.io</span>
          </div>
        </div>
      </section>

      <style>{`
        .about-page { background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #5a77a3 100%); min-height: 100vh; }
        .back-home-container { position: fixed; top: 20px; left: 20px; z-index: 100; }
        .back-home-btn { background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 8px 18px; border-radius: 30px; color: white; text-decoration: none; font-size: 0.9rem; transition: all 0.3s; }
        .back-home-btn:hover { background: rgba(255,255,255,0.3); transform: translateX(-3px); color: white; }
        .about-hero-section { min-height: 40vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 40px 20px; }
        .about-hero-title { font-size: 2.5rem; font-weight: 800; color: white; margin-bottom: 16px; }
        .about-hero-subtitle { font-size: 1.1rem; color: #cbd5e1; max-width: 600px; margin: 0 auto; }
        .mission-card { background: rgba(255,255,255,0.95); border-radius: 24px; padding: 32px; height: 100%; text-align: center; transition: all 0.3s; }
        .mission-card:hover { transform: translateY(-5px); box-shadow: 0 20px 35px rgba(0,0,0,0.15); }
        .mission-icon { font-size: 48px; margin-bottom: 16px; }
        .mission-card h3 { color: #1e293b; margin-bottom: 12px; }
        .mission-card p { color: #475569; line-height: 1.6; }
        .section-title { color: white; font-size: 2rem; font-weight: 700; }
        .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
        .about-feature-card { background: rgba(255,255,255,0.95); border-radius: 20px; padding: 24px; text-align: center; transition: all 0.3s; }
        .about-feature-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.12); }
        .about-feature-card .feature-icon { font-size: 36px; margin-bottom: 12px; }
        .about-feature-card h5 { font-weight: 700; margin-bottom: 8px; color: #1e293b; }
        .about-feature-card p { color: #64748b; font-size: 0.85rem; }
        .tech-stack-card { background: rgba(255,255,255,0.95); border-radius: 24px; padding: 40px; text-align: center; }
        .tech-stack-card h3 { margin-bottom: 24px; color: #1e293b; }
        .tech-badges { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
        .tech-badge { background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; padding: 8px 20px; border-radius: 30px; font-size: 0.85rem; font-weight: 500; }
        @media (max-width: 768px) {
          .about-hero-title { font-size: 1.8rem; }
          .about-hero-subtitle { font-size: 0.95rem; }
          .section-title { font-size: 1.5rem; }
          .features-grid { grid-template-columns: 1fr; }
          .tech-badge { font-size: 0.7rem; padding: 5px 12px; }
          .back-home-btn { padding: 5px 12px; font-size: 0.8rem; }
        }
      `}</style>
    </div>
  );
}
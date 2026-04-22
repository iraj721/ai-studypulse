import React from "react";
import { Link } from "react-router-dom";
import Stars from "../components/Stars";

export default function About() {
  const features = [
    {
      icon: "📊",
      title: "Real-time Analytics",
      desc: "Track study hours, assignment completion, and quiz performance with actionable suggestions.",
    },
    {
      icon: "🧠",
      title: "AI Insights",
      desc: "Get personalized AI-generated feedback on your learning progress and weak areas.",
    },
    {
      icon: "💬",
      title: "AI Chat",
      desc: "Chat with AI assistant for study guidance, question solving, and topic explanations.",
    },
    {
      icon: "📋",
      title: "AI Quizzes",
      desc: "Generate AI-tailored quizzes for your courses and performance level.",
    },
    {
      icon: "📝",
      title: "AI Notes",
      desc: "Generate AI-tailored notes for your courses and performance level.",
    },
    {
      icon: "📚",
      title: "Class Management",
      desc: "Join classes, view class details, and access teacher information.",
    },
  ];

  return (
    <div className="about-page min-vh-100 d-flex flex-column">
      <Stars />

      {/* Back to Home Button */}
      <div className="back-home-container">
        <Link to="/" className="back-home-btn">
          ← Back to Home
        </Link>
      </div>

      {/* Hero Section */}
      <section className="about-hero-section">
        <div className="about-hero-overlay">
          <div className="about-hero-content">
            <h1 className="about-hero-title">About AI StudyPulse</h1>
            <p className="about-hero-subtitle">
              Discover how we're transforming education with artificial
              intelligence
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container my-5">
        <div className="row g-4">
          <div className="col-md-6">
            <div className="mission-card p-4">
              <div className="mission-icon">🎯</div>
              <h3 className="fw-bold mb-3">Our Mission</h3>
              <p>
                At AI StudyPulse, we're on a mission to democratize quality
                education through intelligent technology. Every student deserves
                personalized learning experiences that adapt to their unique
                pace and style.
              </p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="mission-card p-4">
              <div className="mission-icon">🌟</div>
              <h3 className="fw-bold mb-3">Our Vision</h3>
              <p>
                To create a world where AI-powered learning assistants help
                students achieve their full potential, making education
                accessible, engaging, and effective for everyone, everywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container my-5">
        <h2 className="text-center fw-bold mb-5">
          <span className="section-title">What We Offer</span>
        </h2>
        <div className="row g-4">
          {features.map((feature, idx) => (
            <div className="col-md-4 col-sm-6" key={idx}>
              <div className="feature-card p-4 text-center">
                <div className="feature-icon">{feature.icon}</div>
                <h5 className="fw-bold mb-2">{feature.title}</h5>
                <p className="feature-desc">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="container my-5">
        <div className="tech-stack-card p-5 text-center">
          <h3 className="fw-bold mb-4">Built With Modern Technology</h3>
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
        .about-page {
          background: linear-gradient(180deg, #080e18ff 0%, #122138ff 25%, #1e3652ff 50%, #28507eff 75%, #5a77a3ff 100%);
          min-height: 100vh;
          position: relative;
        }

        .back-home-container {
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 100;
        }

        .back-home-btn {
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
          padding: 8px 18px;
          border-radius: 30px;
          color: white;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
          display: inline-block;
          border: 1px solid rgba(255,255,255,0.2);
        }

        .back-home-btn:hover {
          background: rgba(255,255,255,0.3);
          color: white;
          transform: translateX(-3px);
        }

        .about-hero-section {
          min-height: 50vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding-top: 40px;
        }

        .about-hero-title {
          font-size: 3.2rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .about-hero-subtitle {
          font-size: 1.2rem;
          color: #e5e7eb;
          max-width: 600px;
          margin: 0 auto;
        }

        .mission-card {
          background: rgba(255,255,255,0.95);
          border-radius: 24px;
          height: 100%;
          transition: all 0.3s ease;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }

        .mission-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .mission-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        .mission-card h3 {
          color: #1e293b;
        }

        .mission-card p {
          color: #475569;
          line-height: 1.6;
        }

        .section-title {
          color: #ffffff;
          font-size: 2rem;
          font-weight: 700;
        }

        .feature-card {
          background: rgba(255,255,255,0.95);
          border-radius: 20px;
          transition: all 0.3s ease;
          height: 100%;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.12);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 12px;
        }

        .feature-card h5 {
          color: #1e293b;
        }

        .feature-desc {
          color: #64748b;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .tech-stack-card {
          background: rgba(255,255,255,0.95);
          border-radius: 24px;
        }

        .tech-badges {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
        }

        .tech-badge {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          padding: 8px 20px;
          border-radius: 30px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .about-hero-title { font-size: 2rem; }
          .about-hero-subtitle { font-size: 1rem; }
          .section-title { font-size: 1.5rem; }
          .mission-card { margin-bottom: 16px; }
          .tech-badge { font-size: 0.7rem; padding: 5px 12px; }
          .back-home-btn { padding: 5px 12px; font-size: 0.8rem; top: 10px; left: 10px; }
        }

        @media (max-width: 576px) {
          .about-hero-title { font-size: 1.5rem; }
          .feature-card { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
}

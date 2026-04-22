import React from "react";
import { Link } from "react-router-dom";
import Stars from "../components/Stars";

export default function Home() {
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
    {
      icon: "📢",
      title: "Announcements & Replies",
      desc: "Stay updated with class announcements and interact via replies.",
    },
    {
      icon: "📝",
      title: "Assignments",
      desc: "Submit assignments, track submission status, and view marks obtained.",
    },
    {
      icon: "📂",
      title: "Materials",
      desc: "Access all uploaded class materials, files, and resources shared by teachers.",
    },
  ];

  return (
    <div className="min-vh-100 bg-gradient-light d-flex flex-column">
      <Stars />
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className=" hero-title">AI StudyPulse</h1>
            <p className=" hero-subtitle">
              Intelligent MERN-based learning platform providing smart,
              AI-driven feedback to students.
            </p>

            <div className=" hero-buttons">
              <Link
                to="/login"
                className="btn btn-primary btn-lg btn-hero interactive-btn"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-outline-light btn-lg btn-hero interactive-btn"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container my-5">
        <h2 className="text-center fw-bold mb-5">
          <p className="title">Platform Features</p>
        </h2>
        <div className="row g-4">
          {features.map((feature, idx) => (
            <div className="col-md-4" key={idx}>
              <div className="card feature-card h-100 p-4 text-center animate-card">
                <div className="fs-1 mb-3 icon-hover floating-icon">
                  {feature.icon}
                </div>
                <h5 className="fw-bold mb-2">{feature.title}</h5>
                <p className="text-muted">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      {/* Footer Section */}
      <footer className="footer-section">
        <div className="footer-container">
          <p className="footer-copyright">
            AI StudyPulse &copy; {new Date().getFullYear()} — Intelligent
            MERN-based learning platform.
          </p>
          <div className="footer-links">
            <Link to="/about" className="footer-link">
              About
            </Link>
            <Link to="/contact" className="footer-link">
              Contact
            </Link>
            <Link to="/privacy" className="footer-link">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>

      <style>{`
.bg-gradient-light {
  background-color: #5a77a3ff; 
}

/* ================= HOME HERO ================= */
.hero-section {
  position: relative;
  height: 90vh;
  overflow: hidden;
  background: linear-gradient(180deg,
      #080e18ff 0%,     
      #122138ff 25%,   
      #1e3652ff 50%,    
      #28507eff 75%,    
      #5a77a3ff 100%     
  );
}

.hero-overlay {
  position: relative;
  z-index: 1;
  height: 100%;
  width:100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
}


.hero-content {
  width: 100%;
  max-width: 720px;
  text-align: center;
}

.hero-title {
  font-size: 3.2rem;
  font-weight: 1000;
  color: #ffffff;
  line-height: 2;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #e5e7eb;
  margin-top: 12px;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 28px;
}


.interactive-btn {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.interactive-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.25);
}

.btn-primary.interactive-btn {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border: none;
}


.btn-primary.interactive-btn:hover {
  background: linear-gradient(135deg, #16a34a, #15803d);
}

.btn-outline-light.interactive-btn {
  border: 2px solid rgba(255,255,255,0.9);
  color: #ffffff;
}

.btn-outline-light.interactive-btn:hover {
  background: rgba(255,255,255,0.15);
}

.btn-outline-light.interactive-btn:hover {
  background: rgba(255,255,255,0.15);
}

.title{
  font-size: 30;
  color: #e4e9eaff;
}
/* ================= FEATURES ================= */
.feature-card {
  background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease, box-shadow 0.25s ease;
}

.feature-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 35px rgba(0,0,0,0.15);
}

.icon-hover {
  transition: transform 0.5s ease;
}

.feature-card:hover .icon-hover {
  transform: scale(1.15);
}

/* ================= FOOTER ================= */

.footer-section {
  background: rgba(255,255,255,0.95);
  padding: 20px 16px;
  margin-top: 60px;
  border-top: 1px solid rgba(0,0,0,0.05);
  width: 100%;
}

.footer-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  padding: 0 12px;
}

.footer-copyright {
  color: #6b7280;
  font-size: 0.8rem;
  margin-bottom: 10px;
  line-height: 1.4;
  white-space: normal;
  word-wrap: break-word;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.footer-link {
  color: #4f46e5;
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.3s ease;
  white-space: nowrap;
}

.footer-link:hover {
  color: #6366f1;
  text-decoration: underline;
}

/* ================= RESPONSIVE ================= */
@media (max-width: 768px) {
  .hero-section { height: 75vh; }
  .hero-title { font-size: 2.2rem; }
  .hero-subtitle { font-size: 1.05rem; }
}

@media (max-width: 576px) {
  .hero-section { height: 70vh; }
  .hero-title { font-size: 1.9rem; }
}

/* Additional Mobile Responsive - Home */
@media (max-width: 768px) {
  .hero-buttons {
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  
  .hero-buttons .btn {
    width: 200px;
  }
  
  .row.g-4 {
    flex-direction: column;
  }
  
  .row.g-4 .col-md-4 {
    width: 100%;
  }
  
  .feature-card {
    padding: 20px 16px !important;
  }
  
  .footer .d-flex {
    flex-direction: column;
    gap: 8px;
  }
}

/* Desktop */
@media (min-width: 769px) {
  .footer-container {
    max-width: 500px;
  }
  
  .footer-copyright {
    font-size: 0.85rem;
  }
  
  .footer-link {
    font-size: 0.85rem;
  }
}

/* Tablet */
@media (max-width: 768px) {
  .footer-section {
    padding: 18px 12px;
  }
  
  .footer-container {
    max-width: 400px;
    padding: 0 8px;
  }
  
  .footer-copyright {
    font-size: 0.7rem;
  }
  
  .footer-links {
    gap: 16px;
  }
  
  .footer-link {
    font-size: 0.7rem;
  }
}

/* Mobile */
@media (max-width: 480px) {
  .footer-section {
    padding: 16px 10px;
  }
  
  .footer-container {
    max-width: 320px;
    padding: 0 6px;
  }
  
  .footer-copyright {
    font-size: 0.65rem;
    margin-bottom: 8px;
  }
  
  .footer-links {
    gap: 12px;
  }
  
  .footer-link {
    font-size: 0.65rem;
    white-space: nowrap;
  }
}

/* Small Mobile */
@media (max-width: 380px) {
  .footer-container {
    max-width: 280px;
  }
  
  .footer-copyright {
    font-size: 0.6rem;
  }
  
  .footer-link {
    font-size: 0.6rem;
  }
  
  .footer-links {
    gap: 10px;
  }
}

      `}</style>
    </div>
  );
}

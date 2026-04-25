import React from "react";
import { Link } from "react-router-dom";
import Stars from "../components/Stars";
import { FaShieldAlt, FaDatabase, FaRobot, FaLock, FaCookie, FaServer, FaUserShield, FaChild, FaEdit, FaMailBulk } from "react-icons/fa";

export default function PrivacyPolicy() {
  const sections = [
    { icon: <FaDatabase />, title: "Information We Collect", content: "We collect information you provide directly to us, such as when you create an account, submit activities, take quizzes, or communicate with our AI assistant. This may include your name, email address, study preferences, and learning progress data." },
    { icon: <FaRobot />, title: "How We Use Your Information", content: "We use the information we collect to provide, maintain, and improve our services, to personalize your learning experience, to generate AI-powered insights and quizzes, and to communicate with you about updates and features." },
    { icon: <FaServer />, title: "AI Data Processing", content: "Your study activities, notes, and quiz responses may be processed by our AI systems to generate personalized insights, recommendations, and learning materials. This processing is done securely and is essential for providing our core features." },
    { icon: <FaLock />, title: "Data Security", content: "We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure." },
    { icon: <FaCookie />, title: "Cookies and Tracking", content: "We use cookies and similar tracking technologies to enhance your experience, analyze usage patterns, and remember your preferences. You can control cookie settings through your browser preferences." },
    { icon: <FaServer />, title: "Third-Party Services", content: "We may use third-party services like MongoDB Atlas, Cloudinary, and AI providers to deliver our services. These providers have their own privacy policies and security measures." },
    { icon: <FaUserShield />, title: "Your Rights", content: "You have the right to access, correct, or delete your personal information. You can manage your data through your account settings or by contacting our support team." },
    { icon: <FaChild />, title: "Children's Privacy", content: "Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such data, we will delete it promptly." },
    { icon: <FaEdit />, title: "Changes to This Policy", content: "We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the effective date." },
    { icon: <FaMailBulk />, title: "Contact Us", content: "If you have questions about this privacy policy, please contact us at privacy@aistudypulse.com or through our contact form." },
  ];

  return (
    <div className="privacy-page min-vh-100 d-flex flex-column">
      <Stars />

      <div className="back-home-container">
        <Link to="/" className="back-home-btn">← Back to Home</Link>
      </div>

      <section className="privacy-hero-section">
        <div className="privacy-hero-content">
          <FaShieldAlt className="privacy-hero-icon" />
          <h1 className="privacy-hero-title">Privacy Policy</h1>
          <p className="privacy-hero-subtitle">Last Updated: January 2026</p>
        </div>
      </section>

      <section className="container my-5">
        <div className="privacy-card">
          <p className="privacy-intro">At AI StudyPulse, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.</p>

          <div className="privacy-sections">
            {sections.map((section, idx) => (
              <div key={idx} className="privacy-section">
                <div className="privacy-section-icon">{section.icon}</div>
                <div className="privacy-section-content">
                  <h3>{section.title}</h3>
                  <p>{section.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="privacy-footer">
            <p>By using AI StudyPulse, you agree to this Privacy Policy.</p>
          </div>
        </div>
      </section>

      <style>{`
        .privacy-page { background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #5a77a3 100%); min-height: 100vh; }
        .back-home-container { position: fixed; top: 20px; left: 20px; z-index: 100; }
        .back-home-btn { background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); padding: 8px 18px; border-radius: 30px; color: white; text-decoration: none; font-size: 0.9rem; transition: all 0.3s; }
        .back-home-btn:hover { background: rgba(255,255,255,0.3); transform: translateX(-3px); color: white; }
        .privacy-hero-section { min-height: 35vh; display: flex; align-items: center; justify-content: center; text-align: center; padding: 40px 20px; }
        .privacy-hero-icon { font-size: 48px; color: #a5b4fc; margin-bottom: 16px; }
        .privacy-hero-title { font-size: 2.5rem; font-weight: 800; color: white; margin-bottom: 12px; }
        .privacy-hero-subtitle { font-size: 1rem; color: #cbd5e1; }
        .privacy-card { background: rgba(255,255,255,0.95); border-radius: 28px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); }
        .privacy-intro { font-size: 1.1rem; font-weight: 500; color: #1e293b; margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; }
        .privacy-sections { display: flex; flex-direction: column; gap: 28px; }
        .privacy-section { display: flex; gap: 16px; align-items: flex-start; }
        .privacy-section-icon { font-size: 24px; color: #4f46e5; margin-top: 4px; flex-shrink: 0; }
        .privacy-section-content { flex: 1; }
        .privacy-section-content h3 { color: #1e293b; font-size: 1.2rem; font-weight: 700; margin-bottom: 8px; }
        .privacy-section-content p { color: #475569; line-height: 1.6; font-size: 0.95rem; }
        .privacy-footer { margin-top: 32px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; }
        .privacy-footer p { color: #64748b; font-size: 0.9rem; }
        @media (max-width: 768px) {
          .privacy-hero-title { font-size: 1.8rem; }
          .privacy-card { padding: 24px; }
          .privacy-section { flex-direction: column; gap: 8px; }
          .privacy-section-icon { font-size: 20px; }
          .privacy-section-content h3 { font-size: 1rem; }
          .privacy-section-content p { font-size: 0.85rem; }
          .back-home-btn { padding: 5px 12px; font-size: 0.8rem; }
        }
      `}</style>
    </div>
  );
}
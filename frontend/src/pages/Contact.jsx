import React, { useState } from "react";
import { Link } from "react-router-dom";
import Stars from "../components/Stars";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending (no backend yet - just show success)
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1000);
  };

  return (
    <div className="contact-page min-vh-100 d-flex flex-column">
      <Stars />

      {/* Back to Home Button */}
      <div className="back-home-container">
        <Link to="/" className="back-home-btn">
          ← Back to Home
        </Link>
      </div>

      {/* Hero Section */}
      <section className="contact-hero-section">
        <div className="contact-hero-overlay">
          <div className="contact-hero-content">
            <h1 className="contact-hero-title">Get in Touch</h1>
            <p className="contact-hero-subtitle">
              We'd love to hear from you. Send us a message and we'll respond
              within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Only */}
      <section className="container my-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="contact-form-card p-4 p-md-5">
              <div className="text-center mb-4">
                <div className="contact-emoji">📧</div>
                <h3 className="fw-bold mb-2">Send Us a Message</h3>
                <p className="text-muted">
                  Have questions? We're here to help!
                </p>
              </div>

              {submitted && (
                <div className="alert alert-success mb-3 text-center">
                  ✓ Thank you! Your message has been sent. We'll get back to you
                  soon.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    type="text"
                    name="name"
                    className="form-control contact-input"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="email"
                    name="email"
                    className="form-control contact-input"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    name="subject"
                    className="form-control contact-input"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <textarea
                    name="message"
                    className="form-control contact-input"
                    rows="5"
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 contact-submit-btn"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Message →"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Response Note */}
      <section className="container my-4 text-center">
        <p className="quick-response">
          💬 Typically responds within a few hours
        </p>
      </section>

      <style>{`
        .contact-page {
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

        .contact-hero-section {
          min-height: 40vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding-top: 40px;
        }

        .contact-hero-title {
          font-size: 2.8rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 16px;
        }

        .contact-hero-subtitle {
          font-size: 1.1rem;
          color: #e5e7eb;
          max-width: 500px;
          margin: 0 auto;
        }

        .contact-form-card {
          background: rgba(255,255,255,0.95);
          border-radius: 28px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }

        .contact-emoji {
          font-size: 3rem;
        }

        .contact-input {
          border-radius: 14px;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .contact-input:focus {
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
          outline: none;
        }

        .contact-submit-btn {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          padding: 12px;
          font-weight: 600;
          border-radius: 14px;
          transition: all 0.3s ease;
        }

        .contact-submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.35);
        }

        .contact-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .quick-response {
          color: rgba(255,255,255,0.7);
          font-size: 0.85rem;
        }

        @media (max-width: 768px) {
          .contact-hero-title { font-size: 2rem; }
          .contact-hero-subtitle { font-size: 0.95rem; }
          .contact-form-card { margin: 0 16px; padding: 24px !important; }
          .back-home-btn { padding: 5px 12px; font-size: 0.8rem; }
        }

        @media (max-width: 576px) {
          .contact-hero-title { font-size: 1.6rem; }
          .contact-input { padding: 10px 14px; font-size: 0.85rem; }
        }
      `}</style>
    </div>
  );
}
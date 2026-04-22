import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await api.post("/auth/forgot-password", { email });
      setMessage("Password reset link sent to your email!");
      setEmail("");
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-bg min-vh-100 d-flex justify-content-center align-items-center position-relative">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="forgot-card p-4 p-md-5 shadow-lg animate-card">
              <div className="text-center mb-4">
                <div className="forgot-icon mx-auto mb-3">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="fw-bold mb-2">Forgot Password?</h3>
                <p className="text-muted mb-0">
                  Enter your email to receive a password reset link
                </p>
              </div>

              {message && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  {message}
                  <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
                </div>
              )}

              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError("")}></button>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Email Address</label>
                  <input
                    type="email"
                    className="form-control form-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-forgot w-100 py-2"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </form>

              <hr className="my-4" />

              <div className="text-center">
                <Link to="/login" className="text-decoration-none fw-medium">
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .forgot-bg {
          background: linear-gradient(180deg, 
            #080e18 0%, 
            #122138 25%, 
            #1e3652 50%, 
            #28507e 75%, 
            #1a2a3d 100%);
          position: relative;
          overflow: hidden;
        }

        .forgot-card {
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
          border-radius: 20px;
          transition: transform 0.4s, box-shadow 0.4s;
        }

        .forgot-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        }

        .forgot-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #0066ff, #00c6ff);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .form-input {
          border-radius: 10px;
          padding: 12px 14px;
          border: 1px solid #dee2e6;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .form-input:focus {
          border-color: #0066ff;
          box-shadow: 0 0 12px rgba(0, 102, 255, 0.4);
          outline: none;
        }

        .btn-forgot {
          background: linear-gradient(135deg, #0066ff, #00c6ff);
          border: none;
          color: white;
          font-weight: 600;
          border-radius: 10px;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .btn-forgot:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 102, 255, 0.3);
          background: linear-gradient(135deg, #005ce6, #00bfff);
        }

        .btn-forgot:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .animate-card {
          animation: fadeInUp 0.8s ease forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .forgot-card {
            margin: 0 16px;
            padding: 24px 20px !important;
          }
          
          .forgot-icon {
            width: 55px;
            height: 55px;
          }
          
          .forgot-icon svg {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
}
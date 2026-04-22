import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";

export default function VerifyEmail() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timeLeft, setTimeLeft] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || localStorage.getItem("pendingEmail");

  useEffect(() => {
    if (!email) {
      navigate("/register");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      setError("Please enter 6-digit code");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await api.post("/auth/verify-email", {
        email,
        code: verificationCode,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.removeItem("pendingEmail");
      
      setSuccess("Email verified successfully! Redirecting...");
      
      setTimeout(() => {
        if (res.data.user?.role === "teacher") {
          navigate("/teacher/dashboard");
        } else if (res.data.user?.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/resend-verification", { email });
      setTimeLeft(600);
      setCanResend(false);
      setSuccess("New verification code sent to your email!");
      
      setCode(["", "", "", "", "", ""]);
      document.getElementById("code-0")?.focus();
      
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="verify-bg min-vh-100 d-flex justify-content-center align-items-center position-relative">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="verify-card p-4 p-md-5 shadow-lg animate-card">
              <div className="text-center mb-4">
                <div className="verify-icon mx-auto mb-3">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="fw-bold mb-2">Verify Your Email</h3>
                <p className="text-muted mb-0">
                  We've sent a verification code to
                </p>
                <p className="fw-semibold text-primary mb-0">{email}</p>
              </div>

              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {error}
                  <button type="button" className="btn-close" onClick={() => setError("")}></button>
                </div>
              )}

              {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  {success}
                  <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
                </div>
              )}

              <div className="mb-4">
                <label className="form-label fw-semibold text-center d-block mb-3">
                  Enter 6-Digit Code
                </label>
                <div className="d-flex gap-2 gap-md-3 justify-content-center">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      className="code-input text-center"
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleVerify}
                disabled={loading}
                className="btn btn-verify w-100 py-2 mb-3"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </button>

              <div className="text-center">
                {canResend ? (
                  <button
                    onClick={handleResendCode}
                    disabled={loading}
                    className="btn btn-link text-decoration-none"
                  >
                    Resend Verification Code
                  </button>
                ) : (
                  <p className="text-muted small mb-0">
                    Resend code in {formatTime(timeLeft)}
                  </p>
                )}
              </div>

              <hr className="my-4" />

              <div className="text-center">
                <p className="small text-muted mb-0">
                  Wrong email?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="btn btn-link text-decoration-none p-0"
                  >
                    Go back to Register
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .verify-bg {
          background: linear-gradient(180deg, 
            #080e18 0%, 
            #122138 25%, 
            #1e3652 50%, 
            #28507e 75%, 
            #1a2a3d 100%);
          position: relative;
          overflow: hidden;
        }

        .verify-card {
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
          border-radius: 20px;
          transition: transform 0.4s, box-shadow 0.4s;
        }

        .verify-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        }

        .verify-icon {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, #0066ff, #00c6ff);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .code-input {
          width: 55px;
          height: 65px;
          text-align: center;
          font-size: 28px;
          font-weight: bold;
          border: 2px solid #dee2e6;
          border-radius: 12px;
          background: white;
          transition: all 0.3s;
        }

        .code-input:focus {
          border-color: #0066ff;
          box-shadow: 0 0 12px rgba(0, 102, 255, 0.4);
          outline: none;
        }

        .btn-verify {
          background: linear-gradient(135deg, #0066ff, #00c6ff);
          border: none;
          color: white;
          font-weight: 600;
          border-radius: 10px;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .btn-verify:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 102, 255, 0.3);
          background: linear-gradient(135deg, #005ce6, #00bfff);
        }

        .btn-verify:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-link {
          color: #0066ff;
          font-weight: 500;
        }

        .btn-link:hover {
          color: #005ce6;
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
          .verify-card {
            margin: 0 16px;
            padding: 24px 20px !important;
          }
          
          .code-input {
            width: 45px;
            height: 55px;
            font-size: 24px;
          }
          
          .verify-icon {
            width: 55px;
            height: 55px;
          }
          
          .verify-icon svg {
            width: 28px;
            height: 28px;
          }
        }
      `}</style>
    </div>
  );
}
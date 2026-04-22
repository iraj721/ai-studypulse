import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../services/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const checkPasswordStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/\d/)) strength++;
    if (pass.match(/[@$!%*?&]/)) strength++;
    setPasswordStrength(strength);
  };

  const validatePassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters with uppercase, lowercase, number, and special character (@$!%*?&)");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "#dc3545";
    if (passwordStrength <= 2) return "#ffc107";
    if (passwordStrength <= 3) return "#17a2b8";
    return "#28a745";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return "Weak";
    if (passwordStrength <= 2) return "Fair";
    if (passwordStrength <= 3) return "Good";
    return "Strong";
  };

  return (
    <div className="reset-bg min-vh-100 d-flex justify-content-center align-items-center position-relative">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="reset-card p-4 p-md-5 shadow-lg animate-card">
              <div className="text-center mb-4">
                <div className="reset-icon mx-auto mb-3">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="fw-bold mb-2">Reset Password</h3>
                <p className="text-muted mb-0">Enter your new password</p>
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

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">New Password</label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control form-input"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        checkPasswordStrength(e.target.value);
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="btn-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {password && (
                    <div className="mt-2">
                      <div className="progress" style={{ height: "4px" }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${(passwordStrength / 4) * 100}%`,
                            backgroundColor: getStrengthColor(),
                            transition: "all 0.3s"
                          }}
                        ></div>
                      </div>
                      <small className="text-muted">
                        Password strength: <span style={{ color: getStrengthColor() }}>{getStrengthText()}</span>
                      </small>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Confirm Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control form-input"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-reset w-100 py-2"
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
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
        .reset-bg {
          background: linear-gradient(180deg, 
            #080e18 0%, 
            #122138 25%, 
            #1e3652 50%, 
            #28507e 75%, 
            #1a2a3d 100%);
          position: relative;
          overflow: hidden;
        }

        .reset-card {
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
          border-radius: 20px;
          transition: transform 0.4s, box-shadow 0.4s;
        }

        .reset-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        }

        .reset-icon {
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
          padding: 12px 40px 12px 14px;
          border: 1px solid #dee2e6;
          transition: border-color 0.3s, box-shadow 0.3s;
        }

        .form-input:focus {
          border-color: #0066ff;
          box-shadow: 0 0 12px rgba(0, 102, 255, 0.4);
          outline: none;
        }

        .btn-password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #6c757d;
          cursor: pointer;
          padding: 0;
        }

        .btn-password-toggle:hover {
          color: #0066ff;
        }

        .btn-reset {
          background: linear-gradient(135deg, #0066ff, #00c6ff);
          border: none;
          color: white;
          font-weight: 600;
          border-radius: 10px;
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .btn-reset:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 102, 255, 0.3);
          background: linear-gradient(135deg, #005ce6, #00bfff);
        }

        .btn-reset:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .progress {
          background-color: #e9ecef;
          border-radius: 4px;
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
          .reset-card {
            margin: 0 16px;
            padding: 24px 20px !important;
          }
          
          .reset-icon {
            width: 55px;
            height: 55px;
          }
          
          .reset-icon svg {
            width: 28px;
            height: 28px;
          }
          
          .form-input {
            font-size: 14px;
            padding: 10px 36px 10px 12px;
          }
        }
      `}</style>
    </div>
  );
}
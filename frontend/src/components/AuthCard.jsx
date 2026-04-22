import React, { useState } from "react";
import Stars from "./Stars";
import Toast from "./Toast";

export default function AuthCard({
  title,
  subtitle,
  fields,
  submitText,
  onSubmit,
  linkText,
  linkTo,
  loading,
}) {
  const [form, setForm] = useState(fields.reduce((acc, f) => ({ ...acc, [f.name]: "" }), {}));
  const [showPassword, setShowPassword] = useState({});
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [rippleStyle, setRippleStyle] = useState({});

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRipple = (e) => {
    const rect = e.target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    setRippleStyle({
      top: y + "px",
      left: x + "px",
      width: size + "px",
      height: size + "px",
    });

    setTimeout(() => setRippleStyle({}), 400);
  };

  const handleToggle = (name, e) => {
    setShowPassword({ ...showPassword, [name]: !showPassword[name] });
    handleRipple(e);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, setToast);
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center login-bg p-3">
      <Stars />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      <div className="card login-card p-5 shadow-lg animate-card">
        <div className="text-center mb-4">
          <h2 className="fw-bold login-title">{title}</h2>
          <p className="text-muted">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {fields.map((f, idx) => (
            <div key={idx} className="form-floating mb-3 position-relative">
              {f.type === "select" ? (
                <select
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  className="form-select form-input"
                  id={`floating${f.name}`}
                  required={f.required}
                >
                  {f.options.map((opt, i) => (
                    <option key={i} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type === "password" ? (showPassword[f.name] ? "text" : "password") : f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  className="form-control form-input"
                  id={`floating${f.name}`}
                  placeholder={f.label}
                  required={f.required}
                />
              )}
              <label htmlFor={`floating${f.name}`}>{f.label}</label>

              {f.type === "password" && (
                <span
                  className="toggle-password"
                  onClick={(e) => handleToggle(f.name, e)}
                  title={showPassword[f.name] ? "Hide password 🙈" : "Show password 👀"}
                >
                  {showPassword[f.name] ? "🙈" : "👀"}
                  {rippleStyle.width && <span className="ripple" style={rippleStyle}></span>}
                </span>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="btn btn-primary w-100 btn-login"
            disabled={loading}
          >
            {loading ? submitText + "..." : submitText}
          </button>
        </form>

        {linkText && linkTo && (
          <div className="d-flex justify-content-between mt-3">
            <a href={linkTo} className="link-primary small">{linkText}</a>
          </div>
        )}
      </div>

      <style>{`
        .login-bg {
          background: linear-gradient(180deg,
            #080e18ff 0%,     
            #122138ff 25%,   
            #1e3652ff 50%,    
            #28507eff 75%,    
            #5a77a3ff 100%     
          );
        }
        .login-card {
          max-width: 480px;
          width: 100%;
          border-radius: 16px;
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
          transition: transform 0.4s, box-shadow 0.4s;
        }
        .login-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 25px 50px rgba(0,0,0,0.25);
        }
        .login-title {
          animation: fadeInUp 0.8s ease forwards;
        }
        .form-floating>.form-control, .form-floating>.form-select {
          border-radius: 10px;
          padding: 12px 14px;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .form-floating>.form-control:focus, .form-floating>.form-select:focus {
          border-color: #007bff;
          box-shadow: 0 0 12px rgba(0,123,255,0.4);
          outline: none;
        }
        .toggle-password {
          position: absolute;
          top: 50%;
          right: 14px;
          transform: translateY(-50%);
          cursor: pointer;
          font-size: 1.3rem;
          user-select: none;
          transition: transform 0.3s, color 0.3s;
        }
        .toggle-password:hover {
          transform: translateY(-50%) scale(1.2);
          color: #007bff;
        }
        .ripple {
          position: absolute;
          border-radius: 50%;
          background: rgba(0, 123, 255, 0.3);
          animation: rippleEffect 0.4s linear;
          pointer-events: none;
        }
        @keyframes rippleEffect {
          from { transform: scale(0); opacity: 0.6; }
          to { transform: scale(2.5); opacity: 0; }
        }
        .btn-login {
          background: linear-gradient(135deg, #0066ff, #00c6ff);
          border: none;
          font-weight: 600;
          transition: transform 0.3s, box-shadow 0.3s, background 0.3s;
        }
        .btn-login:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 15px 35px rgba(0,0,0,0.25);
          background: linear-gradient(135deg, #005ce6, #00bfff);
        }
        .btn-login:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        a.link-primary {
          text-decoration: none;
          font-weight: 500;
        }
        a.link-primary:hover {
          text-decoration: underline;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-card {
          animation: fadeInUp 0.8s ease forwards;
        }
      `}</style>
    </div>
  );
}

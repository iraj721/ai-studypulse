import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState("");
  const toastTimer = useRef(null);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      showToast("Please fill in all fields.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      const role = res.data.user?.role || res.data.role;
      showToast("Login successful!", "success");
      setTimeout(() => {
        if (role === "teacher") navigate("/teacher/dashboard");
        else if (role === "admin") navigate("/admin/dashboard");
        else navigate("/dashboard");
      }, 600);
    } catch (err) {
      setIsLoading(false);
      if (err.response?.data?.requiresVerification) {
        localStorage.setItem("pendingEmail", form.email);
        navigate("/verify-email", { state: { email: form.email } });
        showToast("Please verify your email first.", "warning");
      } else {
        showToast(err.response?.data?.message || "Login failed. Please try again.", "error");
      }
    }
  };

  return (
    <div className="sp-root">
      {/* Background */}
      <div className="sp-bg" />
      <div className="sp-grid" />
      <div className="sp-orb sp-orb-a" />
      <div className="sp-orb sp-orb-b" />
      <div className="sp-orb sp-orb-c" />

      {/* Nav */}
      <nav className="sp-nav">
        <Link to="/" className="sp-logo">
          <span className="sp-logo-gem">◈</span>
          StudyPulse
        </Link>
        <div className="sp-nav-right">
          <span className="sp-nav-label">New here?</span>
          <Link to="/register" className="sp-nav-solid">Create Account</Link>
        </div>
      </nav>

      {/* Toast */}
      {toast && (
        <div className={`sp-toast sp-toast-${toast.type}`}>
          <span className="sp-toast-icon">
            {toast.type === "success" ? "✓" : toast.type === "warning" ? "⚠" : "✕"}
          </span>
          {toast.message}
        </div>
      )}

      {/* Card */}
      <main className="sp-main">
        <div className="sp-card">
          {/* Card header glow */}
          <div className="sp-card-glow" />

          <div className="sp-card-head">
            <div className="sp-card-eyebrow">Welcome back</div>
            <h1 className="sp-card-title">Sign in to StudyPulse</h1>
            <p className="sp-card-sub">
              Your AI-powered study dashboard awaits.
            </p>
          </div>

          <form className="sp-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className={`sp-field ${focused === "email" ? "sp-field-focus" : ""} ${form.email ? "sp-field-filled" : ""}`}>
              <label className="sp-label" htmlFor="email">Email address</label>
              <div className="sp-input-wrap">
                <svg className="sp-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M1 5.5l6.293 4.207a1 1 0 001.414 0L15 5.5" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  className="sp-input"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div className={`sp-field ${focused === "password" ? "sp-field-focus" : ""} ${form.password ? "sp-field-filled" : ""}`}>
              <div className="sp-label-row">
                <label className="sp-label" htmlFor="password">Password</label>
                <Link to="/forgot-password" className="sp-forgot">Forgot password?</Link>
              </div>
              <div className="sp-input-wrap">
                <svg className="sp-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  id="password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  className="sp-input"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="sp-eye"
                  onClick={() => setShowPass((s) => !s)}
                  tabIndex={-1}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 2l12 12M6.5 6.6A2 2 0 019.4 9.5M4.2 4.3C2.8 5.3 1.7 6.5 1 8c1.3 3 4 5 7 5 1.3 0 2.5-.4 3.5-1M6 3.1C6.6 3 7.3 3 8 3c3 0 5.7 2 7 5-.5 1.2-1.3 2.2-2.3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M1 8c1.3-3 4-5 7-5s5.7 2 7 5c-1.3 3-4 5-7 5s-5.7-2-7-5z" stroke="currentColor" strokeWidth="1.3"/>
                      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`sp-submit ${isLoading ? "sp-submit-loading" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="sp-spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="sp-card-foot">
            Don't have an account?{" "}
            <Link to="/register" className="sp-card-link">Create one free</Link>
          </div>
        </div>

        {/* Side tagline — hidden on mobile */}
        <div className="sp-side">
          <div className="sp-side-content">
            <div className="sp-side-eyebrow">Trusted by students</div>
            <h2 className="sp-side-title">
              Your AI study
              <br />
              <span className="sp-grad">partner is ready.</span>
            </h2>
            <p className="sp-side-sub">
              Real-time analytics, adaptive quizzes, and personalized AI feedback — all in one place.
            </p>
            <div className="sp-side-stats">
              {[
                { v: "12+", l: "AI Features" },
                { v: "3×",  l: "Faster Learning" },
                { v: "24/7", l: "Always Available" },
              ].map((s, i) => (
                <div key={i} className="sp-side-stat">
                  <div className="sp-side-stat-v">{s.v}</div>
                  <div className="sp-side-stat-l">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600&display=swap');

        :root {
          --bg:       #0a0c12;
          --surface:  #111318;
          --surface2: #181b22;
          --border:   rgba(88,130,255,0.12);
          --border-h: rgba(88,130,255,0.3);
          --accent:   #5882ff;
          --accent2:  #20e6d0;
          --violet:   #9b7aff;
          --text:     #edf2ff;
          --muted:    #8e9cc4;
          --faint:    #49587a;
          --fd:       'Syne', sans-serif;
          --fb:       'Inter', sans-serif;
        }

        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior:smooth; }

        .sp-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        .sp-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 60%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* BG */
        .sp-bg {
          position:fixed; inset:0; z-index:0;
          background:
            radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88,130,255,0.13) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 90% 70%, rgba(32,230,208,0.06) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 10% 80%, rgba(155,122,255,0.06) 0%, transparent 55%);
        }
        .sp-grid {
          position:fixed; inset:0; z-index:0;
          background-image:
            linear-gradient(rgba(88,130,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(88,130,255,0.03) 1px, transparent 1px);
          background-size:48px 48px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 80%);
        }
        .sp-orb { position:fixed; border-radius:50%; filter:blur(90px); pointer-events:none; z-index:0; }
        .sp-orb-a { width:460px; height:460px; top:-140px; left:50%; transform:translateX(-50%); background:rgba(88,130,255,0.09); animation:oa 9s ease-in-out infinite; }
        .sp-orb-b { width:280px; height:280px; bottom:10%; right:-3%; background:rgba(32,230,208,0.06); animation:ob 11s 2s ease-in-out infinite; }
        .sp-orb-c { width:240px; height:240px; top:30%; left:-4%; background:rgba(155,122,255,0.06); animation:ob 10s 4s ease-in-out infinite; }
        @keyframes oa { 0%,100%{transform:translateX(-50%) scale(1)} 50%{transform:translateX(-50%) scale(1.06)} }
        @keyframes ob { 0%,100%{transform:scale(1)} 50%{transform:scale(1.09)} }

        /* NAV */
        .sp-nav {
          position:fixed; top:0; left:0; right:0; z-index:100;
          display:flex; align-items:center; justify-content:space-between;
          padding:0 2.5rem; height:64px;
          background:rgba(10,12,18,0.7);
          backdrop-filter:blur(24px);
          border-bottom:1px solid var(--border);
          animation:spDown 0.5s cubic-bezier(.2,.9,.3,1.1) both;
        }
        @keyframes spDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:none} }

        .sp-logo {
          font-family:var(--fd); font-size:1.15rem; font-weight:700;
          letter-spacing:-0.02em; color:var(--text);
          display:flex; align-items:center; gap:7px;
          text-decoration:none;
        }
        .sp-logo-gem { color:var(--accent); filter:drop-shadow(0 0 6px rgba(88,130,255,0.55)); }
        .sp-nav-right { display:flex; align-items:center; gap:12px; }
        .sp-nav-label { font-size:0.82rem; color:var(--faint); }
        .sp-nav-solid {
          font-size:0.85rem; font-weight:600;
          padding:7px 20px; border-radius:40px;
          background:linear-gradient(135deg,var(--accent),#3a61e0);
          color:#fff; text-decoration:none;
          transition:all 0.2s;
          box-shadow:0 2px 12px rgba(88,130,255,0.3);
        }
        .sp-nav-solid:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(88,130,255,0.45); }

        /* TOAST */
        .sp-toast {
          position:fixed; top:80px; left:50%; transform:translateX(-50%);
          z-index:300; display:flex; align-items:center; gap:10px;
          padding:12px 22px; border-radius:40px;
          font-size:0.85rem; font-weight:500;
          backdrop-filter:blur(16px);
          animation:toastIn 0.35s cubic-bezier(.2,.9,.3,1.1) both;
          white-space:nowrap;
        }
        @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(-10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        .sp-toast-success { background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.35); color:#6ee7b7; }
        .sp-toast-error   { background:rgba(239,68,68,0.15);  border:1px solid rgba(239,68,68,0.35);  color:#fca5a5; }
        .sp-toast-warning { background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.35); color:#fcd34d; }
        .sp-toast-icon { font-size:1rem; line-height:1; }

        /* MAIN LAYOUT */
        .sp-main {
          position:relative; z-index:10;
          min-height:100vh;
          display:flex; align-items:center; justify-content:center;
          padding:5.5rem 2rem 3rem;
          gap:5rem;
        }

        /* CARD */
        .sp-card {
          position:relative; overflow:hidden;
          width:100%; max-width:420px;
          background:rgba(17,19,24,0.85);
          border:1px solid var(--border);
          border-radius:24px;
          padding:2.5rem;
          backdrop-filter:blur(24px);
          box-shadow:0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(88,130,255,0.06);
          animation:cardIn 0.6s cubic-bezier(.2,.9,.3,1.1) 0.1s both;
        }
        @keyframes cardIn { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }

        .sp-card-glow {
          position:absolute; top:-60px; left:50%; transform:translateX(-50%);
          width:280px; height:180px; border-radius:50%; filter:blur(60px);
          background:rgba(88,130,255,0.1); pointer-events:none;
        }

        .sp-card-head { margin-bottom:2rem; position:relative; }
        .sp-card-eyebrow {
          font-size:0.68rem; font-weight:600; letter-spacing:0.14em;
          text-transform:uppercase; color:var(--accent); margin-bottom:0.6rem;
        }
        .sp-card-title {
          font-family:var(--fd); font-size:1.55rem; font-weight:700;
          letter-spacing:-0.025em; line-height:1.2; margin-bottom:0.5rem;
          color:var(--text);
        }
        .sp-card-sub {
          font-size:0.85rem; color:var(--muted); font-weight:400; line-height:1.5;
        }

        /* FORM */
        .sp-form { display:flex; flex-direction:column; gap:1.1rem; position:relative; }

        .sp-field { display:flex; flex-direction:column; gap:0.45rem; }

        .sp-label-row { display:flex; align-items:center; justify-content:space-between; }

        .sp-label {
          font-size:0.78rem; font-weight:500;
          color:var(--muted); letter-spacing:0.01em;
          transition:color 0.2s;
        }
        .sp-field-focus .sp-label { color:var(--accent); }

        .sp-forgot {
          font-size:0.75rem; color:var(--faint); text-decoration:none;
          transition:color 0.2s;
        }
        .sp-forgot:hover { color:var(--accent); }

        .sp-input-wrap {
          position:relative; display:flex; align-items:center;
        }
        .sp-input-icon {
          position:absolute; left:13px; color:var(--faint);
          pointer-events:none; transition:color 0.2s; flex-shrink:0;
        }
        .sp-field-focus .sp-input-icon { color:var(--accent); }

        .sp-input {
          width:100%; font-family:var(--fb); font-size:0.9rem; font-weight:400;
          color:var(--text);
          background:rgba(255,255,255,0.04);
          border:1px solid var(--border);
          border-radius:10px;
          padding:11px 42px 11px 40px;
          outline:none;
          transition:border-color 0.2s, background 0.2s, box-shadow 0.2s;
          -webkit-appearance:none;
        }
        .sp-input::placeholder { color:var(--faint); font-size:0.85rem; }
        .sp-input:focus {
          border-color:rgba(88,130,255,0.5);
          background:rgba(88,130,255,0.04);
          box-shadow:0 0 0 3px rgba(88,130,255,0.1);
        }

        .sp-eye {
          position:absolute; right:12px;
          background:transparent; border:none; cursor:pointer;
          color:var(--faint); display:flex; align-items:center;
          transition:color 0.2s; padding:2px;
        }
        .sp-eye:hover { color:var(--muted); }

        /* SUBMIT */
        .sp-submit {
          margin-top:0.4rem;
          width:100%; display:flex; align-items:center; justify-content:center; gap:10px;
          font-family:var(--fb); font-size:0.95rem; font-weight:600;
          padding:13px 24px; border-radius:48px;
          background:linear-gradient(135deg, var(--accent), #3a61e0);
          border:none; color:#fff; cursor:pointer;
          transition:all 0.2s ease;
          box-shadow:0 4px 20px rgba(88,130,255,0.35);
          position:relative; overflow:hidden;
        }
        .sp-submit::before {
          content:''; position:absolute; inset:0;
          background:linear-gradient(135deg,rgba(255,255,255,0.08),transparent);
          opacity:0; transition:opacity 0.2s;
        }
        .sp-submit:hover:not(:disabled)::before { opacity:1; }
        .sp-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 28px rgba(88,130,255,0.5); }
        .sp-submit:active:not(:disabled) { transform:translateY(0); }
        .sp-submit:disabled { opacity:0.7; cursor:not-allowed; }

        /* SPINNER */
        .sp-spinner {
          width:16px; height:16px; border-radius:50%;
          border:2px solid rgba(255,255,255,0.25);
          border-top-color:#fff;
          animation:spin 0.7s linear infinite; flex-shrink:0;
        }
        @keyframes spin { to{transform:rotate(360deg)} }

        /* CARD FOOTER */
        .sp-card-foot {
          margin-top:1.75rem;
          text-align:center;
          font-size:0.82rem; color:var(--faint);
          padding-top:1.5rem;
          border-top:1px solid rgba(255,255,255,0.05);
        }
        .sp-card-link {
          color:var(--accent); text-decoration:none; font-weight:500;
          transition:color 0.2s;
        }
        .sp-card-link:hover { color:#7fa3ff; }

        /* SIDE PANEL */
        .sp-side {
          flex:1; max-width:420px;
          animation:cardIn 0.6s cubic-bezier(.2,.9,.3,1.1) 0.2s both;
        }
        .sp-side-content {}
        .sp-side-eyebrow {
          font-size:0.68rem; font-weight:600; letter-spacing:0.14em;
          text-transform:uppercase; color:var(--accent); margin-bottom:1rem;
        }
        .sp-side-title {
          font-family:var(--fd); font-size:clamp(2rem,3.5vw,2.8rem);
          font-weight:800; line-height:1.1; letter-spacing:-0.03em;
          margin-bottom:1rem; color:var(--text);
        }
        .sp-side-sub {
          font-size:0.9rem; color:var(--muted); line-height:1.7;
          font-weight:400; max-width:340px; margin-bottom:2.5rem;
        }
        .sp-side-stats {
          display:flex; gap:0; background:var(--border); gap:1px;
          border:1px solid var(--border); border-radius:16px; overflow:hidden;
        }
        .sp-side-stat {
          flex:1; background:var(--surface);
          padding:1.2rem 1rem; text-align:center;
          transition:background 0.2s;
        }
        .sp-side-stat:hover { background:rgba(88,130,255,0.06); }
        .sp-side-stat-v {
          font-family:var(--fd); font-size:1.5rem; font-weight:800;
          letter-spacing:-0.02em; line-height:1;
          background:linear-gradient(135deg,#fff,#b0c2ff);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          margin-bottom:0.3rem;
        }
        .sp-side-stat-l { font-size:0.72rem; color:var(--muted); font-weight:500; }

        /* RESPONSIVE */
        @media(max-width:900px) {
          .sp-side { display:none; }
          .sp-main { justify-content:center; gap:0; }
        }
        @media(max-width:768px) {
          .sp-nav { padding:0 1.25rem; height:58px; }
          .sp-nav-label { display:none; }
          .sp-main { padding:5rem 1.25rem 3rem; }
          .sp-card { padding:2rem 1.5rem; }
        }
        @media(max-width:420px) {
          .sp-card { border-radius:18px; padding:1.75rem 1.25rem; }
          .sp-card-title { font-size:1.3rem; }
        }
      `}</style>
    </div>
  );
}
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const FEATURES = [
  { icon: "📊", title: "Real-Time Analytics", desc: "Track every metric—study hours, assignments, quiz scores. Get actionable AI suggestions instantly." },
  { icon: "🧠", title: "AI Insights", desc: "Know your weak spots. Receive personalized feedback that turns struggle into strategy." },
  { icon: "💬", title: "AI Chat", desc: "Ask anything. Your AI tutor explains concepts, solves problems, and guides you 24/7." },
  { icon: "📋", title: "Smart Quizzes", desc: "AI-generated quizzes that match your level. Practice smarter, not harder." },
  { icon: "📝", title: "AI Notes", desc: "Auto-generated notes from your courses. Structured. Clear. Ready when you are." },
  { icon: "📚", title: "Class Management", desc: "Join classes with a code. Access everything—materials, assignments, announcements—in one place." },
  { icon: "📢", title: "Announcements", desc: "Never miss an update. Read, reply, and stay connected with threaded discussions." },
  { icon: "✅", title: "Assignments", desc: "Submit work, track deadlines, and see feedback. Know where you stand." },
  { icon: "📂", title: "Study Materials", desc: "All your resources, organized. Access files, slides, and notes anytime." },
  { icon: "👥", title: "Study Groups", desc: "Collaborate with peers. Share notes, ask questions, learn together." },
  { icon: "🃏", title: "Flashcards", desc: "AI turns your notes into flashcards. Review faster. Remember longer." },
  { icon: "🎥", title: "YouTube Summarizer", desc: "Paste any video link. Get key takeaways in seconds. Save hours." },
];

const STEPS = [
  { n: "01", title: "Create Account", desc: "Sign up in under a minute. Set your courses and learning goals." },
  { n: "02", title: "Join Classes", desc: "Enter a class code. Instant access to materials, assignments, and updates." },
  { n: "03", title: "Study With AI", desc: "Generate quizzes, notes, flashcards. Chat with AI. Learn at your pace." },
  { n: "04", title: "Track Growth", desc: "Watch your progress. Let AI guide you to what matters next." },
];

const HERO_LINES = [
  { l1: "Learn Without", l2: "Limits." },
  { l1: "Study Smarter,", l2: "Go Further." },
  { l1: "AI That", l2: "Knows You." },
  { l1: "Your Best", l2: "Semester Starts Here." },
];

const STATS = [
  { value: 12, suffix: "+", label: "AI Capabilities" },
  { value: 98, suffix: "%", label: "Student Success" },
  { value: 3,  suffix: "×", label: "Faster Learning" },
  { value: 24, suffix: "/7", label: "Always On" },
];

function useCountUp(target, duration = 1600, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = null;
    const tick = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, active]);
  return count;
}

function StatCard({ value, suffix, label, active }) {
  const n = useCountUp(value, 1600, active);
  return (
    <div className="sp-stat-card">
      <div className="sp-stat-val">{n}{suffix}</div>
      <div className="sp-stat-lbl">{label}</div>
    </div>
  );
}

export default function Home() {
  const [idx, setIdx]           = useState(0);
  const [visible, setVisible]   = useState(true);
  const [statsOn, setStatsOn]   = useState(false);
  const featRefs  = useRef([]);
  const stepRefs  = useRef([]);
  const statsRef  = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => { setIdx(i => (i + 1) % HERO_LINES.length); setVisible(true); }, 420);
    }, 3600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("sp-in"); }),
      { threshold: 0.1 }
    );
    [...featRefs.current, ...stepRefs.current].forEach(el => el && io.observe(el));

    const so = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setStatsOn(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) so.observe(statsRef.current);
    return () => { io.disconnect(); so.disconnect(); };
  }, []);

  const { l1, l2 } = HERO_LINES[idx];

  return (
    <div className="sp-root">

      {/* NAV */}
      <nav className="sp-nav">
        <div className="sp-logo">
          <span className="sp-logo-gem">◈</span>
          StudyPulse
        </div>
        <div className="sp-nav-right">
          <Link to="/login"    className="sp-nav-ghost">Sign In</Link>
          <Link to="/register" className="sp-nav-solid">Try Free</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="sp-hero">
        <div className="sp-hero-bg" />
        <div className="sp-grid"    />
        <div className="sp-orb sp-orb-a" />
        <div className="sp-orb sp-orb-b" />
        <div className="sp-orb sp-orb-c" />

        <div className="sp-hero-body">
          <h1 className={`sp-h1 ${visible ? "sp-h1-show" : "sp-h1-hide"}`}>
            <span className="sp-h1-plain">{l1}</span>
            <span className="sp-h1-grad">{l2}</span>
          </h1>

          <p className="sp-hero-p">
            AI that adapts to you. Smarter quizzes. Deeper insights. Faster results.
          </p>

          <div className="sp-btns">
            <Link to="/register" className="sp-btn-primary">
              Start for Free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link to="/login" className="sp-btn-ghost">Sign In</Link>
          </div>

          <div className="sp-scroll-hint">
            <div className="sp-scroll-bar" />
            <span>Scroll to explore</span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="sp-stats-wrap" ref={statsRef}>
        <div className="sp-stats-row">
          {STATS.map((s, i) => <StatCard key={i} {...s} active={statsOn} />)}
        </div>
      </div>

      {/* FEATURES */}
      <section className="sp-sec sp-feat-sec">
        <div className="sp-inner">
          <div className="sp-eyebrow">Capabilities</div>
          <h2 className="sp-sec-title">
            Everything You Need.
            <span className="sp-grad"> Nothing You Don't.</span>
          </h2>
          <p className="sp-sec-sub">
            AI-powered tools that adapt to your pace. Learn faster, stress less, and actually enjoy studying.
          </p>

          <div className="sp-feat-grid">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="sp-feat-card"
                ref={el => (featRefs.current[i] = el)}
                style={{ transitionDelay: `${(i % 4) * 0.07}s` }}
              >
                <div className="sp-feat-shine" />
                <div className="sp-feat-border-glow" />
                <div className="sp-feat-icon">{f.icon}</div>
                <div className="sp-feat-name">{f.title}</div>
                <div className="sp-feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="sp-sec sp-how-sec">
        <div className="sp-inner">
          <div className="sp-eyebrow">Process</div>
          <h2 className="sp-sec-title">
            From Zero to Ready
            <span className="sp-grad"> in Minutes.</span>
          </h2>
          <p className="sp-sec-sub">
            Four simple steps to smarter studying.
          </p>
          <div className="sp-how-grid">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className="sp-how-card"
                ref={el => (stepRefs.current[i] = el)}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="sp-how-n">{s.n}</div>
                <div className="sp-how-title">{s.title}</div>
                <div className="sp-how-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="sp-cta-sec">
        <div className="sp-cta-glow-a" />
        <div className="sp-cta-glow-b" />
        <div className="sp-cta-body">
          <div className="sp-eyebrow" style={{textAlign:"center"}}>Start Free</div>
          <h2 className="sp-cta-title">
            Start Your Best
            <span className="sp-grad"> Semester Today.</span>
          </h2>
          <p className="sp-cta-sub">
            No credit card required. Cancel anytime. Join thousands of students learning smarter with AI.
          </p>
          <div className="sp-btns">
            <Link to="/register" className="sp-btn-primary">
              Claim Free Account
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link to="/login" className="sp-btn-ghost">Sign In</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="sp-footer">
        <div className="sp-footer-in">
          <div className="sp-logo sp-logo-sm">
            <span className="sp-logo-gem">◈</span> StudyPulse
          </div>
          <div className="sp-footer-links">
            <Link to="/about"   className="sp-fl">About</Link>
            <Link to="/contact" className="sp-fl">Contact</Link>
            <Link to="/privacy" className="sp-fl">Privacy Policy</Link>
          </div>
          <div className="sp-footer-copy">
            © 2025 StudyPulse — Built for students who want more.
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        :root {
          --bg:        #0a0c12;
          --surface:   #111318;
          --surface2:  #181b22;
          --border:    rgba(88, 130, 255, 0.12);
          --border-h:  rgba(88, 130, 255, 0.28);
          --accent:    #5882ff;
          --accent2:   #20e6d0;
          --violet:    #9b7aff;
          --text:      #edf2ff;
          --muted:     #8e9cc4;
          --faint:     #49587a;
          --fd:        'Syne', sans-serif;
          --fb:        'Inter', sans-serif;
          --r:         16px;
        }

        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior:smooth; }

        .sp-root {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--text);
          overflow-x: hidden;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .sp-grad {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent2) 65%, var(--violet) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* NAV */
        .sp-nav {
          position: fixed; top:0; left:0; right:0; z-index:200;
          display: flex; align-items:center; justify-content:space-between;
          padding: 0 2.5rem; height: 68px;
          background: rgba(10,12,18,0.75);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid var(--border);
          animation: spDown 0.5s cubic-bezier(.2,.9,.3,1.1) forwards;
        }
        @keyframes spDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:none} }

        .sp-logo {
          font-family: var(--fd); font-size:1.25rem; font-weight:700;
          letter-spacing:-0.02em; color:var(--text);
          display:flex; align-items:center; gap:8px;
        }
        .sp-logo-sm { font-size:1rem; }
        .sp-logo-gem {
          color: var(--accent);
          filter: drop-shadow(0 0 8px rgba(88,130,255,0.5));
        }
        .sp-nav-right { display:flex; gap:12px; align-items:center; }

        .sp-nav-ghost {
          font-size:0.875rem; font-weight:500;
          padding:8px 20px; border-radius:40px;
          border:1px solid var(--border-h);
          color:var(--muted); background:transparent;
          text-decoration:none; transition:all 0.2s ease;
        }
        .sp-nav-ghost:hover { color:var(--text); background:rgba(88,130,255,0.08); border-color:var(--border-h); }

        .sp-nav-solid {
          font-size:0.875rem; font-weight:600;
          padding:8px 22px; border-radius:40px;
          background:linear-gradient(135deg, var(--accent), #4066df);
          border:none; color:#fff; text-decoration:none;
          transition:all 0.2s ease;
          box-shadow:0 2px 12px rgba(88,130,255,0.3);
        }
        .sp-nav-solid:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(88,130,255,0.4); }

        /* HERO */
        .sp-hero {
          min-height:100vh;
          display:flex; align-items:center; justify-content:center;
          position:relative; overflow:hidden;
          padding:8rem 2rem 6rem; text-align:center;
        }
        .sp-hero-bg {
          position:absolute; inset:0;
          background:
            radial-gradient(ellipse 70% 55% at 50% -10%, rgba(88,130,255,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 45% 35% at 85% 70%, rgba(32,230,208,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 45% 35% at 15% 80%, rgba(155,122,255,0.06) 0%, transparent 60%);
        }
        .sp-grid {
          position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(88,130,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(88,130,255,0.03) 1px, transparent 1px);
          background-size:48px 48px;
          mask-image:radial-gradient(ellipse 80% 70% at 50% 40%, black 20%, transparent 80%);
        }
        .sp-orb { position:absolute; border-radius:50%; filter:blur(100px); pointer-events:none; }
        .sp-orb-a {
          width:520px; height:520px; top:-180px; left:50%; transform:translateX(-50%);
          background:rgba(88,130,255,0.1);
          animation:oa 9s ease-in-out infinite;
        }
        .sp-orb-b {
          width:320px; height:320px; bottom:5%; right:-5%;
          background:rgba(32,230,208,0.06);
          animation:ob 11s 1.5s ease-in-out infinite;
        }
        .sp-orb-c {
          width:280px; height:280px; bottom:15%; left:-5%;
          background:rgba(155,122,255,0.06);
          animation:ob 10s 3s ease-in-out infinite;
        }
        @keyframes oa { 0%,100%{transform:translateX(-50%) scale(1)} 50%{transform:translateX(-50%) scale(1.05)} }
        @keyframes ob { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }

        .sp-hero-body { position:relative; z-index:2; max-width:720px; margin:0 auto; }

        .sp-h1 {
          font-family: var(--fd);
          font-size: clamp(2.8rem, 6vw, 4.8rem);
          font-weight: 800; line-height: 1.08; letter-spacing:-0.04em;
          margin-bottom: 1.6rem;
          display:flex; flex-direction:column; gap:0.08em;
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .sp-h1-show { opacity:1; transform:translateY(0); }
        .sp-h1-hide { opacity:0; transform:translateY(-14px); }
        .sp-h1-plain { color:var(--text); }
        .sp-h1-grad {
          background:linear-gradient(135deg, var(--accent) 0%, var(--accent2) 60%, var(--violet) 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }

        .sp-hero-p {
          font-size:clamp(1rem, 1.5vw, 1.125rem);
          font-weight:400; color:var(--muted); max-width:560px;
          margin:0 auto 2.4rem; line-height:1.6;
          animation:spUp 0.6s 0.4s both;
        }

        .sp-btns {
          display:flex; gap:16px; justify-content:center; flex-wrap:wrap;
          animation:spUp 0.6s 0.5s both; margin-bottom:3.5rem;
        }
        .sp-btn-primary {
          display:inline-flex; align-items:center; gap:10px;
          font-size:0.95rem; font-weight:600;
          padding:12px 32px; border-radius:48px;
          background:linear-gradient(135deg, var(--accent), #3a61e0);
          border:none;
          color:#fff; text-decoration:none;
          transition:all 0.2s ease;
          box-shadow:0 4px 20px rgba(88,130,255,0.35);
        }
        .sp-btn-primary:hover { transform:translateY(-2px); box-shadow:0 10px 28px rgba(88,130,255,0.5); background:linear-gradient(135deg, #6b96ff, #4a72f0); }
        .sp-btn-ghost {
          display:inline-flex; align-items:center;
          font-size:0.95rem; font-weight:500;
          padding:12px 32px; border-radius:48px;
          background:transparent;
          border:1px solid rgba(255,255,255,0.12);
          color:var(--muted); text-decoration:none;
          transition:all 0.2s ease;
        }
        .sp-btn-ghost:hover { background:rgba(255,255,255,0.04); color:var(--text); border-color:rgba(255,255,255,0.22); transform:translateY(-2px); }

        .sp-scroll-hint {
          display:flex; flex-direction:column; align-items:center; gap:8px;
          color:var(--faint); font-size:0.7rem; letter-spacing:0.12em; text-transform:uppercase;
          animation:spUp 0.6s 0.7s both;
        }
        .sp-scroll-bar {
          width:1.5px; height:42px;
          background:linear-gradient(to bottom, rgba(88,130,255,0.8), transparent);
          animation:scrollPulse 2.2s 1.2s ease-in-out infinite;
        }
        @keyframes scrollPulse { 0%,100%{opacity:0.4;transform:scaleY(1)} 50%{opacity:1;transform:scaleY(0.7)} }

        /* STATS */
        .sp-stats-wrap { padding:0 2rem; margin-top:-20px; }
        .sp-stats-row {
          max-width:880px; margin:0 auto;
          display:grid; grid-template-columns:repeat(4,1fr);
          background:var(--border); gap:1px;
          border:1px solid var(--border); border-radius:20px;
          overflow:hidden; transform:translateY(-24px);
          box-shadow:0 8px 30px rgba(0,0,0,0.2);
        }
        .sp-stat-card {
          background:var(--surface); padding:1.8rem 1.2rem;
          text-align:center; transition:background 0.25s;
          position:relative; overflow:hidden;
        }
        .sp-stat-card::after {
          content:''; position:absolute; bottom:0; left:15%; right:15%; height:1px;
          background:linear-gradient(90deg,transparent, rgba(88,130,255,0.5), transparent);
        }
        .sp-stat-card:hover { background:rgba(88,130,255,0.06); }
        .sp-stat-val {
          font-family:var(--fd); font-size:clamp(1.8rem, 3.2vw, 2.5rem);
          font-weight:800; letter-spacing:-0.03em; line-height:1;
          background:linear-gradient(135deg,#fff 0%,#b0c2ff 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          margin-bottom:0.6rem;
        }
        .sp-stat-lbl { font-size:0.8rem; color:var(--muted); font-weight:500; letter-spacing:0.01em; }

        /* SECTIONS */
        .sp-sec { padding:5rem 2rem; }
        .sp-how-sec  { background:rgba(17,19,24,0.4); backdrop-filter: blur(2px); }
        .sp-inner    { max-width:1100px; margin:0 auto; }

        .sp-eyebrow {
          font-size:0.7rem; font-weight:600; letter-spacing:0.15em;
          text-transform:uppercase; color:var(--accent); margin-bottom:0.8rem;
        }
        .sp-sec-title {
          font-family:var(--fd);
          font-size:clamp(1.8rem, 3.2vw, 2.4rem);
          font-weight:700; line-height:1.2; letter-spacing:-0.02em;
          margin-bottom:0.8rem;
        }
        .sp-sec-sub {
          font-size:0.95rem; font-weight:400; color:var(--muted);
          max-width:500px; margin-bottom:3rem; line-height:1.7;
        }

        /* FEATURE CARDS */
        .sp-feat-grid {
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(240px,1fr));
          gap:1px; background:var(--border);
          border:1px solid var(--border); border-radius:20px; overflow:hidden;
        }
        .sp-feat-card {
          background:var(--surface);
          padding:1.8rem;
          position:relative; overflow:hidden;
          cursor:default;
          opacity:0; transform:translateY(24px);
          transition:opacity 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.1), transform 0.5s ease, background 0.3s ease;
        }
        .sp-feat-card.sp-in { opacity:1; transform:translateY(0); }

        .sp-feat-shine {
          position:absolute; inset:0;
          background:radial-gradient(circle at var(--mx,50%) var(--my,0%), rgba(88,130,255,0.12) 0%, transparent 70%);
          opacity:0; transition:opacity 0.4s;
          pointer-events:none;
        }
        .sp-feat-border-glow {
          position:absolute; top:0; left:10%; right:10%; height:1px;
          background:linear-gradient(90deg,transparent, rgba(88,130,255,0.8), transparent);
          opacity:0; transition:opacity 0.3s;
        }

        .sp-feat-card:hover { background:rgba(88,130,255,0.05); }
        .sp-feat-card:hover .sp-feat-shine { opacity:1; }
        .sp-feat-card:hover .sp-feat-border-glow { opacity:1; }
        .sp-feat-card:hover .sp-feat-icon { transform:scale(1.08) translateY(-2px); }
        .sp-feat-card:hover .sp-feat-name { color:#fff; }

        .sp-feat-icon {
          font-size:1.5rem;
          width:48px; height:48px; border-radius:16px;
          background:rgba(88,130,255,0.12);
          border:1px solid rgba(88,130,255,0.2);
          display:flex; align-items:center; justify-content:center;
          margin-bottom:1rem;
          transition:transform 0.25s ease;
        }
        .sp-feat-name {
          font-family:var(--fd); font-size:0.95rem; font-weight:700;
          margin-bottom:0.5rem; color:var(--text);
          transition:color 0.2s;
        }
        .sp-feat-desc {
          font-size:0.8rem; color:var(--muted); line-height:1.6; font-weight:400;
        }

        /* HOW IT WORKS */
        .sp-how-grid {
          display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr));
          gap:1rem; margin-top:2.5rem;
          position:relative;
        }
        .sp-how-card {
          padding:1.6rem 1.2rem; text-align:center;
          background: rgba(17,19,24,0.6);
          border-radius: 20px;
          border: 1px solid var(--border);
          backdrop-filter: blur(4px);
          opacity:0; transform:translateY(20px);
          transition:opacity 0.5s ease, transform 0.5s ease, background 0.2s;
        }
        .sp-how-card:hover {
          background: rgba(88,130,255,0.08);
          border-color: var(--border-h);
        }
        .sp-how-card.sp-in { opacity:1; transform:translateY(0); }
        .sp-how-n {
          font-family:var(--fd); font-size:1.8rem; font-weight:800;
          background:linear-gradient(135deg,var(--accent),var(--accent2));
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          margin-bottom:0.8rem; line-height:1;
        }
        .sp-how-title {
          font-family:var(--fd); font-size:0.95rem; font-weight:700;
          margin-bottom:0.5rem; color:var(--text);
        }
        .sp-how-desc {
          font-size:0.8rem; color:var(--muted); line-height:1.6; font-weight:400;
        }

        /* CTA */
        .sp-cta-sec {
          padding:6rem 2rem; text-align:center;
          position:relative; overflow:hidden;
          border-top:1px solid var(--border);
          margin-top: 1rem;
        }
        .sp-cta-glow-a {
          position:absolute; top:-80px; left:50%; transform:translateX(-50%);
          width:700px; height:380px; border-radius:50%; filter:blur(110px);
          background:rgba(88,130,255,0.12); pointer-events:none;
        }
        .sp-cta-glow-b {
          position:absolute; bottom:-60px; right:0%;
          width:320px; height:320px; border-radius:50%; filter:blur(100px);
          background:rgba(32,230,208,0.07); pointer-events:none;
        }
        .sp-cta-body { position:relative; z-index:2; max-width:680px; margin:0 auto; }
        .sp-cta-title {
          font-family:var(--fd);
          font-size:clamp(1.8rem, 3.8vw, 3rem);
          font-weight:800; line-height:1.15; letter-spacing:-0.03em;
          margin:0.8rem 0 1.2rem;
        }
        .sp-cta-sub {
          font-size:1rem; font-weight:400; color:var(--muted);
          margin-bottom:2.5rem; line-height:1.7;
        }

        /* FOOTER */
        .sp-footer { padding:2rem 2rem 1.5rem; border-top:1px solid var(--border); margin-top: 2rem;}
        .sp-footer-in {
          max-width:1100px; margin:0 auto;
          display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:1rem;
        }
        .sp-footer-links { display:flex; gap:1.8rem; flex-wrap:wrap; }
        .sp-fl {
          font-size:0.8rem; color:var(--faint); text-decoration:none;
          transition:color 0.2s;
        }
        .sp-fl:hover { color:var(--accent); }
        .sp-footer-copy {
          font-size:0.75rem; color:var(--faint);
          width:100%; text-align:center;
          padding-top:1.2rem; border-top:1px solid rgba(255,255,255,0.04);
          margin-top: 0.5rem;
        }

        @keyframes spUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }

        /* RESPONSIVE */
        @media(max-width:860px) {
          .sp-stats-row { grid-template-columns:repeat(2,1fr); transform:translateY(-16px); }
          .sp-nav { padding:0 1.5rem; height: 60px; }
        }
        @media(max-width:768px) {
          .sp-hero { padding:7rem 1.25rem 5rem; }
          .sp-sec { padding:4rem 1.25rem; }
          .sp-cta-sec { padding:4rem 1.25rem; }
          .sp-footer-in { flex-direction:column; text-align:center; gap: 1.2rem;}
          .sp-footer-links { justify-content:center; }
          .sp-how-grid { gap: 0.75rem; }
        }
        @media(max-width:640px) {
          .sp-feat-grid { grid-template-columns:1fr 1fr; }
          .sp-btns { flex-direction:column; align-items:center; gap: 12px;}
          .sp-btn-primary, .sp-btn-ghost { width:220px; justify-content:center; }
          .sp-how-grid { grid-template-columns:1fr; gap: 1rem; }
          .sp-stats-row { grid-template-columns:1fr 1fr; }
        }
        @media(max-width:480px) {
          .sp-feat-grid { grid-template-columns:1fr; }
          .sp-stats-row { grid-template-columns:1fr; }
          .sp-nav-right { gap: 8px; }
          .sp-nav-ghost, .sp-nav-solid { padding: 6px 14px; font-size: 0.8rem; }
        }
      `}</style>
    </div>
  );
}
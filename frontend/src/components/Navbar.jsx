import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSub, setOpenSub] = useState(null);
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const navItems = [
    { name: "Notes", links: [{ label: "All Notes", path: "/notes" }, { label: "Create Note", path: "/notes/create" }] },
    { name: "Quizzes", links: [{ label: "My Quizzes", path: "/quizzes" }, { label: "Generate Quiz", path: "/quizzes/generate" }] },
    { name: "Classes", links: [{ label: "My Classes", path: "/classes" }, { label: "Join Class", path: "/classes/join" }] },
    { name: "Activities", links: [{ label: "My Activities", path: "/activities" }, { label: "Add Activity", path: "/activities/add" }] },
    { name: "Study Groups", path: "/study-groups" },
    { name: "Flashcards", path: "/flashcards" },
    { name: "AI Chat", path: "/chat" },
  ];

  const openSidebar = () => { setSidebarOpen(true); document.body.style.overflow = "hidden"; };
  const closeSidebar = () => { setSidebarOpen(false); setOpenSub(null); document.body.style.overflow = ""; };
  const goTo = (path) => { closeSidebar(); navigate(path); };

  useEffect(() => {
    const handleOutside = (e) => {
      if (sidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) closeSidebar();
    };
    const handleEsc = (e) => { if (e.key === "Escape") closeSidebar(); };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const ChevronIcon = () => (
    <svg width="9" height="9" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1,1 5,5 9,1" />
    </svg>
  );

  return (
    <>
      {sidebarOpen && <div className="sp-overlay" onClick={closeSidebar} />}

      <aside className={`sp-sidebar ${sidebarOpen ? "sp-sidebar--open" : ""}`} ref={sidebarRef}>
        <div className="sp-sb-head">
          <div className="sp-logo">
            <span className="sp-gem">&#9670;</span>
            <span className="sp-logo-text">StudyPulse</span>
          </div>
          <button className="sp-sb-close" onClick={closeSidebar}>&#10005;</button>
        </div>
        <div className="sp-sb-body">
          {navItems.map((item) =>
            item.links ? (
              <div key={item.name} className="sp-sb-item">
                <button
                  className={`sp-sb-btn ${openSub === item.name ? "sp-sb-btn--open" : ""}`}
                  onClick={() => setOpenSub(openSub === item.name ? null : item.name)}
                >
                  {item.name}
                  <span className={`sp-sb-chevron ${openSub === item.name ? "sp-sb-chevron--open" : ""}`}>
                    <ChevronIcon />
                  </span>
                </button>
                {openSub === item.name && (
                  <div className="sp-sb-sub">
                    {item.links.map((l) => (
                      <button key={l.path} className="sp-sb-subitem" onClick={() => goTo(l.path)}>{l.label}</button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div key={item.name} className="sp-sb-item">
                <button className="sp-sb-btn" onClick={() => goTo(item.path)}>{item.name}</button>
              </div>
            )
          )}
          <div className="sp-sb-divider" />
          <div className="sp-sb-user">
            <span className="sp-sb-uname">{user?.name || "Iraj"}</span>
            <button className="sp-sb-logout" onClick={() => { onLogout(); closeSidebar(); }}>Logout</button>
          </div>
        </div>
      </aside>

      <nav className="sp-nav">
        <div className="sp-nav-inner">
          <Link className="sp-brand" to="/dashboard">
            <span className="sp-gem">&#9670;</span>
            <span className="sp-brand-text">StudyPulse</span>
          </Link>

          <div className="sp-links">
            {navItems.map((item) =>
              item.links ? (
                <div key={item.name} className="sp-dd">
                  <button className="sp-navlink">
                    {item.name}
                    <span className="sp-chevron"><ChevronIcon /></span>
                  </button>
                  <div className="sp-dd-menu">
                    {item.links.map((l) => (
                      <button key={l.path} className="sp-dd-item" onClick={() => navigate(l.path)}>{l.label}</button>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={item.name} className="sp-navlink" to={item.path}>{item.name}</Link>
              )
            )}
          </div>

          <div className="sp-user">
            <span className="sp-uname">{user?.name || "Iraj"}</span>
            <button className="sp-logout" onClick={onLogout}>Logout</button>
          </div>

          <button className="sp-ham" onClick={openSidebar} aria-label="Open menu">
            <span /><span /><span />
          </button>
        </div>
      </nav>

      <style>{`
        .sp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
          background: rgba(8, 11, 20, 0.98);
          backdrop-filter: blur(16px);
          /* NO border-bottom — white line gone */
        }

        .sp-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px;
          height: 70px;
          display: flex; flex-direction: row;
          align-items: center; gap: 0;
        }

        .sp-brand {
          display: flex; flex-direction: row; align-items: center;
          gap: 10px; text-decoration: none;
          margin-right: 44px; flex-shrink: 0;
        }
        .sp-gem { color: #6378ff; font-size: 20px; }
        .sp-brand-text {
          font-size: 1.15rem; font-weight: 700;
          color: #eef1ff; letter-spacing: -0.02em;
          font-family: 'Syne', -apple-system, sans-serif;
        }

        .sp-links {
          display: flex; flex-direction: row;
          align-items: center; gap: 4px; flex: 1;
        }

        .sp-navlink {
          display: flex; flex-direction: row; align-items: center;
          gap: 6px; padding: 7px 15px; height: 38px;
          font-size: 0.88rem; font-weight: 500;
          color: #8fa0c0; background: none; border: none;
          cursor: pointer; border-radius: 8px; white-space: nowrap;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          text-decoration: none;
          transition: color 0.18s, background 0.18s;
        }
        .sp-navlink:hover { color: #fff; background: rgba(99, 120, 255, 0.12); }

        .sp-chevron {
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s; line-height: 0;
        }
        .sp-chevron svg { stroke: currentColor; }

        .sp-dd { position: relative; }
        .sp-dd:hover .sp-chevron { transform: rotate(180deg); }
        .sp-dd:hover > .sp-navlink { color: #fff; background: rgba(99, 120, 255, 0.12); }

        .sp-dd-menu {
          position: absolute; top: calc(100% + 10px); left: 0;
          background: #101424;
          border: 1px solid rgba(99, 120, 255, 0.2);
          border-radius: 12px; padding: 5px;
          min-width: 172px;
          opacity: 0; visibility: hidden; transform: translateY(-6px);
          transition: opacity 0.2s, transform 0.2s, visibility 0.2s;
          z-index: 999;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5);
        }
        .sp-dd:hover .sp-dd-menu {
          opacity: 1; visibility: visible; transform: translateY(0);
        }

        .sp-dd-item {
          display: block; width: 100%; padding: 9px 14px;
          font-size: 0.83rem; color: #8fa0c0;
          background: none; border: none; cursor: pointer;
          text-align: left; border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          transition: color 0.18s, background 0.18s; white-space: nowrap;
        }
        .sp-dd-item:hover { background: rgba(99, 120, 255, 0.15); color: #fff; }

        .sp-user {
          display: flex; flex-direction: row; align-items: center;
          gap: 14px; margin-left: auto; flex-shrink: 0;
        }
        .sp-uname { font-size: 0.88rem; font-weight: 500; color: #eef1ff; }
        .sp-logout {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.28);
          color: #f87171; padding: 7px 18px;
          border-radius: 20px; font-size: 0.82rem; font-weight: 500;
          cursor: pointer; transition: background 0.2s, color 0.2s, border-color 0.2s;
          font-family: inherit;
        }
        .sp-logout:hover { background: #ef4444; color: #fff; border-color: #ef4444; }

        .sp-ham {
          display: none; flex-direction: column;
          align-items: center; justify-content: center; gap: 5px;
          width: 38px; height: 38px; margin-left: auto;
          background: none; border: none; cursor: pointer;
        }
        .sp-ham span {
          display: block; width: 20px; height: 2px;
          background: #eef1ff; border-radius: 2px;
        }

        .sp-overlay {
          position: fixed; inset: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 1001;
        }

        .sp-sidebar {
          position: fixed; top: 0; right: -290px;
          width: 270px; height: 100vh;
          background: #0d1020;
          border-left: 1px solid rgba(99, 120, 255, 0.2);
          z-index: 1002; display: flex; flex-direction: column;
          transition: right 0.28s cubic-bezier(.4,0,.2,1);
          overflow-y: auto;
        }
        .sp-sidebar--open { right: 0; }

        .sp-sb-head {
          display: flex; flex-direction: row; align-items: center;
          justify-content: space-between;
          padding: 18px 18px 14px;
          border-bottom: 1px solid rgba(99, 120, 255, 0.12);
          flex-shrink: 0;
        }
        .sp-logo { display: flex; align-items: center; gap: 8px; }
        .sp-logo-text { font-size: 1rem; font-weight: 700; color: #eef1ff; }
        .sp-sb-close {
          background: none; border: none; color: #8fa0c0;
          font-size: 1.1rem; cursor: pointer; padding: 4px;
          border-radius: 6px; line-height: 1;
          transition: color 0.18s, background 0.18s;
        }
        .sp-sb-close:hover { color: #fff; background: rgba(99,120,255,.12); }

        .sp-sb-body { padding: 12px; display: flex; flex-direction: column; gap: 2px; flex: 1; }
        .sp-sb-item { width: 100%; }
        .sp-sb-btn {
          display: flex; flex-direction: row; align-items: center;
          justify-content: space-between; width: 100%;
          padding: 9px 12px; font-size: 0.88rem; font-weight: 500;
          color: #8fa0c0; background: none; border: none;
          cursor: pointer; border-radius: 8px; text-align: left;
          font-family: inherit; transition: color 0.18s, background 0.18s;
        }
        .sp-sb-btn:hover, .sp-sb-btn--open { color: #fff; background: rgba(99,120,255,.1); }

        .sp-sb-chevron { display: flex; align-items: center; transition: transform 0.2s; line-height: 0; }
        .sp-sb-chevron--open { transform: rotate(180deg); }
        .sp-sb-chevron svg { stroke: currentColor; }

        .sp-sb-sub {
          margin: 2px 0 4px 8px; padding-left: 12px;
          border-left: 1px solid rgba(99, 120, 255, 0.18);
        }
        .sp-sb-subitem {
          display: block; width: 100%; padding: 7px 12px;
          font-size: 0.8rem; color: #8fa0c0;
          background: none; border: none; cursor: pointer;
          text-align: left; border-radius: 6px; font-family: inherit;
          transition: color 0.18s, background 0.18s;
        }
        .sp-sb-subitem:hover { background: rgba(99,120,255,.1); color: #fff; }

        .sp-sb-divider { height: 1px; background: rgba(99,120,255,.12); margin: 8px 0; }
        .sp-sb-user { display: flex; flex-direction: column; gap: 8px; padding: 4px 0; }
        .sp-sb-uname { font-size: 0.85rem; color: #fff; font-weight: 500; text-align: center; padding: 2px; }
        .sp-sb-logout {
          background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.28);
          color: #f87171; padding: 9px; border-radius: 8px;
          font-size: 0.84rem; font-weight: 500; cursor: pointer;
          width: 100%; font-family: inherit; transition: background 0.2s, color 0.2s;
        }
        .sp-sb-logout:hover { background: #ef4444; color: #fff; }

        @media (min-width: 901px) {
          .sp-links { display: flex !important; }
          .sp-user { display: flex !important; }
          .sp-ham { display: none !important; }
        }
        @media (max-width: 900px) {
          .sp-links { display: none !important; }
          .sp-user { display: none !important; }
          .sp-ham { display: flex !important; }
          .sp-nav-inner { padding: 0 20px; height: 62px; }
        }
      `}</style>
    </>
  );
}
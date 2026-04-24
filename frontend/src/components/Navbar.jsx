import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";

export default function Navbar({ user, onLogout }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const navRef = useRef(null);

  // Close navbar function
  const closeNavbar = () => setExpanded(false);

  // Toggle navbar
  const toggleNavbar = () => setExpanded(!expanded);

  // Handle logout
  const handleLogout = () => {
    closeNavbar();
    onLogout();
  };

  // Close navbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on toggle button
      const toggleButton = document.querySelector('.navbar-toggler');
      if (toggleButton && toggleButton.contains(event.target)) {
        return;
      }
      
      if (expanded && navRef.current && !navRef.current.contains(event.target)) {
        closeNavbar();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded]);

  // Close navbar on ESC key
  useEffect(() => {
    const handleEsc = (event) => {
      if (expanded && event.key === 'Escape') {
        closeNavbar();
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [expanded]);

  // Prevent body scroll when navbar is open on mobile
  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [expanded]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar shadow sticky-top" ref={navRef}>
      <div className="container-fluid px-3 px-md-4">
        {/* Brand Logo */}
        <Link 
          className="navbar-brand fw-bold fs-4" 
          to="/dashboard"
          onClick={closeNavbar}
        >
          AI StudyPulse
        </Link>

        {/* Hamburger Toggle Button */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={toggleNavbar}
          aria-expanded={expanded}
          aria-label="Toggle navigation"
        >
          <span className={`navbar-toggler-icon ${expanded ? 'close' : ''}`}></span>
        </button>

        {/* Navbar Links - Collapsible */}
        <div className={`collapse navbar-collapse ${expanded ? "show" : ""}`}>
          <ul className="navbar-nav mx-auto gap-2 gap-lg-3">
            {/* Notes Dropdown */}
            <li className="nav-item dropdown">
              <span
                className="nav-link dropdown-toggle"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Notes
              </span>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/notes" onClick={closeNavbar}>All Notes</Link></li>
                <li><Link className="dropdown-item" to="/notes/create" onClick={closeNavbar}>Create Note</Link></li>
              </ul>
            </li>

            {/* Quizzes Dropdown */}
            <li className="nav-item dropdown">
              <span
                className="nav-link dropdown-toggle"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Quizzes
              </span>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/quizzes" onClick={closeNavbar}>My Quizzes</Link></li>
                <li><Link className="dropdown-item" to="/quizzes/generate" onClick={closeNavbar}>Generate Quiz</Link></li>
              </ul>
            </li>

            {/* Classes Dropdown */}
            <li className="nav-item dropdown">
              <span
                className="nav-link dropdown-toggle"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Classes
              </span>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/classes" onClick={closeNavbar}>My Classes</Link></li>
                <li><Link className="dropdown-item" to="/classes/join" onClick={closeNavbar}>Join Class</Link></li>
              </ul>
            </li>

            {/* Activities Dropdown */}
            <li className="nav-item dropdown">
              <span
                className="nav-link dropdown-toggle"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Activities
              </span>
              <ul className="dropdown-menu">
                <li><Link className="dropdown-item" to="/activities" onClick={closeNavbar}>My Activities</Link></li>
                <li><Link className="dropdown-item" to="/activities/add" onClick={closeNavbar}>Add Activity</Link></li>
              </ul>
            </li>

            {/* AI Assistant Link */}
            <li className="nav-item">
              <Link className="nav-link" to="/chat" onClick={closeNavbar}>
                AI Assistant
              </Link>
            </li>
          </ul>

          {/* User Section */}
          <div className="d-flex align-items-center gap-3 mt-2 mt-lg-0">
            <span className="text-white fw-semibold">{user?.name}</span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        /* Custom Navbar */
        .custom-navbar {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }

        /* Navbar Toggler Icon Animation */
        .navbar-toggler-icon {
          transition: transform 0.3s ease;
        }
        .navbar-toggler-icon.close {
          transform: rotate(90deg);
        }

        /* Mobile Responsive */
        @media (max-width: 991px) {
          .navbar-collapse {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 20px;
            z-index: 1050;
            overflow-y: auto;
            transition: all 0.3s ease;
          }
          
          .navbar-collapse.collapse:not(.show) {
            display: none !important;
          }
          
          .navbar-collapse.show {
            display: block !important;
          }
          
          .navbar-nav {
            gap: 8px !important;
          }
          
          .nav-item {
            width: 100%;
            text-align: center;
          }
          
          .nav-link, .nav-link.dropdown-toggle {
            display: block !important;
            width: 100%;
            text-align: center;
            padding: 12px;
            font-size: 1rem;
            color: white !important;
          }
          
          .dropdown-menu {
            position: static !important;
            transform: none !important;
            width: 100%;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            margin-top: 5px;
            border: none;
            text-align: center;
          }
          
          .dropdown-item {
            color: white !important;
            text-align: center;
            padding: 10px;
          }
          
          .dropdown-item:hover {
            background: rgba(255,255,255,0.2);
            color: white !important;
          }
          
          .d-flex.align-items-center {
            justify-content: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.2);
            flex-direction: column;
            gap: 12px !important;
          }
        }

        /* Tablet */
        @media (min-width: 768px) and (max-width: 991px) {
          .navbar-collapse {
            top: 72px;
          }
          .nav-link, .nav-link.dropdown-toggle {
            padding: 10px;
          }
        }

        /* Mobile Small */
        @media (max-width: 576px) {
          .navbar-brand {
            font-size: 1.2rem !important;
          }
          
          .container-fluid {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
          
          .navbar-collapse {
            top: 60px;
            padding: 16px;
          }
          
          .nav-link, .nav-link.dropdown-toggle {
            padding: 10px;
            font-size: 0.9rem;
          }
          
          .dropdown-item {
            padding: 8px;
            font-size: 0.85rem;
          }
        }

        /* Desktop */
        @media (min-width: 992px) {
          .navbar-nav {
            align-items: center;
          }
          
          .nav-link, .nav-link.dropdown-toggle {
            padding: 8px 16px;
            transition: all 0.3s;
          }
          
          .nav-link:hover, .nav-link.dropdown-toggle:hover {
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
          }
          
          .dropdown:hover .dropdown-menu {
            display: block;
            margin-top: 0;
          }
          
          .dropdown-menu {
            background: #1e293b;
            border: 1px solid rgba(255,255,255,0.1);
          }
          
          .dropdown-item {
            color: #e2e8f0;
            transition: all 0.2s;
          }
          
          .dropdown-item:hover {
            background: #4f46e5;
            color: white;
          }
        }
      `}</style>
    </nav>
  );
}
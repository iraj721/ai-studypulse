import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";

export default function Navbar({ user, onLogout }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const navRef = useRef(null);

  // Close navbar function
  const closeNavbar = () => setExpanded(false);

  // Handle logout
  const handleLogout = () => {
    closeNavbar();
    onLogout();
  };

  // Close navbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
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

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar shadow sticky-top" ref={navRef}>
      <div className="container-fluid px-4">
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
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links - Collapsible */}
        <div className={`collapse navbar-collapse ${expanded ? "show" : ""}`}>
          <ul className="navbar-nav mx-auto gap-3">
            {/* Notes Dropdown - USING LINK with data-bs-toggle */}
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle"
                to="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                onClick={(e) => {
                  // Don't navigate, just toggle dropdown
                  e.preventDefault();
                }}
              >
                Notes
              </Link>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="/notes" onClick={closeNavbar}>
                    All Notes
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/notes/create" onClick={closeNavbar}>
                    Create Note
                  </Link>
                </li>
              </ul>
            </li>

            {/* Quizzes Dropdown */}
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle"
                to="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                onClick={(e) => e.preventDefault()}
              >
                Quizzes
              </Link>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="/quizzes" onClick={closeNavbar}>
                    My Quizzes
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/quizzes/generate" onClick={closeNavbar}>
                    Generate Quiz
                  </Link>
                </li>
              </ul>
            </li>

            {/* Classes Dropdown */}
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle"
                to="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                onClick={(e) => e.preventDefault()}
              >
                Classes
              </Link>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="/classes" onClick={closeNavbar}>
                    My Classes
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/classes/join" onClick={closeNavbar}>
                    Join Class
                  </Link>
                </li>
              </ul>
            </li>

            {/* Activities Dropdown */}
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle"
                to="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                onClick={(e) => e.preventDefault()}
              >
                Activities
              </Link>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="/activities" onClick={closeNavbar}>
                    My Activities
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/activities/add" onClick={closeNavbar}>
                    Add Activity
                  </Link>
                </li>
              </ul>
            </li>

            {/* AI Assistant Link - No dropdown */}
            <li className="nav-item">
              <Link className="nav-link" to="/chat" onClick={closeNavbar}>
                AI Assistant
              </Link>
            </li>
          </ul>

          {/* User Section */}
          <div className="d-flex align-items-center gap-3">
            <span className="text-white fw-semibold">{user?.name}</span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 991px) {
          .navbar-collapse {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background: #0a0e27;
            padding: 20px;
            border-radius: 0 0 20px 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 1000;
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
          }
          
          .nav-link.dropdown-toggle {
            display: block;
            width: 100%;
            text-align: center;
            padding: 10px;
          }
          
          .dropdown-menu {
            position: static !important;
            transform: none !important;
            width: 100%;
            background: rgba(255,255,255,0.15);
            backdrop-filter: blur(10px);
            margin-top: 5px;
            border: none;
          }
          
          .dropdown-item {
            color: white;
            text-align: center;
            padding: 8px 16px;
          }
          
          .dropdown-item:hover {
            background: rgba(255,255,255,0.2);
            color: white;
          }
          
          .d-flex.align-items-center {
            justify-content: center;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px solid rgba(255,255,255,0.2);
          }
        }
        
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
          
          .nav-link.dropdown-toggle {
            font-size: 0.95rem;
            padding: 8px;
          }
        }
        
        /* Desktop dropdown hover effect */
        @media (min-width: 992px) {
          .dropdown:hover .dropdown-menu {
            display: block;
            margin-top: 0;
          }
        }
      `}</style>
    </nav>
  );
}
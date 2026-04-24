import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./navbar.css";

export default function Navbar({ user, onLogout }) {
  const [expanded, setExpanded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();
  const navRef = useRef(null);

  // Close navbar function
  const closeNavbar = () => {
    setExpanded(false);
    setOpenDropdown(null);
  };

  // Toggle navbar
  const toggleNavbar = () => setExpanded(!expanded);

  // Handle navigation and close
  const handleNavigate = (path) => {
    closeNavbar();
    navigate(path);
  };

  // Handle logout
  const handleLogout = () => {
    closeNavbar();
    onLogout();
  };

  // Toggle dropdown on mobile
  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // Close navbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
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

  const navItems = [
    { name: 'Notes', path: null, links: [
      { label: 'All Notes', path: '/notes' },
      { label: 'Create Note', path: '/notes/create' }
    ]},
    { name: 'Quizzes', path: null, links: [
      { label: 'My Quizzes', path: '/quizzes' },
      { label: 'Generate Quiz', path: '/quizzes/generate' }
    ]},
    { name: 'Classes', path: null, links: [
      { label: 'My Classes', path: '/classes' },
      { label: 'Join Class', path: '/classes/join' }
    ]},
    { name: 'Activities', path: null, links: [
      { label: 'My Activities', path: '/activities' },
      { label: 'Add Activity', path: '/activities/add' }
    ]},
    { name: 'AI Assistant', path: '/chat', links: null }
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar shadow sticky-top" ref={navRef}>
      <div className="container-fluid px-3 px-md-4">
        {/* Brand Logo */}
        <Link className="navbar-brand fw-bold fs-4" to="/dashboard" onClick={closeNavbar}>
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
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className={`navbar-collapse ${expanded ? "show" : ""}`}>
          <ul className="navbar-nav mx-auto gap-2 gap-lg-3">
            {navItems.map((item) => (
              <li key={item.name} className={`nav-item ${item.links ? 'dropdown' : ''}`}>
                {item.links ? (
                  <>
                    {/* Dropdown Toggle */}
                    <button
                      className="nav-link dropdown-toggle-custom"
                      onClick={() => toggleDropdown(item.name)}
                      aria-expanded={openDropdown === item.name}
                    >
                      {item.name}
                    </button>
                    {/* Dropdown Menu */}
                    <div className={`dropdown-menu-custom ${openDropdown === item.name ? 'show' : ''}`}>
                      {item.links.map((link) => (
                        <button
                          key={link.path}
                          className="dropdown-item-custom"
                          onClick={() => handleNavigate(link.path)}
                        >
                          {link.label}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link className="nav-link" to={item.path} onClick={closeNavbar}>
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* User Section */}
          <div className="user-section">
            <span className="user-name">{user?.name}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .custom-navbar {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }

        .navbar-brand {
          color: white !important;
        }

        .navbar-toggler {
          outline: none;
          box-shadow: none;
        }

        .navbar-toggler-icon {
          filter: invert(1);
        }

        /* Desktop Styles */
        @media (min-width: 992px) {
          .navbar-collapse {
            display: flex !important;
          }
          
          .nav-link, .dropdown-toggle-custom {
            color: white !important;
            padding: 8px 16px;
            border-radius: 8px;
            transition: all 0.3s;
            background: none;
            border: none;
            font-size: 1rem;
          }
          
          .nav-link:hover, .dropdown-toggle-custom:hover {
            background: rgba(255,255,255,0.1);
          }
          
          .dropdown-toggle-custom {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          .dropdown-toggle-custom::after {
            content: "▼";
            font-size: 10px;
            transition: transform 0.3s;
          }
          
          .dropdown-toggle-custom[aria-expanded="true"]::after {
            transform: rotate(180deg);
          }
          
          .dropdown-menu-custom {
            position: absolute;
            background: #1e293b;
            border-radius: 12px;
            padding: 8px;
            min-width: 180px;
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.3s;
            border: 1px solid rgba(255,255,255,0.1);
          }
          
          .dropdown:hover .dropdown-menu-custom {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
          }
          
          .dropdown-menu-custom.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
          }
          
          .dropdown-item-custom {
            display: block;
            width: 100%;
            padding: 10px 16px;
            color: #e2e8f0;
            background: none;
            border: none;
            text-align: left;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .dropdown-item-custom:hover {
            background: #4f46e5;
            color: white;
          }
          
          .user-section {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          
          .user-name {
            color: white;
            font-weight: 500;
          }
          
          .logout-btn {
            background: rgba(239,68,68,0.2);
            border: none;
            color: #ef4444;
            padding: 6px 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }
          
          .logout-btn:hover {
            background: #ef4444;
            color: white;
          }
        }

        /* Mobile Styles */
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
            transform: translateX(100%);
            transition: transform 0.3s ease;
          }
          
          .navbar-collapse.show {
            transform: translateX(0);
          }
          
          .navbar-nav {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .nav-item {
            width: 100%;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }
          
          .nav-link, .dropdown-toggle-custom {
            display: block;
            width: 100%;
            padding: 14px 16px;
            color: white !important;
            background: none;
            border: none;
            text-align: left;
            font-size: 1rem;
            cursor: pointer;
          }
          
          .dropdown-toggle-custom {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .dropdown-toggle-custom::after {
            content: "▼";
            font-size: 12px;
            transition: transform 0.3s;
          }
          
          .dropdown-toggle-custom[aria-expanded="true"]::after {
            transform: rotate(180deg);
          }
          
          .dropdown-menu-custom {
            display: none;
            background: rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 8px;
            margin: 0 16px 8px 16px;
          }
          
          .dropdown-menu-custom.show {
            display: block;
          }
          
          .dropdown-item-custom {
            display: block;
            width: 100%;
            padding: 12px 16px;
            color: white;
            background: none;
            border: none;
            text-align: left;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
          }
          
          .dropdown-item-custom:active {
            background: #4f46e5;
          }
          
          .user-section {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.2);
          }
          
          .user-name {
            color: white;
            font-weight: 500;
            text-align: center;
            font-size: 1rem;
          }
          
          .logout-btn {
            background: rgba(239,68,68,0.2);
            border: none;
            color: #ef4444;
            padding: 12px;
            border-radius: 10px;
            cursor: pointer;
            width: 100%;
            font-size: 1rem;
          }
          
          .logout-btn:active {
            background: #ef4444;
            color: white;
          }
        }

        /* Mobile Small */
        @media (max-width: 576px) {
          .navbar-brand {
            font-size: 1.1rem !important;
          }
          
          .container-fluid {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }
          
          .navbar-collapse {
            top: 60px;
            padding: 16px;
          }
          
          .nav-link, .dropdown-toggle-custom {
            padding: 12px 14px;
            font-size: 0.9rem;
          }
          
          .dropdown-item-custom {
            padding: 10px 14px;
            font-size: 0.85rem;
          }
        }

        /* Tablet */
        @media (min-width: 768px) and (max-width: 991px) {
          .navbar-collapse {
            top: 72px;
          }
        }
      `}</style>
    </nav>
  );
}
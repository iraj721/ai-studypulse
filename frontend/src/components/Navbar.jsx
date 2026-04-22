import React from "react";
import { Link } from "react-router-dom";
import "./navbar.css";

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar shadow sticky-top">
      <div className="container-fluid px-4">
        <Link className="navbar-brand fw-bold fs-4" to="/dashboard">
          AI StudyPulse
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav mx-auto gap-3">
            {/* Notes Dropdown */}
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle"
                to="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                Notes
              </Link>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="/notes">
                    All Notes
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/notes/create">
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
              >
                Quizzes
              </Link>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="/quizzes">
                    My Quizzes
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/quizzes/generate">
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
              >
                Classes
              </Link>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="/classes">
                    My Classes
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/classes/join">
                    Join Class
                  </Link>
                </li>
              </ul>
            </li>

            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle"
                to="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                Activities
              </Link>
              <ul className="dropdown-menu">
                <li>
                  <Link className="dropdown-item" to="/activities">
                    My Actvities
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/activities/add">
                    Add Activity
                  </Link>
                </li>
              </ul>
            </li>

            {/* Other Links */}
            <li className="nav-item">
              <Link className="nav-link" to="/chat">
                AI Assistant
              </Link>
            </li>
          </ul>

          {/* User Section */}
          <div className="d-flex align-items-center gap-3">
            <span className="text-white fw-semibold">{user?.name}</span>
            <button className="btn btn-outline-light btn-sm" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

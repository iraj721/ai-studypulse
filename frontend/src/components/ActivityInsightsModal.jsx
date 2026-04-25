import React from "react";
import ReactMarkdown from "react-markdown";
import { FaRobot, FaLightbulb, FaChartLine, FaSpinner, FaTimes } from "react-icons/fa";

export default function ActivityInsightsModal({ show, onClose, activity }) {
  if (!activity) return null;

  const getDifficultyConfig = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return { color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", label: "Easy", icon: "🟢" };
      case "medium":
        return { color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", label: "Medium", icon: "🟡" };
      case "hard":
        return { color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", label: "Hard", icon: "🔴" };
      default:
        return { color: "#8e9cc4", bg: "rgba(142, 156, 196, 0.15)", label: "Unknown", icon: "⚪" };
    }
  };

  const difficultyConfig = getDifficultyConfig(activity.difficulty);

  if (!show) return null;

  return (
    <>
      <div className="aim-overlay" onClick={onClose}>
        <div className="aim-modal" onClick={(e) => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="aim-header">
            <div className="aim-header-content">
              <div className="aim-icon-wrapper">
                <FaRobot className="aim-header-icon" />
              </div>
              <div className="aim-header-text">
                <h3 className="aim-title">AI Insights</h3>
                <div className="aim-subtitle">
                  <span className="aim-subject">{activity.subject}</span>
                  <span className="aim-separator">•</span>
                  <span className="aim-topic">{activity.topic}</span>
                </div>
              </div>
            </div>
            <button className="aim-close-btn" onClick={onClose}>
              <FaTimes />
            </button>
          </div>

          {/* Difficulty Badge */}
          <div className="aim-difficulty-section">
            <div className="aim-difficulty-badge" style={{ background: difficultyConfig.bg }}>
              <span className="aim-difficulty-icon">{difficultyConfig.icon}</span>
              <span className="aim-difficulty-label" style={{ color: difficultyConfig.color }}>
                {difficultyConfig.label} Difficulty
              </span>
            </div>
            <div className="aim-meta-info">
              <span className="aim-meta-item">
                <span className="aim-meta-icon">⏱️</span>
                {activity.durationMinutes} minutes
              </span>
              <span className="aim-meta-item">
                <span className="aim-meta-icon">📅</span>
                {new Date(activity.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Modal Body - Insights */}
          <div className="aim-body">
            {activity.insights && activity.insights.length > 0 ? (
              <div className="aim-insights-container">
                <div className="aim-insights-header">
                  <FaLightbulb className="aim-insights-icon" />
                  <span>Key Insights</span>
                </div>
                <div className="aim-insights-list">
                  {activity.insights.map((insight, idx) => (
                    <div key={idx} className="aim-insight-card">
                      <div className="aim-insight-number">{idx + 1}</div>
                      <div className="aim-insight-content">
                        <ReactMarkdown>{insight}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="aim-empty-state">
                <div className="aim-empty-icon">📭</div>
                <p className="aim-empty-text">No insights available for this activity yet.</p>
                <p className="aim-empty-subtext">Complete more activities to get AI-powered insights!</p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="aim-footer">
            <button className="aim-footer-btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        /* Overlay */
        .aim-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: aimFadeIn 0.2s ease-out;
        }

        /* Modal Container */
        .aim-modal {
          background: var(--s1, #111318);
          border: 1px solid rgba(88, 130, 255, 0.2);
          border-radius: 24px;
          width: 100%;
          max-width: 700px;
          max-height: 85vh;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: aimSlideUp 0.3s ease-out;
        }

        /* Header */
        .aim-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 1.5rem 1rem 1.5rem;
          background: linear-gradient(135deg, rgba(88, 130, 255, 0.1), rgba(32, 230, 208, 0.05));
          border-bottom: 1px solid rgba(88, 130, 255, 0.1);
        }

        .aim-header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .aim-icon-wrapper {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #5882ff, #20e6d0);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .aim-header-icon {
          font-size: 24px;
          color: white;
        }

        .aim-header-text {
          flex: 1;
        }

        .aim-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--tx, #edf2ff);
          margin: 0 0 4px 0;
          font-family: 'Syne', sans-serif;
        }

        .aim-subtitle {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
        }

        .aim-subject {
          color: #5882ff;
          font-weight: 600;
        }

        .aim-separator {
          color: var(--fa, #49587a);
        }

        .aim-topic {
          color: var(--mu, #8e9cc4);
        }

        .aim-close-btn {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--mu, #8e9cc4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .aim-close-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--tx, #edf2ff);
          transform: rotate(90deg);
        }

        /* Difficulty Section */
        .aim-difficulty-section {
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          border-bottom: 1px solid rgba(88, 130, 255, 0.1);
          background: rgba(0, 0, 0, 0.2);
        }

        .aim-difficulty-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .aim-difficulty-icon {
          font-size: 14px;
        }

        .aim-difficulty-label {
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .aim-meta-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .aim-meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: var(--fa, #49587a);
        }

        .aim-meta-icon {
          font-size: 12px;
        }

        /* Body */
        .aim-body {
          padding: 1.5rem;
          max-height: calc(85vh - 200px);
          overflow-y: auto;
        }

        /* Insights Container */
        .aim-insights-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid rgba(88, 130, 255, 0.2);
        }

        .aim-insights-icon {
          font-size: 20px;
          color: #f59e0b;
        }

        .aim-insights-header span {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--mu, #8e9cc4);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .aim-insights-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .aim-insight-card {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: rgba(88, 130, 255, 0.04);
          border: 1px solid rgba(88, 130, 255, 0.1);
          border-radius: 16px;
          transition: all 0.2s;
        }

        .aim-insight-card:hover {
          border-color: rgba(88, 130, 255, 0.3);
          background: rgba(88, 130, 255, 0.06);
          transform: translateX(4px);
        }

        .aim-insight-number {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #5882ff, #20e6d0);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }

        .aim-insight-content {
          flex: 1;
          font-size: 0.875rem;
          line-height: 1.6;
          color: var(--mu, #8e9cc4);
        }

        .aim-insight-content p {
          margin: 0;
        }

        .aim-insight-content strong {
          color: var(--tx, #edf2ff);
        }

        /* Empty State */
        .aim-empty-state {
          text-align: center;
          padding: 3rem 1rem;
        }

        .aim-empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .aim-empty-text {
          font-size: 1rem;
          font-weight: 500;
          color: var(--mu, #8e9cc4);
          margin-bottom: 0.5rem;
        }

        .aim-empty-subtext {
          font-size: 0.8125rem;
          color: var(--fa, #49587a);
        }

        /* Footer */
        .aim-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid rgba(88, 130, 255, 0.1);
          display: flex;
          justify-content: flex-end;
        }

        .aim-footer-btn {
          padding: 8px 20px;
          background: transparent;
          border: 1px solid rgba(88, 130, 255, 0.3);
          border-radius: 30px;
          color: var(--mu, #8e9cc4);
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .aim-footer-btn:hover {
          background: rgba(88, 130, 255, 0.1);
          border-color: #5882ff;
          color: var(--tx, #edf2ff);
        }

        /* Scrollbar Styling */
        .aim-body::-webkit-scrollbar {
          width: 6px;
        }

        .aim-body::-webkit-scrollbar-track {
          background: rgba(88, 130, 255, 0.05);
          border-radius: 10px;
        }

        .aim-body::-webkit-scrollbar-thumb {
          background: rgba(88, 130, 255, 0.3);
          border-radius: 10px;
        }

        .aim-body::-webkit-scrollbar-thumb:hover {
          background: rgba(88, 130, 255, 0.5);
        }

        /* Animations */
        @keyframes aimFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes aimSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .aim-modal {
            max-width: 95%;
            margin: 1rem;
          }

          .aim-header {
            padding: 1rem;
          }

          .aim-icon-wrapper {
            width: 40px;
            height: 40px;
          }

          .aim-header-icon {
            font-size: 20px;
          }

          .aim-title {
            font-size: 1rem;
          }

          .aim-subtitle {
            font-size: 0.75rem;
          }

          .aim-difficulty-section {
            flex-direction: column;
            align-items: flex-start;
            padding: 0.875rem 1rem;
          }

          .aim-body {
            padding: 1rem;
          }

          .aim-insight-card {
            padding: 0.75rem;
          }

          .aim-insight-number {
            width: 24px;
            height: 24px;
            font-size: 0.7rem;
          }

          .aim-insight-content {
            font-size: 0.8125rem;
          }
        }

        @media (max-width: 480px) {
          .aim-header-content {
            gap: 0.75rem;
          }

          .aim-meta-info {
            flex-wrap: wrap;
            gap: 0.5rem;
          }
        }
      `}</style>
    </>
  );
}
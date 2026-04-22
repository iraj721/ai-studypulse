import React from "react";
import { Modal, Button, Badge } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import { FaRobot } from "react-icons/fa";

export default function ActivityInsightsModal({ show, onClose, activity }) {
  if (!activity) return null;

  const difficultyColor = (diff) => {
    switch (diff) {
      case "easy": return "success";
      case "medium": return "warning";
      case "hard": return "danger";
      default: return "secondary";
    }
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      size="lg"
      backdrop="static"
      keyboard={true}
      dialogClassName="activity-insights-modal"
    >
      <Modal.Header closeButton style={{
        background: "linear-gradient(90deg, #007bff 0%, #00c6ff 100%)",
        color: "#fff",
        borderBottom: "none"
      }}>
        <Modal.Title style={{ fontWeight: 700, fontSize: "1.3rem" }}>
          <FaRobot style={{ marginRight: "0.5rem" }} />
          AI Insights - <span style={{ color: "#fff" }}>{activity.subject}</span> / <span style={{ color: "#ffe" }}>{activity.topic}</span>{" "}
          <Badge bg={difficultyColor(activity.difficulty)} className="ms-2 text-uppercase">{activity.difficulty}</Badge>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{
        maxHeight: "450px",
        overflowY: "auto",
        padding: "1.5rem",
        background: "#fefefe",
        borderRadius: "0 0 0.5rem 0.5rem",
        animation: "fadeIn 0.3s ease-in-out"
      }}>
        {activity.insights && activity.insights.length ? (
          <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
            {activity.insights.map((insight, idx) => (
              <li key={idx} style={{
                marginBottom: "1rem",
                fontSize: "1rem",
                lineHeight: 1.6,
                padding: "0.6rem 1rem",
                borderRadius: "0.5rem",
                transition: "all 0.25s",
                cursor: "default",
                background: "#f8f9fa",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                display: "flex",
                alignItems: "flex-start",
                gap: "0.5rem"
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.12)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.06)"}
              >
                <FaRobot style={{ color: "#007bff", marginTop: "0.2rem" }} />
                <ReactMarkdown>{insight}</ReactMarkdown>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ fontStyle: "italic", color: "#6c757d" }}>No insights available for this activity.</p>
        )}
      </Modal.Body>

      <Modal.Footer style={{ borderTop: "1px solid #dee2e6" }}>
        <Button variant="secondary" onClick={onClose}>Close</Button>
      </Modal.Footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Modal>
  );
}

import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

export default function Toast({ message, type = "success", onClose }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!message) return;
    
    const exitTimer = setTimeout(() => {
      setExiting(true);
    }, 3500);
    
    const closeTimer = setTimeout(() => {
      onClose();
    }, 4000);
    
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [message, onClose]);

  if (!message) return null;

  const config = {
    success: {
      icon: <FaCheckCircle />,
      bgColor: "linear-gradient(135deg, #10b981, #059669)",
      title: "Success!",
    },
    error: {
      icon: <FaExclamationCircle />,
      bgColor: "linear-gradient(135deg, #ef4444, #dc2626)",
      title: "Error!",
    },
    warning: {
      icon: <FaInfoCircle />,
      bgColor: "linear-gradient(135deg, #f59e0b, #d97706)",
      title: "Warning!",
    },
    info: {
      icon: <FaInfoCircle />,
      bgColor: "linear-gradient(135deg, #3b82f6, #2563eb)",
      title: "Info",
    },
  };

  const current = config[type] || config.success;

  return (
    <div className={`toast-notification ${exiting ? "exit" : ""}`}>
      <div className="toast-content" style={{ background: current.bgColor }}>
        <div className="toast-icon">{current.icon}</div>
        <div className="toast-message">
          <h4>{current.title}</h4>
          <p>{message}</p>
        </div>
        <button className="toast-close" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
    </div>
  );
}
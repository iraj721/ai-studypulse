import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

export default function BackButton({ to, label = "Back to Dashboard" }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="back-button"
      aria-label={label}
    >
      <FaArrowLeft className="back-icon" />
      <span>{label}</span>
    </button>
  );
}

// Add this style to your global CSS or component
export const backButtonStyles = `
  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
  }

  .back-button:hover {
    transform: translateX(-5px);
    background: linear-gradient(135deg, #5b4be8, #7b66f3);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
  }

  .back-icon {
    font-size: 1rem;
    transition: transform 0.3s ease;
  }

  .back-button:hover .back-icon {
    transform: translateX(-3px);
  }

  @media (max-width: 768px) {
    .back-button {
      padding: 8px 16px;
      font-size: 0.8rem;
      margin-bottom: 16px;
    }
  }
`;
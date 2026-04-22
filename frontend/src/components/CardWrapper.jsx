import React from "react";

export default function CardWrapper({ children, style = {}, className = "", ...props }) {
  const baseStyle = {
    borderRadius: "12px",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    ...style,
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = "translateY(-4px)";
    e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.12)";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.08)";
  };

  return (
    <div
      className={className}
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
}

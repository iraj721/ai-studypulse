import React, { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  const bgColor = type === "success" ? "#198754" : "#dc3545";

  return (
    <div
      className="position-fixed top-0 end-0 m-4 p-3 rounded shadow"
      style={{ backgroundColor: bgColor, color: "#fff", zIndex: 9999 }}
    >
      {message}
    </div>
  );
}

// src/components/Stars.jsx
import React from "react";

export default function Stars({ count = 180 }) {
  // generate stars
  const stars = Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    duration: 7 + Math.random() * 6,
    size: 1.5 + Math.random() * 2,
    delay: Math.random() * 5,
    color: ["#ffffff", "#fff9c4", "#cce0ff"][Math.floor(Math.random() * 3)],
  }));

  return (
    <>
      <div className="hero-stars">
        {stars.map((star, idx) => (
          <span
            key={idx}
            className="star"
            style={{
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDuration: `${star.duration}s`,
              animationDelay: `${star.delay}s`,
              backgroundColor: star.color,
            }}
          />
        ))}
      </div>

      {/* CSS for stars */}
      <style>{`
        .hero-stars {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none; 
          z-index: 1;
        }

        .hero-stars .star {
          position: absolute;
          top: -5px;
          border-radius: 50%;
          opacity: 0.8;
          box-shadow: 0 0 2px rgba(255,255,255,0.9);
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes fall {
          0% { transform: translateY(0); opacity: 0.7; }
          50% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0.2; }
        }
      `}</style>
    </>
  );
}

import { useState } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
}

export function GlitchText({ text, className = "" }: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  return (
    <span
      className={`glitch-text ${isGlitching ? "glitching" : ""} ${className}`}
      data-text={text}
      onMouseEnter={() => setIsGlitching(true)}
      onMouseLeave={() => setIsGlitching(false)}
    >
      {text}
      <style>{`
        .glitch-text {
          position: relative;
          display: inline-block;
          color: #00ff9d;
          text-shadow: 0 0 8px #00ff9d;
          cursor: default;
        }
        .glitch-text.glitching::before,
        .glitch-text.glitching::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        .glitch-text.glitching::before {
          color: #ff3b3b;
          text-shadow: -2px 0 #ff3b3b;
          animation: glitch-before 0.3s infinite linear;
          clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
        }
        .glitch-text.glitching::after {
          color: #00ffff;
          text-shadow: 2px 0 #00ffff;
          animation: glitch-after 0.3s infinite linear;
          clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
        }
        @keyframes glitch-before {
          0%   { transform: translate(-2px, 0); }
          25%  { transform: translate(2px, 0); }
          50%  { transform: translate(-1px, 1px); }
          75%  { transform: translate(1px, -1px); }
          100% { transform: translate(-2px, 0); }
        }
        @keyframes glitch-after {
          0%   { transform: translate(2px, 0); }
          25%  { transform: translate(-2px, 0); }
          50%  { transform: translate(1px, -1px); }
          75%  { transform: translate(-1px, 1px); }
          100% { transform: translate(2px, 0); }
        }
      `}</style>
    </span>
  );
}

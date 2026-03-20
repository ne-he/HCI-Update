import { useEffect, useRef } from "react";

interface MatrixProgressProps {
  /** Duration in ms, default 5000 */
  duration?: number;
  progress: number;
}

const CHARS = "01>$#@!%&ABCDEFabcdef";

export function MatrixProgress({ duration = 5000, progress }: MatrixProgressProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const cols = Math.floor(W / 14);
    const drops: number[] = Array(cols).fill(0).map(() => Math.random() * -H);

    const draw = () => {
      ctx.fillStyle = "rgba(10, 15, 15, 0.15)";
      ctx.fillRect(0, 0, W, H);

      ctx.font = "12px monospace";

      for (let i = 0; i < cols; i++) {
        // Only draw within the progress-filled area
        const colX = i * 14;
        const fillWidth = (progress / 100) * W;
        if (colX > fillWidth) continue;

        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const y = drops[i];

        // Head char — bright
        ctx.fillStyle = "#00ffff";
        ctx.fillText(char, colX, y);

        // Trail chars — dimmer green
        ctx.fillStyle = "#00ff9d";
        for (let t = 1; t <= 4; t++) {
          const trailChar = CHARS[Math.floor(Math.random() * CHARS.length)];
          ctx.globalAlpha = 1 - t * 0.2;
          ctx.fillText(trailChar, colX, y - t * 14);
        }
        ctx.globalAlpha = 1;

        drops[i] += 14;
        if (drops[i] > H) drops[i] = 0;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [progress]);

  return (
    <div className="relative w-full rounded overflow-hidden" style={{ height: 56 }}>
      {/* Background track */}
      <div
        className="absolute inset-0 rounded"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,255,157,0.2)" }}
      />
      {/* Matrix canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full rounded" />
      {/* Progress label */}
      <div className="absolute inset-0 flex items-center justify-between px-4 z-10">
        <span style={{ color: "#00ff9d", fontFamily: "monospace", fontSize: 13, textShadow: "0 0 6px #00ff9d" }}>
          ANALYZING...
        </span>
        <span style={{ color: "#00ffff", fontFamily: "monospace", fontSize: 13, textShadow: "0 0 6px #00ffff" }}>
          {progress}%
        </span>
      </div>
    </div>
  );
}

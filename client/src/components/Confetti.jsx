import { useEffect, useRef } from "react";

const COLORS = [
  "#e0663f", "#f2c94c", "#4ade80", "#60a5fa",
  "#c084fc", "#fb7185", "#facc15", "#34d399",
  "#f97316", "#a78bfa", "#e879f9", "#38bdf8",
];

function makeParticle(x, y, angleMin, angleMax) {
  const angle = angleMin + Math.random() * (angleMax - angleMin);
  const rad = (angle * Math.PI) / 180;
  const speed = 10 + Math.random() * 14;
  return {
    x,
    y,
    vx: Math.cos(rad) * speed,
    vy: Math.sin(rad) * speed,
    w: 7 + Math.random() * 9,
    h: 4 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 12,
    gravity: 0.32 + Math.random() * 0.18,
    drag: 0.988,
    opacity: 1,
    isCircle: Math.random() > 0.6,
  };
}

/**
 * Canvas-based party popper confetti.
 * Particles burst from the bottom-left and bottom-right corners
 * (simulating two party poppers) when `active` becomes true.
 */
export default function Confetti({ active }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ animId: null, running: false });

  useEffect(() => {
    if (!active) return;
    const s = stateRef.current;
    if (s.running) return;
    s.running = true;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = (canvas.width = window.innerWidth);
    const H = (canvas.height = window.innerHeight);
    const ctx = canvas.getContext("2d");

    const COUNT = 90;
    const particles = [
      // Left popper: shoots up and to the right (angles -130° to -50°)
      ...Array.from({ length: COUNT }, () =>
        makeParticle(W * 0.06, H, -130, -50)
      ),
      // Right popper: shoots up and to the left (angles -130° to -50° mirrored)
      ...Array.from({ length: COUNT }, () =>
        makeParticle(W * 0.94, H, -130, -50)
      ),
      // A few from center-top for extra flair
      ...Array.from({ length: 30 }, () =>
        makeParticle(
          W * 0.25 + Math.random() * W * 0.5,
          -10,
          60,
          120
        )
      ),
    ];

    const started = Date.now();

    function draw() {
      ctx.clearRect(0, 0, W, H);
      let anyAlive = false;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.rotation += p.rotSpeed;

        // Fade out in the lower portion of the screen
        if (p.y > H * 0.65) p.opacity = Math.max(0, p.opacity - 0.022);
        if (p.y > H + 30) p.opacity = 0;

        if (p.opacity > 0.01) {
          anyAlive = true;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          if (p.isCircle) {
            ctx.beginPath();
            ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          }
          ctx.restore();
        }
      }

      if (anyAlive && Date.now() - started < 7000) {
        s.animId = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, W, H);
        s.running = false;
      }
    }

    s.animId = requestAnimationFrame(draw);

    return () => {
      if (s.animId) cancelAnimationFrame(s.animId);
      ctx.clearRect(0, 0, W, H);
      s.running = false;
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9999 }}
      aria-hidden="true"
    />
  );
}

import { useEffect, useState } from "react";
import { RotateCcw, Repeat } from "lucide-react";
import Confetti from "./Confetti.jsx";

/* ─── SVG Score Donut Ring ─────────────────────────────────────────────── */
function ScoreRing({ percent, isHigh }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const [dash, setDash] = useState(circ);

  useEffect(() => {
    const t = setTimeout(() => {
      setDash(circ - (percent / 100) * circ);
    }, 250);
    return () => clearTimeout(t);
  }, [circ, percent]);

  const strokeColor =
    percent === 100
      ? "#4ade80"
      : percent >= 70
      ? "#e0663f"
      : percent >= 50
      ? "#f2c94c"
      : "#94a3b8";

  return (
    <div className="relative w-40 h-40">
      <svg
        className="w-full h-full"
        viewBox="0 0 128 128"
        style={{ transform: "rotate(-90deg)" }}
        aria-hidden="true"
      >
        {/* Track */}
        <circle
          cx="64" cy="64" r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-ink-200 dark:text-ink-800"
        />
        {/* Progress arc */}
        <circle
          cx="64" cy="64" r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={dash}
          style={{
            transition: "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)",
          }}
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className="text-4xl font-bold font-display leading-none"
          style={{ color: strokeColor }}
        >
          {percent}%
        </span>
        <span className="mt-1 text-[10px] uppercase tracking-widest text-ink-400 dark:text-ink-500">
          score
        </span>
      </div>
    </div>
  );
}

/* ─── Dull Drizzle Effect (low score) ──────────────────────────────────── */
function DullRain() {
  const drops = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    left: `${3 + (i / 28) * 94}%`,
    duration: `${(2.2 + Math.random() * 2.8).toFixed(2)}s`,
    delay: `${(Math.random() * 3).toFixed(2)}s`,
    size: `${4 + Math.floor(Math.random() * 5)}px`,
    opacity: (0.12 + Math.random() * 0.15).toFixed(2),
  }));

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes ss-fall {
          0%   { transform: translateY(-30px); }
          100% { transform: translateY(110vh); }
        }
      `}</style>
      {drops.map((d) => (
        <div
          key={d.id}
          style={{
            position: "absolute",
            left: d.left,
            top: 0,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: "#94a3b8",
            opacity: d.opacity,
            animation: `ss-fall ${d.duration} ${d.delay} infinite linear`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Main ScoreScreen ──────────────────────────────────────────────────── */
export default function ScoreScreen({ score, total, onRetryAll, onRetryWrong }) {
  const wrongCount = total - score;
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const isHigh = percent >= 70;
  const [triggerConfetti, setTriggerConfetti] = useState(false);

  // Fire confetti slightly after mount so the ring animation plays first
  useEffect(() => {
    if (isHigh) {
      const t = setTimeout(() => setTriggerConfetti(true), 600);
      return () => clearTimeout(t);
    }
  }, [isHigh]);

  const feedback = (() => {
    if (percent === 100)
      return { emoji: "🏆", title: "Perfect Score!", desc: "Absolutely flawless! You've completely mastered this topic." };
    if (percent >= 85)
      return { emoji: "🎉", title: "Excellent!", desc: "Outstanding performance. You really know your stuff!" };
    if (percent >= 70)
      return { emoji: "👍", title: "Great Job!", desc: "Solid effort! A little more review and you'll ace it." };
    if (percent >= 50)
      return { emoji: "📚", title: "Good Effort", desc: "You're on the right track. Review the missed questions and try again." };
    if (percent >= 30)
      return { emoji: "💪", title: "Keep Going!", desc: "Don't stop now. Review your notes carefully and come back stronger." };
    return {
      emoji: "😔",
      title: "Need More Practice",
      desc: "Don't be discouraged — every attempt is progress. Take another look at the material.",
    };
  })();

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[55vh] px-6 py-16 text-center">
      {/* Confetti for high scores */}
      {isHigh && <Confetti active={triggerConfetti} />}

      {/* Dull drizzle for low scores */}
      {!isHigh && <DullRain />}

      {/* Score ring */}
      <div className="relative z-10">
        <ScoreRing percent={percent} isHigh={isHigh} />
      </div>

      {/* Emoji + heading + description */}
      <div className="mt-7 relative z-10">
        <div className="text-5xl mb-3 select-none">{feedback.emoji}</div>
        <h3
          className={`font-display text-3xl font-bold ${
            isHigh
              ? "text-ink-900 dark:text-ink-100"
              : "text-ink-500 dark:text-ink-400"
          }`}
        >
          {feedback.title}
        </h3>
        <p
          className={`mt-2 text-sm max-w-xs mx-auto leading-relaxed ${
            isHigh
              ? "text-ink-500 dark:text-ink-400"
              : "text-ink-400 dark:text-ink-500"
          }`}
        >
          {feedback.desc}
        </p>
      </div>

      {/* Stat pills */}
      <div className="mt-8 flex items-center justify-center gap-3 flex-wrap relative z-10">
        <div
          className={`flex flex-col items-center rounded-2xl px-6 py-3 ${
            isHigh
              ? "bg-green-50 dark:bg-green-900/20"
              : "bg-ink-100 dark:bg-ink-800"
          }`}
        >
          <span
            className={`text-2xl font-bold font-display leading-none ${
              isHigh
                ? "text-green-600 dark:text-green-400"
                : "text-ink-400 dark:text-ink-500"
            }`}
          >
            {score}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-wider text-ink-400 dark:text-ink-500">
            Correct
          </span>
        </div>

        {wrongCount > 0 && (
          <div className="flex flex-col items-center rounded-2xl px-6 py-3 bg-red-50 dark:bg-red-950/30">
            <span className="text-2xl font-bold font-display leading-none text-red-500 dark:text-red-400">
              {wrongCount}
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-wider text-ink-400 dark:text-ink-500">
              Missed
            </span>
          </div>
        )}

        <div className="flex flex-col items-center rounded-2xl px-6 py-3 bg-ink-100 dark:bg-ink-800">
          <span className="text-2xl font-bold font-display leading-none text-ink-600 dark:text-ink-300">
            {total}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-wider text-ink-400 dark:text-ink-500">
            Total
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-8 flex flex-wrap justify-center gap-3 relative z-10">
        <button
          onClick={onRetryAll}
          className="inline-flex items-center gap-2 rounded-full border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 px-6 py-2.5 text-sm font-medium text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800 transition"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Retry All
        </button>

        {wrongCount > 0 && (
          <button
            onClick={onRetryWrong}
            className="inline-flex items-center gap-2 rounded-full bg-marker-500 hover:bg-marker-600 active:scale-[0.98] px-6 py-2.5 text-sm font-semibold text-white transition shadow-sm"
          >
            <Repeat className="h-4 w-4" aria-hidden="true" />
            Retry {wrongCount} Missed
          </button>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";

export default function Flashcard({ card, cardKey }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state whenever we move to a different card.
  useEffect(() => {
    setIsFlipped(false);
  }, [cardKey]);

  function toggle() {
    setIsFlipped((f) => !f);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  }

  return (
    <div className="card-flip-container w-full h-64 sm:h-72">
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isFlipped}
        aria-label={isFlipped ? "Showing answer. Press to show question." : "Showing question. Press to show answer."}
        onClick={toggle}
        onKeyDown={handleKeyDown}
        className={`card-flip-inner relative h-full w-full cursor-pointer ${isFlipped ? "is-flipped" : ""}`}
      >
        <div className="card-face absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 bg-ruled-lines p-6 text-center shadow-sm">
          <span className="mb-2 text-xs font-medium uppercase tracking-wide text-highlight-600 dark:text-highlight-400">
            Question
          </span>
          <p className="font-display text-xl text-ink-900 dark:text-ink-100">{card.question}</p>
          <span className="mt-4 text-xs text-ink-400 dark:text-ink-600">Tap to flip</span>
        </div>

        <div className="card-face card-face-back absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-marker-500/40 bg-marker-500/5 dark:bg-marker-500/10 p-6 text-center shadow-sm">
          <span className="mb-2 text-xs font-medium uppercase tracking-wide text-marker-600">Answer</span>
          <p className="font-display text-xl text-ink-900 dark:text-ink-100">{card.answer}</p>
          <span className="mt-4 text-xs text-ink-400 dark:text-ink-600">Tap to flip back</span>
        </div>
      </div>
    </div>
  );
}

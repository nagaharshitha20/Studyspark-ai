import { useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Shuffle, RotateCcw, Bookmark } from "lucide-react";
import Flashcard from "./Flashcard.jsx";

export default function FlashcardView({ flashcards }) {
  const [order, setOrder] = useState(() => flashcards.map((_, i) => i));
  const [index, setIndex] = useState(0);
  const [bookmarked, setBookmarked] = useState(() => new Set());

  const currentCard = useMemo(() => flashcards[order[index]], [flashcards, order, index]);
  const isBookmarked = bookmarked.has(order[index]);

  const goNext = useCallback(() => setIndex((i) => Math.min(i + 1, order.length - 1)), [order.length]);
  const goPrev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);

  function shuffle() {
    const next = [...order];
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setOrder(next);
    setIndex(0);
  }

  function restart() {
    setOrder(flashcards.map((_, i) => i));
    setIndex(0);
  }

  function toggleBookmark() {
    setBookmarked((prev) => {
      const next = new Set(prev);
      const originalIdx = order[index];
      next.has(originalIdx) ? next.delete(originalIdx) : next.add(originalIdx);
      return next;
    });
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-3 flex items-center justify-between text-sm text-ink-500 dark:text-ink-400">
        <span>
          Card {index + 1} of {order.length}
          {bookmarked.size > 0 && ` · ${bookmarked.size} bookmarked`}
        </span>
        <div className="flex gap-2">
          <button
            onClick={shuffle}
            className="rounded-full p-1.5 hover:bg-ink-100 dark:hover:bg-ink-800 transition"
            aria-label="Shuffle cards"
            title="Shuffle"
          >
            <Shuffle className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            onClick={restart}
            className="rounded-full p-1.5 hover:bg-ink-100 dark:hover:bg-ink-800 transition"
            aria-label="Restart deck"
            title="Restart"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        className="h-1 w-full rounded-full bg-ink-200 dark:bg-ink-800 mb-4 overflow-hidden"
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={order.length}
      >
        <div
          className="h-full rounded-full bg-marker-500 transition-all duration-300"
          style={{ width: `${((index + 1) / order.length) * 100}%` }}
        />
      </div>

      <Flashcard card={currentCard} cardKey={order[index]} />

      <div className="mt-5 flex items-center justify-between">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="inline-flex items-center gap-1 rounded-full border border-ink-200 dark:border-ink-800 px-4 py-2 text-sm font-medium hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Prev
        </button>

        <button
          onClick={toggleBookmark}
          aria-pressed={isBookmarked}
          aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this card"}
          className={`rounded-full p-2.5 border transition ${
            isBookmarked
              ? "border-highlight-500 bg-highlight-400/20 text-highlight-600"
              : "border-ink-200 dark:border-ink-800 text-ink-400 hover:text-highlight-600"
          }`}
        >
          <Bookmark className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} aria-hidden="true" />
        </button>

        <button
          onClick={goNext}
          disabled={index === order.length - 1}
          className="inline-flex items-center gap-1 rounded-full border border-ink-200 dark:border-ink-800 px-4 py-2 text-sm font-medium hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

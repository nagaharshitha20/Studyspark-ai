import { useMemo, useState } from "react";
import { ChevronRight, RotateCcw, Repeat } from "lucide-react";
import QuizQuestion from "./QuizQuestion.jsx";

export default function QuizView({ quiz }) {
  // Each entry in the active queue carries its index into the *original*
  // quiz array, so scoring and "retry wrong answers" stay correct even
  // after we've reordered/filtered down to just the missed questions.
  const [activeQueue, setActiveQueue] = useState(() => quiz.map((q, i) => ({ ...q, originalIndex: i })));
  const [pos, setPos] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [answers, setAnswers] = useState({}); // originalIndex -> { selected, correct }
  const [isFinished, setIsFinished] = useState(false);

  const current = activeQueue[pos];
  const isAnswered = selectedIndex !== null;

  const score = useMemo(
    () => Object.values(answers).filter((a) => a.correct).length,
    [answers]
  );

  function handleSelect(i) {
    if (isAnswered) return;
    setSelectedIndex(i);
    setAnswers((prev) => ({
      ...prev,
      [current.originalIndex]: { selected: i, correct: i === current.correctIndex },
    }));
  }

  function handleNext() {
    if (pos + 1 < activeQueue.length) {
      setPos((p) => p + 1);
      setSelectedIndex(null);
    } else {
      setIsFinished(true);
    }
  }

  function retryEntireQuiz() {
    setActiveQueue(quiz.map((q, i) => ({ ...q, originalIndex: i })));
    setPos(0);
    setSelectedIndex(null);
    setAnswers({});
    setIsFinished(false);
  }

  function retryWrongOnly() {
    const missed = Object.entries(answers)
      .filter(([, a]) => !a.correct)
      .map(([originalIndex]) => ({ ...quiz[Number(originalIndex)], originalIndex: Number(originalIndex) }));
    if (missed.length === 0) return;
    setActiveQueue(missed);
    setPos(0);
    setSelectedIndex(null);
    setAnswers({});
    setIsFinished(false);
  }

  if (isFinished) {
    return (
      <div className="w-full max-w-xl mx-auto text-center">
        <p className="text-sm uppercase tracking-wide text-ink-400 dark:text-ink-600 mb-1">Quiz complete</p>
        <p className="font-display text-4xl font-semibold text-ink-900 dark:text-ink-100">
          {score} / {activeQueue.length}
        </p>
        <p className="mt-2 text-sm text-ink-500 dark:text-ink-400">
          {score === activeQueue.length ? "Perfect score." : "Nice work — review and try the ones you missed."}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={retryEntireQuiz}
            className="inline-flex items-center gap-2 rounded-full border border-ink-200 dark:border-ink-800 px-5 py-2 text-sm font-medium hover:bg-ink-100 dark:hover:bg-ink-800 transition"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Retry entire quiz
          </button>
          {activeQueue.length - score > 0 && (
            <button
              onClick={retryWrongOnly}
              className="inline-flex items-center gap-2 rounded-full bg-marker-500 px-5 py-2 text-sm font-semibold text-white hover:bg-marker-600 transition"
            >
              <Repeat className="h-4 w-4" aria-hidden="true" />
              Retry {activeQueue.length - score} wrong answer{activeQueue.length - score === 1 ? "" : "s"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="mb-3 flex items-center justify-between text-sm text-ink-500 dark:text-ink-400">
        <span>
          Question {pos + 1} of {activeQueue.length}
        </span>
        <span>Score: {score}</span>
      </div>

      <div
        className="h-1 w-full rounded-full bg-ink-200 dark:bg-ink-800 mb-6 overflow-hidden"
        role="progressbar"
        aria-valuenow={pos + 1}
        aria-valuemin={1}
        aria-valuemax={activeQueue.length}
      >
        <div
          className="h-full rounded-full bg-marker-500 transition-all duration-300"
          style={{ width: `${((pos + 1) / activeQueue.length) * 100}%` }}
        />
      </div>

      <QuizQuestion question={current} selectedIndex={selectedIndex} onSelect={handleSelect} isAnswered={isAnswered} />

      {isAnswered && (
        <button
          onClick={handleNext}
          className="mt-5 inline-flex items-center gap-1 rounded-full bg-ink-900 dark:bg-ink-100 px-5 py-2 text-sm font-semibold text-ink-50 dark:text-ink-900 hover:opacity-90 transition"
        >
          {pos + 1 < activeQueue.length ? "Next question" : "See results"}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

import { Check, X } from "lucide-react";

export default function QuizQuestion({ question, selectedIndex, onSelect, isAnswered }) {
  return (
    <div className="w-full">
      <p className="font-display text-xl text-ink-900 dark:text-ink-100 mb-5">{question.question}</p>

      <div role="radiogroup" aria-label="Answer options" className="space-y-2.5">
        {question.options.map((option, i) => {
          const isCorrect = i === question.correctIndex;
          const isSelected = i === selectedIndex;

          let stateClasses = "border-ink-200 dark:border-ink-800 hover:bg-ink-100 dark:hover:bg-ink-800";
          if (isAnswered) {
            if (isCorrect) {
              stateClasses = "border-emerald-500 bg-emerald-500/10";
            } else if (isSelected && !isCorrect) {
              stateClasses = "border-marker-500 bg-marker-500/10";
            } else {
              stateClasses = "border-ink-200 dark:border-ink-800 opacity-60";
            }
          }

          return (
            <button
              key={i}
              role="radio"
              aria-checked={isSelected}
              disabled={isAnswered}
              onClick={() => onSelect(i)}
              className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium text-ink-800 dark:text-ink-200 transition ${stateClasses} disabled:cursor-default`}
            >
              <span>{option}</span>
              {isAnswered && isCorrect && <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />}
              {isAnswered && isSelected && !isCorrect && <X className="h-4 w-4 shrink-0 text-marker-600" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-ink-200 dark:border-ink-800 bg-ink-100/60 dark:bg-ink-800/40 p-4 text-sm text-ink-700 dark:text-ink-300"
        >
          <span className="font-semibold text-ink-900 dark:text-ink-100">
            {selectedIndex === question.correctIndex ? "Correct. " : "Not quite. "}
          </span>
          {question.explanation}
        </div>
      )}
    </div>
  );
}

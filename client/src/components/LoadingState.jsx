export default function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Generating your study set"
      className="w-full max-w-2xl mx-auto mt-10 space-y-4"
    >
      <div className="h-6 w-2/3 rounded bg-ink-200/70 dark:bg-ink-800 animate-pulse" />
      <div className="h-4 w-full rounded bg-ink-200/50 dark:bg-ink-800/70 animate-pulse" />
      <div className="h-4 w-5/6 rounded bg-ink-200/50 dark:bg-ink-800/70 animate-pulse" />
      <div className="grid grid-cols-2 gap-4 pt-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-ink-200/40 dark:bg-ink-800/50 animate-pulse"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
      <p className="text-center text-sm text-ink-500 dark:text-ink-400 pt-2">
        Reading your notes and building flashcards + quiz…
      </p>
    </div>
  );
}

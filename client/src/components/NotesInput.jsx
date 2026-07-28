import { Sparkles } from "lucide-react";

const MAX_CHARS = 12000;

export default function NotesInput({ value, onChange, onSubmit, isLoading }) {
  const trimmedLength = value.trim().length;
  const canSubmit = trimmedLength > 0 && trimmedLength <= MAX_CHARS && !isLoading;

  function handleKeyDown(e) {
    // Cmd/Ctrl + Enter submits, matching common editor conventions.
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSubmit) {
      onSubmit();
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label htmlFor="notes-input" className="block text-sm font-medium text-ink-600 dark:text-ink-400 mb-2">
        Paste your notes or describe a topic
      </label>
      <textarea
        id="notes-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="e.g. Paste your biology lecture notes on cellular respiration, or just type a topic like “the French Revolution”…"
        rows={7}
        maxLength={MAX_CHARS}
        aria-describedby="notes-char-count"
        className="w-full resize-y rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 bg-ruled-lines px-4 py-3 text-ink-900 dark:text-ink-100 placeholder:text-ink-400 shadow-sm focus:border-marker-500 transition"
      />
      <div className="mt-2 flex items-center justify-between">
        <span id="notes-char-count" className="text-xs text-ink-400 dark:text-ink-600">
          {value.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters · ⌘/Ctrl + Enter to generate
        </span>
        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 rounded-full bg-marker-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-marker-600 active:scale-[0.98] transition disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          {isLoading ? "Generating…" : "Generate"}
        </button>
      </div>
    </div>
  );
}

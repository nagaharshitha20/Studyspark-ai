import { AlertTriangle, RotateCcw } from "lucide-react";

export default function ErrorState({ error, onRetry }) {
  const { title, hint } = describeError(error);

  return (
    <div
      role="alert"
      className="w-full max-w-xl mx-auto mt-10 rounded-2xl border border-marker-500/30 bg-marker-500/5 dark:bg-marker-500/10 p-6 text-center"
    >
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-marker-500/15">
        <AlertTriangle className="h-5 w-5 text-marker-600" aria-hidden="true" />
      </div>
      <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-100">{title}</h3>
      <p className="mt-1 text-sm text-ink-600 dark:text-ink-400">{hint}</p>

      {error?.details?.length > 0 && (
        <details className="mt-3 text-left text-xs text-ink-500 dark:text-ink-500">
          <summary className="cursor-pointer select-none">Technical details</summary>
          <ul className="mt-1 list-disc pl-5">
            {error.details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </details>
      )}

      <button
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink-900 dark:bg-ink-100 px-5 py-2 text-sm font-medium text-ink-50 dark:text-ink-900 hover:opacity-90 active:scale-[0.98] transition"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Try again
      </button>
    </div>
  );
}

function describeError(error) {
  switch (error?.code) {
    case "TIMEOUT":
      return { title: "That took too long", hint: "The model didn't respond in time. Let's give it another shot." };
    case "RATE_LIMITED":
      return { title: "Too many requests", hint: "We've hit a rate limit. Wait a few seconds and try again." };
    case "UPSTREAM_ERROR":
      return { title: "The AI provider is having issues", hint: "This is on their end, not yours. Try again shortly." };
    case "INVALID_MODEL_OUTPUT":
      return {
        title: "Couldn't make sense of the response",
        hint: "The model returned something unexpected. This is rare — retrying usually fixes it.",
      };
    case "VALIDATION_ERROR":
      return { title: "Check your notes", hint: error.message || "Please review your input and try again." };
    case "NETWORK_ERROR":
      return { title: "Can't reach the server", hint: "Check your connection and that the backend is running." };
    default:
      return { title: "Something went wrong", hint: error?.message || "Please try again." };
  }
}

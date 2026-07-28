import { BookOpen } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="w-full max-w-xl mx-auto mt-14 text-center text-ink-400 dark:text-ink-600">
      <BookOpen className="mx-auto h-9 w-9 mb-3" strokeWidth={1.5} aria-hidden="true" />
      <p className="text-sm">
        Paste your notes above and hit <span className="font-medium text-ink-500 dark:text-ink-400">Generate</span> — your
        flashcards and quiz will show up here.
      </p>
    </div>
  );
}

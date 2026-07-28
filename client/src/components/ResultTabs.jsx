export default function ResultTabs({ active, onChange, flashcardCount, quizCount }) {
  const tabs = [
    { id: "flashcards", label: `Flashcards (${flashcardCount})` },
    { id: "quiz", label: `Quiz (${quizCount})` },
  ];

  return (
    <div role="tablist" aria-label="Study set view" className="mx-auto mb-6 flex w-fit rounded-full border border-ink-200 dark:border-ink-800 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          onClick={() => onChange(tab.id)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
            active === tab.id
              ? "bg-ink-900 text-ink-50 dark:bg-ink-100 dark:text-ink-900"
              : "text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-200"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

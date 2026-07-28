import { useState } from "react";
import {
  X,
  History,
  BookOpen,
  HelpCircle,
  Clock,
  FileText,
  ChevronRight,
  Sparkles,
  PlusCircle,
  Trash2,
  ChevronLeft,
  GraduationCap,
} from "lucide-react";

function timeAgo(isoString) {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(isoString).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function groupByDate(entries) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const groups = { Today: [], Yesterday: [], "This Week": [], Older: [] };
  for (const entry of entries) {
    const date = new Date(entry.createdAt);
    date.setHours(0, 0, 0, 0);
    if (date >= today) groups["Today"].push(entry);
    else if (date >= yesterday) groups["Yesterday"].push(entry);
    else if (date >= weekAgo) groups["This Week"].push(entry);
    else groups["Older"].push(entry);
  }
  return Object.entries(groups).filter(([, items]) => items.length > 0);
}

export default function HistorySidebar({
  isOpen,
  onToggle,
  history,
  onSelectEntry,
  onRemoveEntry,
  onNewStudySet,
  activeEntryId,
}) {
  const groups = groupByDate(history);

  return (
    <>
      {/* Fixed sidebar panel — part of the layout */}
      <aside
        aria-label="Study history sidebar"
        className={`fixed left-0 top-0 z-30 h-screen flex-col bg-white dark:bg-ink-900 border-r border-ink-200 dark:border-ink-800 shadow-lg transition-all duration-300 ease-in-out flex ${
          isOpen ? "w-[280px]" : "w-0 overflow-hidden border-r-0"
        }`}
        style={{ minWidth: isOpen ? 280 : 0 }}
      >
        {/* Sidebar header */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-ink-200 dark:border-ink-800 px-4 py-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg bg-marker-500 text-white">
              <GraduationCap className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="font-display text-sm font-bold text-ink-900 dark:text-ink-100 whitespace-nowrap">
              StudySpark AI
            </span>
          </div>
          <button
            onClick={onToggle}
            aria-label="Collapse sidebar"
            title="Collapse"
            className="flex-shrink-0 rounded-lg p-1.5 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 hover:bg-ink-100 dark:hover:bg-ink-800 transition"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* New Study Set button */}
        <div className="flex-shrink-0 px-3 pt-3 pb-2">
          <button
            onClick={onNewStudySet}
            className="w-full flex items-center gap-2 rounded-xl bg-marker-500 hover:bg-marker-600 active:scale-[0.98] px-3 py-2.5 text-sm font-semibold text-white transition-all duration-150 shadow-sm"
          >
            <PlusCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span>New Study Set</span>
          </button>
        </div>

        {/* History label */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 pt-2 pb-1">
          <History className="h-3.5 w-3.5 text-ink-400" aria-hidden="true" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-400 dark:text-ink-500">
            History
          </span>
          {history.length > 0 && (
            <span className="ml-auto rounded-full bg-ink-100 dark:bg-ink-800 px-1.5 py-0.5 text-[10px] font-medium text-ink-500 dark:text-ink-400">
              {history.length}
            </span>
          )}
        </div>

        {/* Scrollable history list */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4 space-y-1 scrollbar-thin">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-100 dark:bg-ink-800 mb-3">
                <Sparkles className="h-6 w-6 text-ink-400 dark:text-ink-500" aria-hidden="true" />
              </div>
              <p className="text-xs font-semibold text-ink-600 dark:text-ink-400 mb-1">No history yet</p>
              <p className="text-[11px] text-ink-400 dark:text-ink-500 leading-relaxed">
                Generate your first study set to see it here.
              </p>
            </div>
          ) : (
            <>
              {groups.map(([groupLabel, entries]) => (
                <div key={groupLabel} className="mb-2">
                  <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-ink-400 dark:text-ink-600 py-1">
                    {groupLabel}
                  </p>
                  {entries.map((entry) => (
                    <HistoryCard
                      key={entry.id}
                      entry={entry}
                      isActive={entry.id === activeEntryId}
                      onSelect={() => onSelectEntry(entry)}
                      onRemove={() => onRemoveEntry(entry.id)}
                    />
                  ))}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="flex-shrink-0 border-t border-ink-200 dark:border-ink-800 px-4 py-2.5">
            <p className="text-[10px] text-ink-400 dark:text-ink-600 text-center">
              {history.length} session{history.length !== 1 ? "s" : ""} · saved locally
            </p>
          </div>
        )}
      </aside>

      {/* Collapsed sidebar toggle tab — visible only when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          aria-label="Open history sidebar"
          title="Open history"
          className="fixed left-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-r-xl px-1.5 py-3 shadow-md hover:shadow-lg transition-all duration-150 group"
        >
          <ChevronRight className="h-3.5 w-3.5 text-ink-400 group-hover:text-marker-500 transition" aria-hidden="true" />
          <History className="h-3.5 w-3.5 text-ink-400 group-hover:text-marker-500 transition" aria-hidden="true" />
          {history.length > 0 && (
            <span className="text-[9px] font-bold text-marker-500">
              {history.length > 9 ? "9+" : history.length}
            </span>
          )}
        </button>
      )}
    </>
  );
}

function HistoryCard({ entry, isActive, onSelect, onRemove }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleDeleteClick(e) {
    e.stopPropagation();
    setConfirmDelete(true);
  }

  function handleConfirm(e) {
    e.stopPropagation();
    onRemove();
  }

  function handleCancel(e) {
    e.stopPropagation();
    setConfirmDelete(false);
  }

  // Inline delete confirmation UI
  if (confirmDelete) {
    return (
      <div
        className="relative w-full rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-3 mb-1"
        role="alert"
      >
        <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1 line-clamp-1">
          Delete "{entry.title}"?
        </p>
        <p className="text-[11px] text-red-500 dark:text-red-500/80 mb-3">
          This will remove it from your history permanently.
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleConfirm}
            className="flex items-center gap-1 rounded-lg bg-red-500 hover:bg-red-600 px-3 py-1.5 text-[11px] font-semibold text-white transition"
          >
            <Trash2 className="h-3 w-3" aria-hidden="true" />
            Delete
          </button>
          <button
            onClick={handleCancel}
            className="rounded-lg bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 px-3 py-1.5 text-[11px] font-medium text-ink-600 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect()}
      aria-pressed={isActive}
      aria-label={`Load: ${entry.title}`}
      className={`group relative w-full cursor-pointer rounded-xl border px-3 py-2.5 mb-1 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marker-500 ${
        isActive
          ? "border-marker-500/50 bg-marker-500/5 dark:bg-marker-500/10"
          : "border-transparent hover:border-ink-200 dark:hover:border-ink-700 hover:bg-ink-50 dark:hover:bg-ink-800/50"
      }`}
    >
      {/* Delete button — visible on hover */}
      <button
        onClick={handleDeleteClick}
        aria-label={`Delete ${entry.title}`}
        className="absolute right-2 top-2 rounded-md p-1 text-ink-300 dark:text-ink-600 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-150"
      >
        <X className="h-3 w-3" aria-hidden="true" />
      </button>

      {/* Active dot */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-marker-500" aria-hidden="true" />
      )}

      {/* Title */}
      <p className="pr-5 text-[12px] font-semibold text-ink-800 dark:text-ink-200 leading-snug line-clamp-2 mb-1.5">
        {entry.title}
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-2 text-[10px] text-ink-400 dark:text-ink-500 flex-wrap">
        <span className="flex items-center gap-0.5">
          <BookOpen className="h-2.5 w-2.5" aria-hidden="true" />
          {entry.flashcardCount}
        </span>
        <span className="flex items-center gap-0.5">
          <HelpCircle className="h-2.5 w-2.5" aria-hidden="true" />
          {entry.quizCount}Q
        </span>
        <span className="ml-auto flex items-center gap-0.5">
          <Clock className="h-2.5 w-2.5" aria-hidden="true" />
          {timeAgo(entry.createdAt)}
        </span>
      </div>

      {/* Notes snippet */}
      {entry.notes && (
        <div className="mt-1.5 flex items-center gap-1 rounded-lg bg-ink-100/70 dark:bg-ink-800/60 px-2 py-1">
          <FileText className="h-2.5 w-2.5 flex-shrink-0 text-ink-400" aria-hidden="true" />
          <span className="text-[10px] text-ink-400 dark:text-ink-500 truncate leading-tight">
            {entry.notes.slice(0, 50)}…
          </span>
        </div>
      )}
    </div>
  );
}

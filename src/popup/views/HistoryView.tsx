import { useHistory } from '../../hooks/useHistory';
import { formatDateDisplay } from '../../utils/format.utils';
import type { HistoryEntry } from '../../types/history.types';

// ─── Icons ────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function TrashIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  );
}

function ImagePlaceholder() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-mat-primary-container/40">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-mat-primary/40" aria-hidden="true">
        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
      </svg>
    </div>
  );
}

// ─── History entry card ───────────────────────────────────────────────────────

function EntryCard({
  entry,
  onDelete,
}: {
  entry: HistoryEntry;
  onDelete: (id: string) => void;
}) {
  const openTask = () => void chrome.tabs.create({ url: entry.taskUrl });

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 border-b border-mat-outline-var last:border-b-0 hover:bg-mat-primary-container/20 transition-colors group">
      {/* Thumbnail */}
      <div className="shrink-0 w-[80px] h-[46px] rounded overflow-hidden border border-mat-outline-var bg-mat-bg">
        {entry.screenshotThumb ? (
          <img
            src={entry.screenshotThumb}
            alt=""
            className="w-full h-full object-cover object-top"
            aria-hidden="true"
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <p className="text-xs font-semibold text-mat-on-surface leading-tight truncate" title={entry.title}>
          {entry.title}
        </p>
        <p className="text-2xs text-mat-muted tabular-nums">
          {formatDateDisplay(entry.createdAt)}
        </p>
        {entry.screenshotUrl && (
          <a
            href={entry.screenshotUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => { e.preventDefault(); void chrome.tabs.create({ url: entry.screenshotUrl! }); }}
            className="text-2xs text-mat-primary hover:underline truncate leading-tight"
            title="View screenshot in Google Drive"
          >
            Screenshot ↗
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={openTask}
          className="flex items-center justify-center w-7 h-7 rounded text-mat-primary hover:bg-mat-primary-container transition-colors"
          title="Open in ClickUp"
          aria-label="Open task in ClickUp"
        >
          <LinkIcon />
        </button>
        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          className="flex items-center justify-center w-7 h-7 rounded text-mat-error hover:bg-mat-error-light transition-colors"
          title="Delete this entry"
          aria-label="Delete history entry"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-mat-primary-container/40 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-mat-primary/60" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-mat-on-surface">
          {filtered ? 'No matching tickets' : 'No history yet'}
        </p>
        <p className="text-xs text-mat-muted">
          {filtered
            ? 'Try a different search term.'
            : 'Submitted bug reports will appear here.'}
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function HistoryView() {
  const {
    isLoading,
    totalCount,
    displayEntries,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    deleteEntry,
    deleteAll,
  } = useHistory();

  const handleDeleteAll = () => {
    if (window.confirm(`Delete all ${totalCount} history entries? This cannot be undone.`)) {
      void deleteAll();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 rounded-full border-2 border-mat-primary-container border-t-mat-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 px-3 h-9 rounded-lg border border-mat-outline-var bg-mat-bg focus-within:border-mat-primary focus-within:ring-1 focus-within:ring-mat-primary/30 transition-colors">
          <span className="text-mat-muted shrink-0"><SearchIcon /></span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets…"
            className="flex-1 text-xs text-mat-on-surface bg-transparent outline-none placeholder:text-mat-muted"
            aria-label="Search history"
          />
        </div>
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-2 px-3 pb-2">
        {/* Count */}
        <span className="text-2xs text-mat-muted flex-1">
          {totalCount === 0
            ? 'No tickets'
            : `${displayEntries.length} of ${totalCount} ticket${totalCount !== 1 ? 's' : ''}`}
        </span>

        {/* Sort toggle */}
        <button
          type="button"
          onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
          className="flex items-center gap-1 px-2.5 h-7 rounded border border-mat-outline-var text-2xs font-semibold text-mat-on-surface-var hover:bg-mat-surface-var transition-colors"
          title="Toggle sort order"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            {sortOrder === 'newest'
              ? <polyline points="19 12 12 19 5 12" />
              : <polyline points="5 12 12 5 19 12" />}
          </svg>
          {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
        </button>

        {/* Delete all */}
        {totalCount > 0 && (
          <button
            type="button"
            onClick={handleDeleteAll}
            className="flex items-center gap-1 px-2.5 h-7 rounded border border-mat-error/40 text-2xs font-semibold text-mat-error hover:bg-mat-error-light transition-colors"
            title="Delete all history"
          >
            <TrashIcon size={11} />
            Clear All
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-mat-outline-var mx-3" />

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {displayEntries.length === 0 ? (
          <EmptyState filtered={searchQuery.trim().length > 0} />
        ) : (
          <div>
            {displayEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onDelete={(id) => void deleteEntry(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

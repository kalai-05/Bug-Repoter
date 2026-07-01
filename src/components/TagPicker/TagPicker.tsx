import { useState, useRef, useEffect, useId } from 'react';
import type { ClickUpTag } from '../../types';

export interface TagPickerProps {
  label?: string;
  selected: string[];
  available: ClickUpTag[];
  isLoading?: boolean;
  onChange: (tags: string[]) => void;
}

function tagColor(tag: ClickUpTag) {
  return { background: tag.tag_bg || '#e5e7eb', color: tag.tag_fg || '#111827' };
}

function Chip({ name, color, onRemove }: { name: string; color?: React.CSSProperties; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold leading-none shrink-0"
      style={color}
    >
      {name}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="opacity-60 hover:opacity-100 leading-none"
        aria-label={`Remove ${name}`}
      >
        ×
      </button>
    </span>
  );
}

export function TagPicker({ label = 'Tags', selected, available, isLoading, onChange }: TagPickerProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const q = query.trim().toLowerCase();

  const filtered = available.filter(
    (t) => !selected.includes(t.name) && t.name.toLowerCase().includes(q),
  );

  const showCreate =
    q.length > 0 &&
    !available.some((t) => t.name.toLowerCase() === q) &&
    !selected.includes(q);

  const toggle = (name: string) => {
    onChange(selected.includes(name) ? selected.filter((s) => s !== name) : [...selected, name]);
    setQuery('');
    inputRef.current?.focus();
  };

  const addNew = () => {
    if (!q) return;
    onChange([...selected, q]);
    setQuery('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[0]) { toggle(filtered[0].name); }
      else if (showCreate) { addNew(); }
    }
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    if (e.key === 'Backspace' && query === '' && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
  };

  // Map tag name → color for selected chips
  const colorMap = Object.fromEntries(available.map((t) => [t.name, tagColor(t)]));

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      <label htmlFor={id} className="text-2xs font-semibold text-mat-on-surface-var uppercase tracking-wider">
        {label}
      </label>

      {/* Input area */}
      <div
        className={[
          'flex flex-wrap items-center gap-1 min-h-[36px] px-2.5 py-1.5 rounded-lg border bg-mat-bg cursor-text transition-colors',
          open ? 'border-mat-primary ring-1 ring-mat-primary/30' : 'border-mat-outline-var',
        ].join(' ')}
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        {selected.map((name) => (
          <Chip
            key={name}
            name={name}
            {...(colorMap[name] ? { color: colorMap[name] } : {})}
            onRemove={() => onChange(selected.filter((s) => s !== name))}
          />
        ))}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? (isLoading ? 'Loading tags…' : 'Select or create tags…') : ''}
          className="flex-1 min-w-[80px] text-xs bg-transparent outline-none text-mat-on-surface placeholder:text-mat-muted"
          autoComplete="off"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-lg border border-mat-outline-var bg-white shadow-lg max-h-[180px] overflow-y-auto">
          {isLoading && (
            <p className="px-3 py-2 text-xs text-mat-muted">Loading tags…</p>
          )}

          {!isLoading && filtered.map((tag) => (
            <button
              key={tag.name}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => toggle(tag.name)}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs text-mat-on-surface hover:bg-mat-primary-container/30 transition-colors"
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: tag.tag_bg || '#9ca3af' }}
              />
              {tag.name}
            </button>
          ))}

          {showCreate && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={addNew}
              className="flex items-center gap-2 w-full px-3 py-2 text-left text-xs text-mat-primary font-semibold hover:bg-mat-primary-container/30 transition-colors border-t border-mat-outline-var"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create "{q}"
            </button>
          )}

          {!isLoading && filtered.length === 0 && !showCreate && (
            <p className="px-3 py-2 text-xs text-mat-muted">
              {available.length === 0 ? 'No tags in this space yet.' : 'No matches.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

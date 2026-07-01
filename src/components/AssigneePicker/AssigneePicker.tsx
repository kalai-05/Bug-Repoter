import { useState, useRef, useEffect, useId } from 'react';
import type { ClickUpMember } from '../../types';

export interface AssigneePickerProps {
  label?: string;
  selected: number[];
  members: ClickUpMember[];
  isLoading?: boolean;
  onChange: (ids: number[]) => void;
}

function Avatar({ member, size = 20 }: { member: ClickUpMember; size?: number }) {
  if (member.profilePicture) {
    return (
      <img
        src={member.profilePicture}
        alt={member.username}
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <span
      className="rounded-full flex items-center justify-center text-white text-[8px] font-bold shrink-0"
      style={{ width: size, height: size, background: member.color || '#6366f1' }}
    >
      {(member.username ?? '?').charAt(0).toUpperCase()}
    </span>
  );
}

export function AssigneePicker({
  label = 'Assignees',
  selected,
  members,
  isLoading,
  onChange,
}: AssigneePickerProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selectedMembers = members.filter((m) => selected.includes(m.id));

  const q = query.trim().toLowerCase();
  const filtered = members.filter(
    (m) =>
      !selected.includes(m.id) &&
      ((m.username ?? '').toLowerCase().includes(q) || (m.email ?? '').toLowerCase().includes(q)),
  );

  const toggle = (id: number) => {
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
    setQuery('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { setOpen(false); setQuery(''); }
    if (e.key === 'Backspace' && query === '' && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
  };

  return (
    <div ref={containerRef} className="relative flex flex-col gap-1">
      <label htmlFor={id} className="text-2xs font-semibold text-mat-on-surface-var uppercase tracking-wider">
        {label}
      </label>

      {/* Input area */}
      <div
        className={[
          'flex flex-wrap items-center gap-1.5 min-h-[36px] px-2.5 py-1.5 rounded-lg border bg-mat-bg cursor-text transition-colors',
          open ? 'border-mat-primary ring-1 ring-mat-primary/30' : 'border-mat-outline-var',
        ].join(' ')}
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
      >
        {/* Selected member chips */}
        {selectedMembers.map((m) => (
          <span key={m.id} className="inline-flex items-center gap-1 shrink-0">
            <Avatar member={m} size={18} />
            <span className="text-[10px] font-semibold text-mat-on-surface">{m.username}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggle(m.id); }}
              className="text-mat-muted hover:text-mat-on-surface leading-none text-xs"
              aria-label={`Remove ${m.username}`}
            >
              ×
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? (isLoading ? 'Loading members…' : 'Search assignees…') : ''}
          className="flex-1 min-w-[80px] text-xs bg-transparent outline-none text-mat-on-surface placeholder:text-mat-muted"
          autoComplete="off"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 rounded-lg border border-mat-outline-var bg-white shadow-lg max-h-[180px] overflow-y-auto">
          {isLoading && (
            <p className="px-3 py-2 text-xs text-mat-muted">Loading members…</p>
          )}

          {!isLoading && filtered.map((member) => (
            <button
              key={member.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => toggle(member.id)}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-left hover:bg-mat-primary-container/30 transition-colors"
            >
              <Avatar member={member} size={22} />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-mat-on-surface truncate">{member.username}</span>
                <span className="text-[10px] text-mat-muted truncate">{member.email}</span>
              </div>
            </button>
          ))}

          {!isLoading && filtered.length === 0 && (
            <p className="px-3 py-2 text-xs text-mat-muted">
              {members.length === 0 ? 'No workspace members found.' : 'No matches.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

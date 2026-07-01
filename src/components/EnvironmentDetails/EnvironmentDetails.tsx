import { useState } from 'react';
import type { EnvironmentInfo } from '../../types/environment.types';

/* ── Icons ─────────────────────────────────────────────────── */

function MonitorIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s cubic-bezier(0.2,0,0,1)' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/* ── Row icons ─────────────────────────────────────────────── */

function RowIcon({ path, viewBox = '0 0 24 24' }: { path: string; viewBox?: string }) {
  return (
    <svg width="11" height="11" viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 opacity-60">
      <path d={path} />
    </svg>
  );
}

/* ── Helpers ────────────────────────────────────────────────── */

function display(val: string): string {
  return val.trim() || '—';
}

function truncateUrl(url: string, max = 52): string {
  if (!url) return '—';
  try {
    const parsed = new URL(url);
    const short = parsed.hostname + parsed.pathname;
    return short.length > max ? short.slice(0, max) + '…' : short;
  } catch {
    return url.length > max ? url.slice(0, max) + '…' : url;
  }
}

/* ── Main component ─────────────────────────────────────────── */

export interface EnvironmentDetailsProps {
  info: EnvironmentInfo | null;
  isLoading?: boolean;
}

interface EnvRow {
  label: string;
  value: string;
  iconPath: string;
  title?: string;
  mono?: boolean;
}

export function EnvironmentDetails({ info, isLoading = false }: EnvironmentDetailsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const rows: EnvRow[] = info
    ? [
        {
          label: 'URL',
          value: truncateUrl(info.url),
          title: info.url,
          iconPath: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
          mono: true,
        },
        {
          label: 'Page Title',
          value: display(info.pageTitle),
          iconPath: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
        },
        {
          label: 'Browser',
          value: info.browserVersion
            ? `${info.browserName} ${info.browserVersion}`
            : display(info.browserName),
          iconPath: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77A5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22',
        },
        {
          label: 'OS',
          value: display(info.os),
          iconPath: 'M2 17h20v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2zM6 17V8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v9M12 17V7',
        },
        {
          label: 'Resolution',
          value: display(info.screenResolution),
          iconPath: 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3',
          mono: true,
        },
        {
          label: 'Date',
          value: display(info.date),
          iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z',
        },
        {
          label: 'Time',
          value: display(info.time),
          iconPath: 'M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm.5-10.25l3.54 3.54-1.41 1.41L11 13.17V7h1.5v4.75z',
          mono: true,
        },
        {
          label: 'Timezone',
          value: display(info.timezone),
          iconPath: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
        },
      ]
    : [];

  return (
    <div className="rounded-lg border border-mat-outline-var overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center justify-between w-full px-3 py-2.5 bg-mat-bg
          hover:bg-mat-outline-var/40 transition-colors duration-fast ease-material
          focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mat-primary"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-mat-on-surface-var">
          <MonitorIcon />
          Environment Details
        </span>
        <span className="text-mat-muted">
          <ChevronIcon open={isOpen} />
        </span>
      </button>

      {/* Collapsible body */}
      <div
        style={{
          maxHeight: isOpen ? '360px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.22s cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        <div className="border-t border-mat-outline-var">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-4 px-3">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-mat-primary-container border-t-mat-primary animate-spin" />
              <span className="text-2xs text-mat-muted">Collecting environment info…</span>
            </div>
          ) : (
            <dl className="divide-y divide-mat-outline-var">
              {rows.map(({ label, value, iconPath, title, mono }) => (
                <div key={label} className="flex items-start gap-2.5 px-3 py-1.5">
                  <dt className="flex items-center gap-1.5 w-[72px] shrink-0 text-2xs text-mat-muted pt-px">
                    <RowIcon path={iconPath} />
                    {label}
                  </dt>
                  <dd
                    className={['text-2xs text-mat-on-surface break-all min-w-0 pt-px', mono ? 'font-mono' : 'font-medium'].join(' ')}
                    title={title}
                  >
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}

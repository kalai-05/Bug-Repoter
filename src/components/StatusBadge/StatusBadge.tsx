import type { BugPriority } from '../../types';

/* ── Priority badge ────────────────────────────── */

const PRIORITY_CONFIG: Record<
  BugPriority,
  { dot: string; bg: string; text: string; label: string }
> = {
  urgent: { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', label: 'Urgent' },
  high:   { dot: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', label: 'High' },
  normal: { dot: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-700', label: 'Normal' },
  low:    { dot: 'bg-gray-400', bg: 'bg-gray-100', text: 'text-gray-600', label: 'Low' },
};

export function PriorityBadge({ priority }: { priority: BugPriority }) {
  const { dot, bg, text, label } = PRIORITY_CONFIG[priority];
  return (
    <span className={`chip ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}

/* ── Status badge ──────────────────────────────── */

const STATUS_CONFIG = {
  success: 'bg-mat-success-light text-mat-success',
  error: 'bg-mat-error-light text-mat-error',
  submitting: 'bg-mat-primary-container text-mat-primary',
} as const;

export function StatusBadge({
  status,
  label,
}: {
  status: keyof typeof STATUS_CONFIG;
  label: string;
}) {
  return <span className={`chip ${STATUS_CONFIG[status]}`}>{label}</span>;
}

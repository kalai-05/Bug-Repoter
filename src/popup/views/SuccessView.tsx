import { Button } from '../../components/Button';
import { formatDateDisplay } from '../../utils/format.utils';
import type { BugReportResult } from '../../types';
import type { Platform } from '../../types/chrome.types';

interface SuccessViewProps {
  result: BugReportResult;
  onReset: () => void;
  platform?: Platform;
}

const PLATFORM_LABEL: Record<Platform, string> = {
  clickup: 'ClickUp',
  jira: 'Jira',
  linear: 'Linear',
};

export function SuccessView({ result, onReset, platform }: SuccessViewProps) {
  const openTask = () => void chrome.tabs.create({ url: result.taskUrl });
  const copyLink = () => void navigator.clipboard.writeText(result.taskUrl);

  const label = platform ? PLATFORM_LABEL[platform] : 'Tracker';

  return (
    <div className="flex flex-col items-center justify-center gap-5 px-6 py-8 text-center">
      {/* Icon */}
      <div className="relative">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: 'linear-gradient(145deg, #d1fae5, #a7f3d0)', border: '1px solid #6ee7b7' }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        {/* Platform badge */}
        <div
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-btn"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
      </div>

      {/* Copy */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-base font-bold text-mat-on-surface">Ticket Created!</h2>
        <p className="text-sm text-mat-on-surface-var">
          Bug reported successfully.
        </p>
        <p className="text-xs text-mat-muted mt-0.5">
          {formatDateDisplay(result.createdAt)}
        </p>
        <span
          className="self-center mt-1 inline-flex items-center px-3 py-1 rounded-full text-2xs font-mono font-bold"
          style={{ background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)', color: '#4f46e5', border: '1px solid #c4b5fd' }}
        >
          #{result.taskId}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 w-full">
        <Button
          variant="filled"
          size="lg"
          fullWidth
          onClick={openTask}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          }
        >
          Open in {label}
        </Button>
        <Button
          variant="outlined"
          size="md"
          fullWidth
          onClick={copyLink}
          icon={
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          }
        >
          Copy Link
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={onReset}>
          Report Another Bug
        </Button>
      </div>
    </div>
  );
}

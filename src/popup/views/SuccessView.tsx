import { Button } from '../../components/Button';
import { formatDateDisplay } from '../../utils/format.utils';
import type { BugReportResult } from '../../types';

interface SuccessViewProps {
  result: BugReportResult;
  onReset: () => void;
}

export function SuccessView({ result, onReset }: SuccessViewProps) {
  const openTask = () => {
    void chrome.tabs.create({ url: result.taskUrl });
  };

  const copyLink = () => {
    void navigator.clipboard.writeText(result.taskUrl);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      {/* Icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-mat-success-container flex items-center justify-center">
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#198754"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-mat-primary flex items-center justify-center shadow-btn">
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
          Your bug has been reported successfully.
        </p>
        <p className="text-xs text-mat-muted mt-0.5">
          {formatDateDisplay(result.createdAt)}
        </p>
        {/* Task ID chip */}
        <span className="self-center mt-1 inline-flex items-center px-2.5 py-1 rounded-full bg-mat-primary-container text-mat-on-primary-container text-2xs font-mono font-semibold">
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
          View in ClickUp
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
          Copy ClickUp Link
        </Button>
        <Button variant="ghost" size="md" fullWidth onClick={onReset}>
          Report Another Bug
        </Button>
      </div>
    </div>
  );
}

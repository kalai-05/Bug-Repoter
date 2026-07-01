import { Button } from '../../components/Button';

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
}

export function ErrorView({ message, onRetry }: ErrorViewProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-mat-error-container flex items-center justify-center">
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#B3261E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      {/* Copy */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-base font-bold text-mat-on-surface">Submission Failed</h2>
        <p className="text-sm text-mat-on-surface-var">Something went wrong while creating the ticket.</p>
      </div>

      {/* Error message box */}
      <div className="w-full rounded-lg bg-mat-error-container border border-mat-error/20 px-4 py-3 text-left">
        <p className="text-xs font-semibold text-mat-error mb-0.5">Error details</p>
        <p className="text-xs text-mat-error/80 break-words">{message}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 w-full">
        <Button variant="filled" size="lg" fullWidth onClick={onRetry}>
          Try Again
        </Button>
      </div>
    </div>
  );
}

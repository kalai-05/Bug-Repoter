import { useState } from 'react';
import { Button } from '../Button';
import { ScreenshotViewer } from '../ScreenshotViewer';
import { AnnotationEditor } from '../AnnotationEditor';
import type { ScreenshotCaptureError, ScreenshotResult } from '../../types/screenshot.types';

/* ── Icons ─────────────────────────────────────────────────── */

function CameraIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  );
}

/* ── Helpers ────────────────────────────────────────────────── */

function formatBytes(bytes: number): string {
  if (bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDimensions(width: number, height: number): string {
  if (width === 0 || height === 0) return '—';
  return `${width} × ${height}`;
}

/* ── Action button ──────────────────────────────────────────── */

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

function ActionButton({ icon, label, onClick, variant = 'default' }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex-1 flex items-center justify-center gap-1.5 py-1.5',
        'text-2xs font-semibold transition-colors duration-fast ease-material',
        variant === 'danger'
          ? 'text-mat-error hover:bg-mat-error-light'
          : 'text-mat-on-surface-var hover:bg-mat-outline-var/40 hover:text-mat-primary',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  );
}

/* ── Metadata bar ───────────────────────────────────────────── */

function MetadataBar({ result }: { result: ScreenshotResult }) {
  return (
    <div className="flex items-center justify-between px-2.5 py-1.5 bg-mat-bg border-t border-mat-outline-var">
      <MetaItem
        icon={
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        }
        label={formatDimensions(result.width, result.height)}
        title="Resolution"
      />
      <div className="h-3 w-px bg-mat-outline-var" />
      <MetaItem
        icon={
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        }
        label={formatBytes(result.sizeBytes)}
        title="File size"
      />
      <div className="h-3 w-px bg-mat-outline-var" />
      <MetaItem
        icon={
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
        }
        label={result.format.toUpperCase()}
        title="Format"
      />
    </div>
  );
}

function MetaItem({
  icon,
  label,
  title,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
}) {
  return (
    <span className="flex items-center gap-1 text-mat-muted" title={title}>
      {icon}
      <span className="text-2xs font-medium tabular-nums">{label}</span>
    </span>
  );
}

/* ── Error hint ─────────────────────────────────────────────── */

function ErrorHint({ error }: { error: ScreenshotCaptureError }) {
  const isPermission = error.code === 'PERMISSION_DENIED';
  const isUncapturable = error.code === 'TAB_NOT_CAPTURABLE';

  return (
    <div className="flex flex-col gap-1">
      <p className="flex items-start gap-1.5 text-2xs text-mat-error font-medium leading-relaxed">
        <AlertIcon />
        <span>{error.userMessage}</span>
      </p>
      {isPermission && (
        <p className="text-2xs text-mat-muted ml-[18px]">
          Check your extension permissions in{' '}
          <span className="font-semibold">chrome://extensions</span>.
        </p>
      )}
      {isUncapturable && (
        <p className="text-2xs text-mat-muted ml-[18px]">
          Chrome restricts capture on browser-internal pages, the extensions page, and the
          new-tab page.
        </p>
      )}
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────── */

export interface ScreenshotPreviewProps {
  result: ScreenshotResult | null;
  /** Annotated PNG data URL — shown as thumbnail when set */
  annotatedDataUrl?: string | null;
  isCapturing: boolean;
  error: ScreenshotCaptureError | null;
  onCapture: () => void;
  onClear: () => void;
  /** Called with the exported annotated PNG data URL after the user saves */
  onAnnotate?: (dataUrl: string) => void;
}

export function ScreenshotPreview({
  result,
  annotatedDataUrl,
  isCapturing,
  error,
  onCapture,
  onClear,
  onAnnotate,
}: ScreenshotPreviewProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isAnnotating, setIsAnnotating] = useState(false);

  const handleRetake = () => {
    setIsViewerOpen(false);
    onCapture();
  };

  const handleDelete = () => {
    setIsViewerOpen(false);
    onClear();
  };

  const handleAnnotateSave = (url: string) => {
    setIsAnnotating(false);
    onAnnotate?.(url);
  };

  const displayUrl = annotatedDataUrl ?? result?.dataUrl;

  if (result) {
    return (
      <>
        <div className="flex flex-col rounded-lg overflow-hidden border border-mat-outline-var shadow-field">
          {/* Clickable thumbnail */}
          <button
            type="button"
            onClick={() => setIsViewerOpen(true)}
            className="relative group block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-mat-primary"
            title="Click to zoom"
            aria-label="Open screenshot zoom viewer"
          >
            <img
              src={displayUrl}
              alt={`Screenshot — ${formatDimensions(result.width, result.height)}`}
              className="w-full h-[110px] object-cover object-top block"
            />
            {/* Zoom-hint overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center
                bg-black/0 group-hover:bg-black/40
                opacity-0 group-hover:opacity-100
                transition-all duration-fast ease-material"
              aria-hidden="true"
            >
              <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-black/60 text-white text-2xs font-semibold">
                <ZoomIcon />
                Click to zoom
              </span>
            </div>
          </button>

          {/* Permanent action row */}
          <div className="flex border-t border-mat-outline-var">
            <ActionButton
              icon={<ZoomIcon />}
              label="Zoom"
              onClick={() => setIsViewerOpen(true)}
            />
            <div className="w-px bg-mat-outline-var" />
            <ActionButton
              icon={<PencilIcon />}
              label={annotatedDataUrl ? 'Re-annotate' : 'Annotate'}
              onClick={() => setIsAnnotating(true)}
            />
            <div className="w-px bg-mat-outline-var" />
            <ActionButton
              icon={<CameraIcon size={13} />}
              label="Retake"
              onClick={onCapture}
            />
            <div className="w-px bg-mat-outline-var" />
            <ActionButton
              icon={<TrashIcon />}
              label="Delete"
              onClick={onClear}
              variant="danger"
            />
          </div>

          {/* Metadata bar */}
          <MetadataBar result={result} />
        </div>

        {isViewerOpen && (
          <ScreenshotViewer
            result={result}
            onClose={() => setIsViewerOpen(false)}
            onRetake={handleRetake}
            onDelete={handleDelete}
          />
        )}

        <AnnotationEditor
          isOpen={isAnnotating}
          dataUrl={result.dataUrl}
          originalWidth={result.width}
          originalHeight={result.height}
          onSave={handleAnnotateSave}
          onClose={() => setIsAnnotating(false)}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button
        type="button"
        variant="tonal"
        fullWidth
        loading={isCapturing}
        onClick={onCapture}
        icon={<CameraIcon size={15} />}
      >
        {isCapturing ? 'Capturing screenshot…' : 'Capture Screenshot'}
      </Button>

      {error && <ErrorHint error={error} />}
    </div>
  );
}

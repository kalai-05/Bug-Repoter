import { useState } from 'react';
import { Button } from '../Button';
import { ScreenshotViewer } from '../ScreenshotViewer';
import { AnnotationEditor } from '../AnnotationEditor';
import type { ScreenshotCaptureError, ScreenshotItem } from '../../types/screenshot.types';

const MAX_SCREENSHOTS = 5;

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
  items: ScreenshotItem[];
  isCapturing: boolean;
  error: ScreenshotCaptureError | null;
  onCapture: () => void;
  onRemove: (index: number) => void;
  onAnnotate: (index: number, dataUrl: string) => void;
}

export function ScreenshotPreview({
  items,
  isCapturing,
  error,
  onCapture,
  onRemove,
  onAnnotate,
}: ScreenshotPreviewProps) {
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [annotatingIndex, setAnnotatingIndex] = useState<number | null>(null);

  const viewingItem = viewingIndex !== null ? (items[viewingIndex] ?? null) : null;
  const annotatingItem = annotatingIndex !== null ? (items[annotatingIndex] ?? null) : null;

  const handleAnnotateSave = (url: string) => {
    if (annotatingIndex !== null) onAnnotate(annotatingIndex, url);
    setAnnotatingIndex(null);
  };

  const openAnnotate = (index: number) => {
    setViewingIndex(null);
    setAnnotatingIndex(index);
  };

  /* ── Empty state ── */
  if (items.length === 0) {
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

  /* ── Gallery ── */
  return (
    <>
      <div className="flex flex-col gap-2">
        {/* Thumbnail row */}
        <div className="flex gap-2 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'thin' }}>
          {items.map((item, i) => {
            const display = item.annotated ?? item.result.dataUrl;
            return (
              <div
                key={i}
                className="relative shrink-0 rounded-lg overflow-hidden border border-mat-outline-var shadow-field group"
                style={{ width: 84, height: 60 }}
              >
                {/* Thumbnail click → viewer */}
                <button
                  type="button"
                  onClick={() => setViewingIndex(i)}
                  className="block w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-mat-primary"
                  aria-label={`View screenshot ${i + 1}`}
                >
                  <img
                    src={display}
                    alt={`Screenshot ${i + 1}`}
                    className="w-full h-full object-cover object-top pointer-events-none"
                  />
                </button>

                {/* Annotated badge */}
                {item.annotated && (
                  <span
                    className="absolute bottom-0.5 left-0.5 px-1 rounded text-white font-bold leading-none"
                    style={{ fontSize: 9, background: 'rgba(91,64,245,0.85)', paddingTop: 2, paddingBottom: 2 }}
                    title="Annotated"
                  >
                    A
                  </span>
                )}

                {/* Delete button — visible on hover */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onRemove(i); }}
                  className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-black/55 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-fast focus:outline-none focus-visible:opacity-100"
                  aria-label={`Delete screenshot ${i + 1}`}
                >
                  <svg width="7" height="7" viewBox="0 0 10 10" aria-hidden="true">
                    <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            );
          })}

          {/* Add more button */}
          {items.length < MAX_SCREENSHOTS && (
            <button
              type="button"
              onClick={onCapture}
              disabled={isCapturing}
              className="shrink-0 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-mat-outline text-mat-muted hover:border-mat-primary hover:text-mat-primary transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-mat-primary disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ width: 84, height: 60 }}
              aria-label="Capture another screenshot"
            >
              {isCapturing ? (
                <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <>
                  <CameraIcon size={14} />
                  <span style={{ fontSize: 10 }} className="font-semibold leading-none">Add more</span>
                </>
              )}
            </button>
          )}
        </div>

        {error && <ErrorHint error={error} />}

        <p className="text-2xs text-mat-muted">
          {items.length} / {MAX_SCREENSHOTS} screenshot{items.length !== 1 ? 's' : ''} — click to zoom or annotate
        </p>
      </div>

      {/* Viewer modal */}
      {viewingItem && viewingIndex !== null && (
        <ScreenshotViewer
          result={viewingItem.result}
          displayUrl={viewingItem.annotated ?? viewingItem.result.dataUrl}
          onClose={() => setViewingIndex(null)}
          onAnnotate={() => openAnnotate(viewingIndex)}
          onDelete={() => { setViewingIndex(null); onRemove(viewingIndex); }}
        />
      )}

      {/* Annotation editor */}
      {annotatingItem && annotatingIndex !== null && (
        <AnnotationEditor
          isOpen={true}
          dataUrl={annotatingItem.result.dataUrl}
          originalWidth={annotatingItem.result.width}
          originalHeight={annotatingItem.result.height}
          onSave={handleAnnotateSave}
          onClose={() => setAnnotatingIndex(null)}
        />
      )}
    </>
  );
}

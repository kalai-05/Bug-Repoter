import { useCallback, useEffect, useRef, useState } from 'react';
import type { ScreenshotResult } from '../../types/screenshot.types';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 5;
const BUTTON_STEP = 0.25;
const WHEEL_STEP = 0.08;

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface ScreenshotViewerProps {
  result: ScreenshotResult;
  /** Override the displayed image (e.g. annotated version) */
  displayUrl?: string;
  onClose: () => void;
  onRetake?: () => void;
  onDelete: () => void;
  onAnnotate?: () => void;
}

export function ScreenshotViewer({ result, displayUrl, onClose, onRetake, onDelete, onAnnotate }: ScreenshotViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [withTransition, setWithTransition] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startY: 0, panX: 0, panY: 0 });

  const canPan = zoom > 1;

  const resetView = useCallback(() => {
    setWithTransition(true);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => {
    setWithTransition(true);
    setZoom(z => clamp(z + BUTTON_STEP, MIN_ZOOM, MAX_ZOOM));
  }, []);

  const zoomOut = useCallback(() => {
    setWithTransition(true);
    setZoom(z => clamp(z - BUTTON_STEP, MIN_ZOOM, MAX_ZOOM));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetView();
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, zoomIn, zoomOut, resetView]);

  // Scroll-wheel zoom (non-passive to prevent page scroll)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setWithTransition(false);
      const delta = e.deltaY > 0 ? -WHEEL_STEP : WHEEL_STEP;
      setZoom(z => clamp(z + delta, MIN_ZOOM, MAX_ZOOM));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canPan) return;
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    setWithTransition(false);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const { startX, startY, panX, panY } = dragRef.current;
    setPan({
      x: panX + (e.clientX - startX),
      y: panY + (e.clientY - startY),
    });
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: '#0E0E18' }}
      role="dialog"
      aria-modal="true"
      aria-label="Screenshot viewer"
    >
      {/* ── Header ── */}
      <header
        className="flex items-center h-11 px-3 gap-2 shrink-0"
        style={{ background: '#18182A', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <button
          onClick={onClose}
          title="Close (Esc)"
          className="flex items-center justify-center w-7 h-7 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <span className="text-sm font-semibold text-white/90 flex-1">Screenshot</span>

        {/* Zoom controls */}
        <div
          className="flex items-center rounded-lg overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <button
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            title="Zoom out (−)"
            className="flex items-center justify-center w-7 h-7 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors font-bold text-base leading-none"
          >
            −
          </button>
          <button
            onClick={resetView}
            title="Reset zoom (0)"
            className="min-w-[52px] h-7 text-xs font-mono font-semibold text-white/80 hover:text-white transition-colors"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            title="Zoom in (+)"
            className="flex items-center justify-center w-7 h-7 text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-colors font-bold text-base leading-none"
          >
            +
          </button>
        </div>
      </header>

      {/* ── Image area ── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden flex items-center justify-center select-none relative"
        style={{ cursor: canPan ? 'grab' : 'default' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={resetView}
      >
        <img
          src={displayUrl ?? result.dataUrl}
          alt={`Screenshot${result.width > 0 ? ` — ${result.width} × ${result.height}` : ''}`}
          draggable={false}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'block',
            pointerEvents: 'none',
            userSelect: 'none',
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transition: withTransition ? 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)' : 'none',
          }}
        />

        {zoom !== 1 && (
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full text-xs pointer-events-none whitespace-nowrap"
            style={{ background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.45)' }}
          >
            Double-click to reset
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer
        className="flex items-center h-12 px-3 gap-3 shrink-0"
        style={{ background: '#18182A', borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Annotate */}
        {onAnnotate && (
          <button
            onClick={onAnnotate}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 active:opacity-70 shrink-0"
            style={{ background: '#5B5FCF' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Annotate
          </button>
        )}

        {/* Retake */}
        {onRetake && (
          <button
            onClick={onRetake}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold shrink-0 transition-colors"
            style={{ color: 'rgba(255,255,255,0.6)', background: 'rgba(255,255,255,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            Retake
          </button>
        )}

        {/* Metadata */}
        <div className="flex-1 flex items-center justify-center gap-1.5 overflow-hidden">
          {result.width > 0 && (
            <>
              <span className="text-xs tabular-nums truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {result.width}×{result.height}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
            </>
          )}
          <span className="text-xs shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {formatBytes(result.sizeBytes)}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <span className="text-xs font-medium shrink-0" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {result.format.toUpperCase()}
          </span>
        </div>

        {/* Delete */}
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold transition-colors shrink-0"
          style={{ color: '#FB7185', background: 'rgba(251,113,133,0.12)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,113,133,0.22)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(251,113,133,0.12)'; }}
        >
          <svg
            width="12"
            height="12"
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
          Delete
        </button>
      </footer>
    </div>
  );
}

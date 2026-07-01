import { useRef, useEffect, useMemo, useCallback } from 'react';
import { useAnnotation } from './useAnnotation';
import { renderAnnotation, exportAnnotatedImage } from './drawUtils';
import { PRESET_COLORS, STROKE_THIN, STROKE_THICK } from './types';
import type { AnnotationTool } from './types';

// ─── Layout constants ─────────────────────────────────────────────────────────

const HEADER_H = 48;
const TOOLBAR_H = 104;
const H_PAD = 8;
const MAX_CANVAS_W = 420 - H_PAD * 2;
const MAX_CANVAS_H = 640 - HEADER_H - TOOLBAR_H - H_PAD * 2;

// ─── SVG icons ────────────────────────────────────────────────────────────────

const Icons = {
  arrow: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5 3h16v16l-5.586-5.586L9.828 19l-1.414-1.414 5.586-5.586L5 3z" />
    </svg>
  ),
  rectangle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="1" />
    </svg>
  ),
  circle: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="9" ry="7" />
    </svg>
  ),
  highlight: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15.5 3.5L20.5 8.5L9 20H4V15L15.5 3.5Z" opacity="0.6" />
      <path d="M4 20h16v2H4z" />
    </svg>
  ),
  text: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M5 4v3h5.5v12h3V7H19V4H5z" />
    </svg>
  ),
  undo: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  ),
  redo: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13" />
    </svg>
  ),
  clear: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  ),
  download: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  close: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  save: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// ─── Small components ─────────────────────────────────────────────────────────

const TOOL_LABELS: Record<AnnotationTool, string> = {
  arrow: 'Arrow',
  rectangle: 'Rect',
  circle: 'Circle',
  highlight: 'Hi-lite',
  text: 'Text',
};

const TOOLS: AnnotationTool[] = ['arrow', 'rectangle', 'circle', 'highlight', 'text'];

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AnnotationEditorProps {
  isOpen: boolean;
  dataUrl: string;
  originalWidth: number;
  originalHeight: number;
  onSave: (annotatedDataUrl: string) => void;
  onClose: () => void;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AnnotationEditor({
  isOpen,
  dataUrl,
  originalWidth,
  originalHeight,
  onSave,
  onClose,
}: AnnotationEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imgReadyRef = useRef(false);

  const {
    tool,
    color,
    strokeWidth,
    annotations,
    activeAnnotation,
    textInput,
    canUndo,
    canRedo,
    setTool,
    setColor,
    setStrokeWidth,
    startDraw,
    continueDraw,
    endDraw,
    cancelDraw,
    updateTextValue,
    commitText,
    cancelText,
    undo,
    redo,
    clear,
  } = useAnnotation();

  // ── Canvas display size ────────────────────────────────────────────────────
  const { displayW, displayH } = useMemo(() => {
    if (!originalWidth || !originalHeight) return { displayW: 320, displayH: 180 };
    const scale = Math.min(
      MAX_CANVAS_W / originalWidth,
      MAX_CANVAS_H / originalHeight,
      1,
    );
    return {
      displayW: Math.round(originalWidth * scale),
      displayH: Math.round(originalHeight * scale),
    };
  }, [originalWidth, originalHeight]);

  // ── Load background image once ─────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    imgReadyRef.current = false;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      imgReadyRef.current = true;
      redraw();
    };
    img.src = dataUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, dataUrl]);

  // ── Redraw canvas ──────────────────────────────────────────────────────────
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgReadyRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, displayW, displayH);
    ctx.drawImage(img, 0, 0, displayW, displayH);

    for (const ann of annotations) renderAnnotation(ctx, ann);
    if (activeAnnotation) renderAnnotation(ctx, activeAnnotation);
  }, [annotations, activeAnnotation, displayW, displayH]);

  useEffect(() => {
    if (isOpen) redraw();
  }, [isOpen, redraw]);

  // ── Auto-focus text input ──────────────────────────────────────────────────
  useEffect(() => {
    if (textInput) textInputRef.current?.focus();
  }, [textInput]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const inText = active instanceof HTMLInputElement;

      if (e.key === 'Escape') {
        if (inText) { cancelText(); return; }
        cancelDraw();
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === 'y' || (e.shiftKey && e.key === 'z'))
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, cancelDraw, cancelText, onClose, undo, redo]);

  // ── Pointer helpers ────────────────────────────────────────────────────────
  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    startDraw(getPoint(e));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.buttons === 0) return;
    continueDraw(getPoint(e));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    endDraw(getPoint(e));
  };

  // ── Save / download ────────────────────────────────────────────────────────
  const getExportUrl = useCallback(() => {
    const img = imgRef.current;
    if (!img) return dataUrl;
    return exportAnnotatedImage(img, annotations, displayW, displayH, originalWidth, originalHeight);
  }, [annotations, dataUrl, displayW, displayH, originalWidth, originalHeight]);

  const handleSave = () => {
    onSave(getExportUrl());
    onClose();
  };

  const handleDownload = () => {
    const url = getExportUrl();
    const a = document.createElement('a');
    a.href = url;
    a.download = `annotated_${Date.now()}.png`;
    a.click();
  };

  // ── Cursor ─────────────────────────────────────────────────────────────────
  const cursor =
    tool === 'text' ? 'text'
    : tool === 'arrow' ? 'crosshair'
    : 'crosshair';

  if (!isOpen) return null;

  // ── Toolbar helpers ────────────────────────────────────────────────────────
  const toolBtn = (t: AnnotationTool) => (
    <button
      key={t}
      type="button"
      onClick={() => setTool(t)}
      title={TOOL_LABELS[t]}
      className={[
        'flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-semibold',
        'transition-colors select-none',
        tool === t
          ? 'bg-indigo-500 text-white'
          : 'text-gray-300 hover:bg-white/10',
      ].join(' ')}
    >
      {Icons[t]}
      <span>{TOOL_LABELS[t]}</span>
    </button>
  );

  const colorBtn = (c: string) => (
    <button
      key={c}
      type="button"
      onClick={() => setColor(c)}
      title={c}
      className="w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none"
      style={{
        background: c,
        outline: color === c ? '2px solid white' : '2px solid transparent',
        outlineOffset: 2,
      }}
    />
  );

  const actionBtn = (
    label: string,
    icon: React.ReactNode,
    onClick: () => void,
    disabled = false,
  ) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="flex flex-col items-center justify-center gap-0.5 px-2 h-full text-[10px] font-semibold text-gray-300 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-[#111113]"
      role="dialog"
      aria-label="Screenshot annotation editor"
    >
      {/* ── Header ── */}
      <div
        className="flex items-center gap-3 px-3 shrink-0 border-b border-white/10"
        style={{ height: HEADER_H }}
      >
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Close editor"
        >
          {Icons.close}
        </button>
        <p className="flex-1 text-sm font-semibold text-white text-center">
          Annotate Screenshot
        </p>
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold transition-colors"
        >
          {Icons.save}
          Save
        </button>
      </div>

      {/* ── Canvas area ── */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div className="relative" style={{ width: displayW, height: displayH }}>
          <canvas
            ref={canvasRef}
            width={displayW}
            height={displayH}
            style={{
              display: 'block',
              cursor,
              touchAction: 'none',
              // Disable pointer events on canvas when text input is active
              pointerEvents: textInput ? 'none' : 'auto',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={cancelDraw}
          />

          {/* Floating text input for the text tool */}
          {textInput && (
            <input
              ref={textInputRef}
              type="text"
              value={textInput.value}
              onChange={(e) => updateTextValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); commitText(); }
                if (e.key === 'Escape') { e.preventDefault(); cancelText(); }
              }}
              onBlur={commitText}
              style={{
                position: 'absolute',
                left: textInput.point.x,
                top: textInput.point.y - 16,
                background: 'rgba(0,0,0,0.25)',
                border: 'none',
                outline: `1px dashed ${color}`,
                color,
                fontSize: 14,
                fontWeight: 'bold',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                minWidth: 80,
                padding: '2px 4px',
                lineHeight: '1.4',
              }}
            />
          )}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div
        className="shrink-0 flex flex-col border-t border-white/10"
        style={{ height: TOOLBAR_H }}
      >
        {/* Row 1 — tools */}
        <div className="flex h-[52px] border-b border-white/10">
          {TOOLS.map(toolBtn)}
        </div>

        {/* Row 2 — colors + stroke + actions */}
        <div className="flex items-center gap-2 px-3 flex-1">
          {/* Color swatches */}
          <div className="flex items-center gap-1.5">
            {PRESET_COLORS.map(colorBtn)}
          </div>

          <div className="w-px h-5 bg-white/15 mx-1" />

          {/* Stroke width */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setStrokeWidth(STROKE_THIN)}
              title="Thin stroke"
              className={[
                'flex items-center justify-center w-7 h-7 rounded transition-colors',
                strokeWidth === STROKE_THIN ? 'bg-white/20 text-white' : 'text-gray-400 hover:bg-white/10',
              ].join(' ')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setStrokeWidth(STROKE_THICK)}
              title="Thick stroke"
              className={[
                'flex items-center justify-center w-7 h-7 rounded transition-colors',
                strokeWidth === STROKE_THICK ? 'bg-white/20 text-white' : 'text-gray-400 hover:bg-white/10',
              ].join(' ')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="w-px h-5 bg-white/15 mx-1" />

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 ml-auto">
            {actionBtn('Undo', Icons.undo, undo, !canUndo)}
            {actionBtn('Redo', Icons.redo, redo, !canRedo)}
            {actionBtn('Clear', Icons.clear, clear, annotations.length === 0)}
            {actionBtn('Download', Icons.download, handleDownload)}
          </div>
        </div>
      </div>
    </div>
  );
}

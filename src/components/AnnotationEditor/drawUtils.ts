import type { Annotation, Point } from './types';
import { HIGHLIGHT_ALPHA } from './types';

// ─── Individual shape renderers ───────────────────────────────────────────────

function drawArrow(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  color: string,
  width: number,
): void {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.sqrt(dx * dx + dy * dy) < 2) return;

  const angle = Math.atan2(dy, dx);
  const headLen = Math.max(10, width * 4);

  // Shorten shaft so it doesn't overlap the filled head
  const shaftTip: Point = {
    x: to.x - headLen * 0.75 * Math.cos(angle),
    y: to.y - headLen * 0.75 * Math.sin(angle),
  };

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(shaftTip.x, shaftTip.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(
    to.x - headLen * Math.cos(angle - Math.PI / 7),
    to.y - headLen * Math.sin(angle - Math.PI / 7),
  );
  ctx.lineTo(
    to.x - headLen * Math.cos(angle + Math.PI / 7),
    to.y - headLen * Math.sin(angle + Math.PI / 7),
  );
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawRectangle(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  color: string,
  width: number,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.rect(from.x, from.y, to.x - from.x, to.y - from.y);
  ctx.stroke();
  ctx.restore();
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  color: string,
  width: number,
): void {
  const rx = Math.abs(to.x - from.x) / 2;
  const ry = Math.abs(to.y - from.y) / 2;
  if (rx < 1 || ry < 1) return;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.ellipse((from.x + to.x) / 2, (from.y + to.y) / 2, rx, ry, 0, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.restore();
}

function drawHighlight(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
): void {
  const w = to.x - from.x;
  const h = to.y - from.y;
  if (Math.abs(w) < 2 || Math.abs(h) < 2) return;

  ctx.save();
  ctx.globalAlpha = HIGHLIGHT_ALPHA;
  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.rect(from.x, from.y, w, h);
  ctx.fill();
  ctx.restore();
}

function drawText(
  ctx: CanvasRenderingContext2D,
  point: Point,
  text: string,
  color: string,
  fontSize: number,
): void {
  if (!text.trim()) return;
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;
  // Thin drop-shadow makes text legible over any background
  ctx.shadowColor = color === '#FFFFFF' ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.fillText(text, point.x, point.y);
  ctx.restore();
}

// ─── Dispatch ─────────────────────────────────────────────────────────────────

export function renderAnnotation(
  ctx: CanvasRenderingContext2D,
  ann: Annotation,
): void {
  switch (ann.tool) {
    case 'arrow':
      drawArrow(ctx, ann.start, ann.end, ann.color, ann.strokeWidth);
      break;
    case 'rectangle':
      drawRectangle(ctx, ann.start, ann.end, ann.color, ann.strokeWidth);
      break;
    case 'circle':
      drawCircle(ctx, ann.start, ann.end, ann.color, ann.strokeWidth);
      break;
    case 'highlight':
      drawHighlight(ctx, ann.start, ann.end);
      break;
    case 'text':
      if (ann.text) drawText(ctx, ann.start, ann.text, ann.color, ann.fontSize ?? 14);
      break;
  }
}

// ─── Full-resolution export ───────────────────────────────────────────────────

/**
 * Render the annotated screenshot at the original image resolution.
 * Annotation coordinates (stored in display-canvas space) are scaled up.
 */
export function exportAnnotatedImage(
  img: HTMLImageElement,
  annotations: Annotation[],
  displayW: number,
  displayH: number,
  origW: number,
  origH: number,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = origW;
  canvas.height = origH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return img.src;

  ctx.drawImage(img, 0, 0, origW, origH);

  const sx = origW / displayW;
  const sy = origH / displayH;
  const uniformScale = Math.min(sx, sy);

  for (const ann of annotations) {
    renderAnnotation(ctx, {
      ...ann,
      start: { x: ann.start.x * sx, y: ann.start.y * sy },
      end: { x: ann.end.x * sx, y: ann.end.y * sy },
      strokeWidth: ann.strokeWidth * uniformScale,
      ...(ann.fontSize !== undefined ? { fontSize: ann.fontSize * uniformScale } : {}),
    });
  }

  return canvas.toDataURL('image/png');
}

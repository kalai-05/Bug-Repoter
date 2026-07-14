import type { BugPriority } from '../types';

export function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}

export function formatDateDisplay(timestampOrIso: string): string {
  const n = Number(timestampOrIso);
  const date = Number.isFinite(n) ? new Date(n) : new Date(timestampOrIso);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

export function parseTags(tagString: string): string[] {
  return tagString
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

export function priorityLabel(priority: BugPriority): string {
  const labels: Record<BugPriority, string> = {
    urgent: 'Urgent',
    high: 'High',
    normal: 'Normal',
    low: 'Low',
  };
  return labels[priority];
}

export function buildScreenshotFilename(pageTitle: string, index?: number): string {
  const sanitized = pageTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const timestamp = Date.now();
  const suffix = index !== undefined ? `_${index}` : '';
  return `bug_screenshot_${sanitized}${suffix}_${timestamp}.png`;
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const header = parts[0] ?? '';
  const base64 = parts[1] ?? '';
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch?.[1] ?? 'image/png';
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

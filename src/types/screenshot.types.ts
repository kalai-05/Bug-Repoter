/* ── Capture options ────────────────────────────────────────── */

export type ScreenshotFormat = 'png' | 'jpeg';

export interface ScreenshotCaptureOptions {
  format?: ScreenshotFormat;
  /** 0–100, only applied when format is 'jpeg' */
  quality?: number;
}

/* ── Successful result ──────────────────────────────────────── */

export interface ScreenshotItem {
  result: ScreenshotResult;
  /** Annotated PNG data URL, set after user saves in the annotation editor */
  annotated: string | null;
}

export interface ScreenshotResult {
  /** Full data URL: data:image/png;base64,<base64> */
  dataUrl: string;
  /** Raw base64 string (everything after the comma in the data URL) */
  base64: string;
  format: ScreenshotFormat;
  mimeType: string;
  /** Approximate file size in bytes, derived from base64 length */
  sizeBytes: number;
  width: number;
  height: number;
  /** ISO 8601 capture timestamp */
  timestamp: string;
}

/* ── Typed error codes ──────────────────────────────────────── */

export type ScreenshotErrorCode =
  | 'PERMISSION_DENIED'
  | 'TAB_NOT_CAPTURABLE'
  | 'WINDOW_NOT_FOCUSED'
  | 'CAPTURE_FAILED'
  | 'INVALID_RESPONSE'
  | 'UNKNOWN';

/**
 * Plain serializable shape used when crossing the message boundary
 * (popup ↔ background). Classes with methods can't be JSON-serialized.
 */
export interface SerializedScreenshotError {
  code: ScreenshotErrorCode;
  message: string;
}

/* ── Error class (used inside each context, not sent raw over IPC) ── */

export class ScreenshotCaptureError extends Error {
  readonly code: ScreenshotErrorCode;

  constructor(code: ScreenshotErrorCode, message: string) {
    super(message);
    this.name = 'ScreenshotCaptureError';
    this.code = code;
    // Restore prototype chain broken by transpilers
    Object.setPrototypeOf(this, ScreenshotCaptureError.prototype);
  }

  /** Human-readable message safe to display in the UI */
  get userMessage(): string {
    switch (this.code) {
      case 'PERMISSION_DENIED':
        return 'Screenshot permission denied. Grant the extension access to capture tabs.';
      case 'TAB_NOT_CAPTURABLE':
        return 'This page cannot be captured. Navigate to a regular web page and try again.';
      case 'WINDOW_NOT_FOCUSED':
        return 'The browser window must be in focus to capture a screenshot.';
      case 'CAPTURE_FAILED':
        return 'Screenshot capture failed. Please try again.';
      case 'INVALID_RESPONSE':
        return 'Received an invalid response from the extension background.';
      default:
        return 'An unexpected error occurred during screenshot capture.';
    }
  }

  /** Serialize to a plain object so it can cross the chrome.runtime.sendMessage boundary */
  serialize(): SerializedScreenshotError {
    return { code: this.code, message: this.message };
  }

  /** Reconstruct from a plain serialized object (called in popup context) */
  static fromSerialized(err: SerializedScreenshotError): ScreenshotCaptureError {
    return new ScreenshotCaptureError(err.code, err.message);
  }

  static isSerializedError(value: unknown): value is SerializedScreenshotError {
    return (
      typeof value === 'object' &&
      value !== null &&
      'code' in value &&
      'message' in value &&
      typeof (value as SerializedScreenshotError).code === 'string' &&
      typeof (value as SerializedScreenshotError).message === 'string'
    );
  }
}

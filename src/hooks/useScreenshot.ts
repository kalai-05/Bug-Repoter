import { useState, useCallback } from 'react';
import { captureScreenshot } from '../utils/chrome.utils';
import { notifyScreenshotCaptured } from '../utils/notifications.utils';
import { ScreenshotCaptureError } from '../types/screenshot.types';
import type { ScreenshotResult } from '../types/screenshot.types';

export interface UseScreenshotReturn {
  /** Full structured result including base64, dimensions, size, and timestamp */
  result: ScreenshotResult | null;
  /** Convenience accessor: result?.dataUrl ?? null */
  screenshot: string | null;
  /** Annotated PNG data URL, set after user saves from the annotation editor */
  annotated: string | null;
  setAnnotated: (url: string | null) => void;
  isCapturing: boolean;
  /** Typed error — check .code for PERMISSION_DENIED, TAB_NOT_CAPTURABLE, etc. */
  error: ScreenshotCaptureError | null;
  capture: () => Promise<void>;
  clear: () => void;
}

export function useScreenshot(): UseScreenshotReturn {
  const [result, setResult] = useState<ScreenshotResult | null>(null);
  const [annotated, setAnnotated] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<ScreenshotCaptureError | null>(null);

  const capture = useCallback(async () => {
    setIsCapturing(true);
    setError(null);
    setAnnotated(null);

    try {
      const screenshotResult = await captureScreenshot();
      setResult(screenshotResult);
      notifyScreenshotCaptured();
    } catch (err) {
      // Always surface a ScreenshotCaptureError so the UI gets typed codes.
      if (err instanceof ScreenshotCaptureError) {
        setError(err);
      } else {
        setError(
          new ScreenshotCaptureError(
            'UNKNOWN',
            err instanceof Error ? err.message : 'Screenshot capture failed',
          ),
        );
      }
    } finally {
      setIsCapturing(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
    setAnnotated(null);
  }, []);

  return {
    result,
    screenshot: result?.dataUrl ?? null,
    annotated,
    setAnnotated,
    isCapturing,
    error,
    capture,
    clear,
  };
}

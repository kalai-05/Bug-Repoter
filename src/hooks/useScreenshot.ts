import { useState, useCallback } from 'react';
import { captureScreenshot } from '../utils/chrome.utils';
import { notifyScreenshotCaptured } from '../utils/notifications.utils';
import { ScreenshotCaptureError } from '../types/screenshot.types';
import type { ScreenshotItem } from '../types/screenshot.types';

const MAX_SCREENSHOTS = 5;

export interface UseScreenshotReturn {
  items: ScreenshotItem[];
  isCapturing: boolean;
  error: ScreenshotCaptureError | null;
  capture: () => Promise<void>;
  removeItem: (index: number) => void;
  clearAll: () => void;
  setAnnotated: (index: number, url: string | null) => void;
}

export function useScreenshot(): UseScreenshotReturn {
  const [items, setItems] = useState<ScreenshotItem[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<ScreenshotCaptureError | null>(null);

  const capture = useCallback(async () => {
    setItems((prev) => {
      if (prev.length >= MAX_SCREENSHOTS) return prev;
      return prev;
    });

    setIsCapturing(true);
    setError(null);

    try {
      const result = await captureScreenshot();
      setItems((prev) => {
        if (prev.length >= MAX_SCREENSHOTS) return prev;
        return [...prev, { result, annotated: null }];
      });
      notifyScreenshotCaptured();
    } catch (err) {
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

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
    setError(null);
  }, []);

  const setAnnotated = useCallback((index: number, url: string | null) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, annotated: url } : item)),
    );
  }, []);

  return { items, isCapturing, error, capture, removeItem, clearAll, setAnnotated };
}

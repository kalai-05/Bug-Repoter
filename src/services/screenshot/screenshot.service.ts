import {
  ScreenshotCaptureError,
  type ScreenshotCaptureOptions,
  type ScreenshotFormat,
  type ScreenshotResult,
} from '../../types/screenshot.types';

class ScreenshotService {
  /**
   * Captures the currently visible browser tab and returns a structured result.
   *
   * Must be called from the background service worker — Chrome only allows
   * chrome.tabs.captureVisibleTab() in that context (not from the popup).
   */
  async captureVisibleTab(options: ScreenshotCaptureOptions = {}): Promise<ScreenshotResult> {
    const format: ScreenshotFormat = options.format ?? 'png';

    const captureOptions: chrome.tabs.CaptureVisibleTabOptions = {
      format,
      ...(format === 'jpeg' ? { quality: options.quality ?? 90 } : {}),
    };

    const dataUrl = await this.capture(captureOptions);

    this.assertValidDataUrl(dataUrl, format);

    const base64 = this.extractBase64(dataUrl);
    const sizeBytes = this.calculateSizeBytes(base64);
    const { width, height } = await this.measureDimensions(dataUrl, format);

    return {
      dataUrl,
      base64,
      format,
      mimeType: `image/${format}`,
      sizeBytes,
      width,
      height,
      timestamp: new Date().toISOString(),
    };
  }

  // ── Private methods ────────────────────────────────────────────

  /**
   * Wraps chrome.tabs.captureVisibleTab in a Promise and maps Chrome's
   * callback-style API + lastError pattern to a proper async/await throw.
   */
  private capture(options: chrome.tabs.CaptureVisibleTabOptions): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      chrome.tabs.captureVisibleTab(options, (dataUrl) => {
        if (chrome.runtime.lastError) {
          reject(this.mapChromeError(chrome.runtime.lastError.message));
          return;
        }
        if (!dataUrl) {
          reject(new ScreenshotCaptureError('CAPTURE_FAILED', 'captureVisibleTab returned an empty data URL'));
          return;
        }
        resolve(dataUrl);
      });
    });
  }

  /**
   * Measures image dimensions in the service worker context.
   *
   * createImageBitmap() is part of the Web API and IS available in MV3
   * service workers — unlike document.createElement('canvas') which is DOM.
   * We reconstruct a Blob from the base64 data to avoid fetch() on data: URLs,
   * which can behave inconsistently across Chrome versions.
   */
  private async measureDimensions(
    dataUrl: string,
    format: ScreenshotFormat,
  ): Promise<{ width: number; height: number }> {
    try {
      const blob = this.dataUrlToBlob(dataUrl, `image/${format}`);
      const bitmap = await createImageBitmap(blob);
      const { width, height } = bitmap;
      bitmap.close();
      return { width, height };
    } catch {
      // Dimension measurement is non-critical — return zeros rather than
      // failing the entire capture.
      return { width: 0, height: 0 };
    }
  }

  /**
   * Converts a base64 data URL to a Blob without using fetch().
   * Safe to call in service workers (no DOM dependency).
   */
  private dataUrlToBlob(dataUrl: string, mimeType: string): Blob {
    const base64 = this.extractBase64(dataUrl);
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type: mimeType });
  }

  /**
   * Maps Chrome's untyped runtime error messages to our typed error codes.
   * These message strings are documented (Chrome source) and stable.
   */
  private mapChromeError(message?: string): ScreenshotCaptureError {
    if (!message) {
      return new ScreenshotCaptureError('UNKNOWN', 'An unknown error occurred during capture');
    }

    const lower = message.toLowerCase();

    if (
      lower.includes('permission') ||
      lower.includes('not granted') ||
      lower.includes('access denied')
    ) {
      return new ScreenshotCaptureError('PERMISSION_DENIED', message);
    }

    if (
      lower.includes('cannot be captured') ||
      lower.includes("couldn't be captured") ||
      lower.includes('internal pages') ||
      lower.includes('chrome://') ||
      lower.includes('chrome-extension://') ||
      lower.includes('devtools') ||
      lower.includes('cannot capture')
    ) {
      return new ScreenshotCaptureError(
        'TAB_NOT_CAPTURABLE',
        `Page cannot be captured: ${message}`,
      );
    }

    if (lower.includes('window') && lower.includes('focus')) {
      return new ScreenshotCaptureError('WINDOW_NOT_FOCUSED', message);
    }

    return new ScreenshotCaptureError('CAPTURE_FAILED', message);
  }

  /** Validates that the returned data URL actually looks like an image. */
  private assertValidDataUrl(dataUrl: string, format: ScreenshotFormat): void {
    const expected = `data:image/${format};base64,`;
    if (!dataUrl.startsWith(expected)) {
      throw new ScreenshotCaptureError(
        'INVALID_RESPONSE',
        `Expected a ${format.toUpperCase()} data URL but received: ${dataUrl.slice(0, 40)}`,
      );
    }
  }

  /** Strips the `data:<mime>;base64,` prefix, leaving the raw base64 string. */
  private extractBase64(dataUrl: string): string {
    const commaIdx = dataUrl.indexOf(',');
    return commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
  }

  /**
   * Approximates the byte size from a base64-encoded string.
   * Formula: floor(length × 3/4) − padding bytes
   */
  private calculateSizeBytes(base64: string): number {
    const paddingMatch = base64.match(/=+$/);
    const paddingChars = paddingMatch?.[0]?.length ?? 0;
    return Math.floor((base64.length * 3) / 4) - paddingChars;
  }
}

export const screenshotService = new ScreenshotService();

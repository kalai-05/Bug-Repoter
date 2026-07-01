import { ScreenshotCaptureError } from '../types/screenshot.types';
import type {
  ChromeMessage,
  ChromeMessageResponse,
  MessageType,
  PageMetadataResponse,
  CaptureScreenshotResponse,
} from '../types';

export async function sendMessageToBackground<TPayload, TResponse>(
  type: MessageType,
  payload?: TPayload | undefined,
): Promise<ChromeMessageResponse<TResponse>> {
  const message: ChromeMessage<TPayload | undefined> = { type, payload };
  return chrome.runtime.sendMessage<
    ChromeMessage<TPayload | undefined>,
    ChromeMessageResponse<TResponse>
  >(message);
}

export async function sendMessageToActiveTab<TPayload, TResponse>(
  type: MessageType,
  payload?: TPayload | undefined,
): Promise<ChromeMessageResponse<TResponse>> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) throw new Error('No active tab found');
  const message: ChromeMessage<TPayload | undefined> = { type, payload };
  return chrome.tabs.sendMessage<
    ChromeMessage<TPayload | undefined>,
    ChromeMessageResponse<TResponse>
  >(tab.id, message);
}

/**
 * Requests a screenshot from the background service worker and returns the
 * full ScreenshotResult. Throws a ScreenshotCaptureError with a typed
 * error code on any failure, so callers can distinguish permission errors
 * from uncapturable pages.
 */
export async function captureScreenshot(): Promise<CaptureScreenshotResponse> {
  const response = await sendMessageToBackground<undefined, CaptureScreenshotResponse>(
    'CAPTURE_SCREENSHOT',
  );

  if (response.success && response.data) {
    return response.data;
  }

  // Reconstruct the typed error from the serialized detail if present.
  if (response.errorDetail) {
    throw ScreenshotCaptureError.fromSerialized(response.errorDetail);
  }

  // Fall back to a generic CAPTURE_FAILED error using the error string.
  throw new ScreenshotCaptureError(
    'CAPTURE_FAILED',
    response.error ?? 'Screenshot capture failed',
  );
}

export async function getPageMetadata(): Promise<PageMetadataResponse> {
  const response = await sendMessageToActiveTab<undefined, PageMetadataResponse>(
    'GET_PAGE_METADATA',
  );
  if (!response.success || !response.data) {
    throw new Error(response.error ?? 'Failed to get page metadata');
  }
  return response.data;
}

export function getActiveTabUrl(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(tab?.url ?? '');
    });
  });
}

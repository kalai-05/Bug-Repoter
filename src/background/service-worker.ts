import { screenshotService } from '../services/screenshot/screenshot.service';
import { ScreenshotCaptureError } from '../types/screenshot.types';
import type {
  ChromeMessage,
  ChromeMessageResponse,
  CaptureScreenshotResponse,
} from '../types';

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    void chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  }
});

chrome.runtime.onMessage.addListener(
  (
    message: ChromeMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ChromeMessageResponse) => void,
  ) => {
    if (message.type === 'CAPTURE_SCREENSHOT') {
      handleCapture(sendResponse);
      // Return true to signal that sendResponse will be called asynchronously
      return true;
    }

    if (message.type === 'PING') {
      sendResponse({ success: true, data: 'pong' });
      return false;
    }

    return false;
  },
);

/**
 * Captures the visible tab and sends the structured result back to the popup.
 *
 * Error handling: ScreenshotCaptureError is serialized to a plain object
 * before being passed through sendResponse because class instances with
 * methods cannot be JSON-serialized across the chrome.runtime.sendMessage
 * boundary.
 */
async function handleCapture(
  sendResponse: (response: ChromeMessageResponse<CaptureScreenshotResponse>) => void,
): Promise<void> {
  try {
    const result = await screenshotService.captureVisibleTab({ format: 'png' });
    sendResponse({ success: true, data: result });
  } catch (err) {
    if (err instanceof ScreenshotCaptureError) {
      sendResponse({
        success: false,
        error: err.message,
        errorDetail: err.serialize(),
      });
    } else {
      const message = err instanceof Error ? err.message : 'Unexpected capture error';
      sendResponse({ success: false, error: message });
    }
  }
}

chrome.action.onClicked.addListener(() => {
  void chrome.action.openPopup();
});

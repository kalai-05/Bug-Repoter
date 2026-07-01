import type { ChromeMessage, ChromeMessageResponse, PageMetadataResponse } from '../types';

function getPageMetadata(): PageMetadataResponse {
  return {
    url: window.location.href,
    title: document.title,
    userAgent: navigator.userAgent,
  };
}

chrome.runtime.onMessage.addListener(
  (
    message: ChromeMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: ChromeMessageResponse<PageMetadataResponse>) => void,
  ) => {
    if (message.type === 'GET_PAGE_METADATA') {
      sendResponse({ success: true, data: getPageMetadata() });
      return false;
    }
    return false;
  },
);

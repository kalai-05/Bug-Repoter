const icon = () => chrome.runtime.getURL('icons/icon48.png');

function show(id: string, title: string, message: string): void {
  void chrome.notifications.create(id, {
    type: 'basic',
    iconUrl: icon(),
    title,
    message,
  });
}

export function notifyScreenshotCaptured(): void {
  show(`bug-reporter-screenshot-${Date.now()}`, 'Screenshot captured', 'Ready to annotate and submit your bug report.');
}

export function notifyUploadComplete(fileName: string): void {
  show(`bug-reporter-upload-ok-${Date.now()}`, 'Upload complete', `"${fileName}" saved to Google Drive.`);
}

export function notifyUploadFailed(reason?: string): void {
  show(
    `bug-reporter-upload-fail-${Date.now()}`,
    'Drive upload failed',
    reason ?? 'Screenshot will be attached to the task instead.',
  );
}

export function notifyTaskCreated(title: string, taskUrl: string): void {
  show(
    `bug-reporter-task-ok-${Date.now()}`,
    'Bug report submitted',
    `"${title}" created in ClickUp.\n${taskUrl}`,
  );
}

export function notifyTaskFailed(reason?: string): void {
  show(
    `bug-reporter-task-fail-${Date.now()}`,
    'Submission failed',
    reason ?? 'Could not create the task. Please try again.',
  );
}

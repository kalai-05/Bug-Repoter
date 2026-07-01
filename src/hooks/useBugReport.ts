import { useState, useCallback } from 'react';
import { clickUpService } from '../services/clickup/clickup.service';
import { historyService } from '../services/history.service';
import { ClickUpError } from '../types';
import { notifyTaskCreated, notifyTaskFailed } from '../utils/notifications.utils';
import { generateThumbnail } from '../utils/thumbnail.utils';
import { getPageMetadata } from '../utils/chrome.utils';
import { formatTimestamp } from '../utils/format.utils';
import { validateBugReport } from '../utils/validation.utils';
import { getStorageItem } from '../utils/storage.utils';
import type {
  BugReport,
  BugReportFormState,
  BugReportResult,
  BugStatus,
  BugPriority,
  BugType,
} from '../types';
import type { EnvironmentInfo } from '../types/environment.types';

const INITIAL_FORM: BugReportFormState = {
  title: '',
  description: '',
  stepsToReproduce: '',
  expectedResult: '',
  actualResult: '',
  priority: 'normal',
  bugType: 'functional',
  tags: [],
  assignees: [],
};

interface UseBugReportReturn {
  form: BugReportFormState;
  status: BugStatus;
  result: BugReportResult | null;
  error: string | null;
  updateField: <K extends keyof BugReportFormState>(field: K, value: BugReportFormState[K]) => void;
  submit: (screenshot: string | null, env?: EnvironmentInfo | null) => Promise<void>;
  reset: () => void;
}

export function useBugReport(): UseBugReportReturn {
  const [form, setForm] = useState<BugReportFormState>(INITIAL_FORM);
  const [status, setStatus] = useState<BugStatus>('idle');
  const [result, setResult] = useState<BugReportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof BugReportFormState>(field: K, value: BugReportFormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const submit = useCallback(
    async (screenshot: string | null, env: EnvironmentInfo | null = null) => {
      const { valid, errors } = validateBugReport(form);
      if (!valid) {
        setError(errors[0]?.message ?? 'Validation failed');
        return;
      }

      setStatus('submitting');
      setError(null);

      try {
        // Prefer env data (from chrome.tabs.query in popup) over content-script metadata.
        // Fall back to getPageMetadata() when env is unavailable.
        let pageUrl = env?.url ?? '';
        let pageTitle = env?.pageTitle ?? '';

        if (!pageUrl || !pageTitle) {
          try {
            const meta = await getPageMetadata();
            if (!pageUrl) pageUrl = meta.url;
            if (!pageTitle) pageTitle = meta.title;
          } catch {
            // Content script may not be injected on restricted pages — continue without it.
          }
        }

        const googleUser = await getStorageItem('googleUser');

        const report: BugReport = {
          title: form.title.trim(),
          description: form.description.trim(),
          stepsToReproduce: form.stepsToReproduce.trim(),
          expectedResult: form.expectedResult.trim(),
          actualResult: form.actualResult.trim(),
          priority: form.priority as BugPriority,
          bugType: form.bugType as BugType,
          pageUrl,
          pageTitle,
          userAgent: navigator.userAgent,
          screenshot,
          screenshotDriveUrl: null,
          timestamp: formatTimestamp(),
          tags: form.tags,
          assignees: form.assignees,
          environmentInfo: env,
          ...(googleUser ? { createdBy: googleUser.name ?? googleUser.email } : {}),
        };

        const reportResult = await clickUpService.submitBugReport(report);
        setResult(reportResult);
        setStatus('success');
        notifyTaskCreated(report.title, reportResult.taskUrl);

        // Save to local history — non-fatal if it fails
        try {
          const thumb = screenshot ? await generateThumbnail(screenshot) : null;
          await historyService.addEntry({
            id: crypto.randomUUID(),
            title: report.title,
            taskId: reportResult.taskId,
            taskUrl: reportResult.taskUrl,
            createdAt: reportResult.createdAt,
            screenshotUrl: reportResult.screenshotUrl,
            screenshotThumb: thumb,
          });
        } catch {
          // history save failure must never affect the success flow
        }
      } catch (err) {
        const message =
          err instanceof ClickUpError
            ? err.userMessage
            : err instanceof Error
              ? err.message
              : 'Submission failed. Please try again.';
        notifyTaskFailed(message);
        setError(message);
        setStatus('error');
      }
    },
    [form],
  );

  const reset = useCallback(() => {
    setForm(INITIAL_FORM);
    setStatus('idle');
    setResult(null);
    setError(null);
  }, []);

  return { form, status, result, error, updateField, submit, reset };
}

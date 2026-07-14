import { useEffect, useState } from 'react';
import { BugForm } from '../components/BugForm';
import { Header } from '../components/Header';
import { SuccessView } from './views/SuccessView';
import { ErrorView } from './views/ErrorView';
import { ConfigWarningView } from './views/ConfigWarningView';
import { HistoryView } from './views/HistoryView';
import { useBugReport } from '../hooks/useBugReport';
import { useScreenshot } from '../hooks/useScreenshot';
import { useEnvironment } from '../hooks/useEnvironment';
import { useAuth } from '../hooks/useAuth';
import { useClickUpFormData } from '../hooks/useClickUpFormData';
import { getStorageItem } from '../utils/storage.utils';
import type { Platform } from '../types/chrome.types';

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-mat-primary-container" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-mat-primary animate-spin" />
      </div>
      <p className="text-xs text-mat-muted font-medium">Loading…</p>
    </div>
  );
}

export function App() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
  const [platform, setPlatform] = useState<Platform>('clickup');
  const [showHistory, setShowHistory] = useState(false);

  const { user } = useAuth();
  const { form, status, result, error, updateField, submit, reset } = useBugReport();
  const {
    items: screenshotItems,
    isCapturing,
    error: screenshotError,
    capture,
    removeItem: removeScreenshot,
    clearAll: clearScreenshots,
    setAnnotated,
  } = useScreenshot();
  const { info: envInfo } = useEnvironment();
  const { tags: availableTags, members: availableMembers, isLoading: formDataLoading } =
    useClickUpFormData(platform === 'clickup');

  useEffect(() => {
    void (async () => {
      const p = (await getStorageItem('platform')) ?? 'clickup';
      setPlatform(p);

      let configured = false;
      if (p === 'clickup') {
        const config = await getStorageItem('clickupConfig');
        configured = Boolean(config?.apiToken && config.listId);
      } else if (p === 'jira') {
        const config = await getStorageItem('jiraConfig');
        configured = Boolean(config?.baseUrl && config.email && config.apiToken && config.projectKey);
      } else if (p === 'linear') {
        const config = await getStorageItem('linearConfig');
        configured = Boolean(config?.apiKey && config.teamId);
      }
      setIsConfigured(configured);
    })();
  }, []);

  const openSettings = () => void chrome.runtime.openOptionsPage();

  const renderBody = () => {
    if (isConfigured === null) return <LoadingSpinner />;
    if (!isConfigured) return <ConfigWarningView platform={platform} />;
    if (status === 'success' && result)
      return <SuccessView result={result} platform={platform} onReset={() => { reset(); clearScreenshots(); }} />;
    if (status === 'error' && error) return <ErrorView message={error} onRetry={reset} />;

    return (
      <BugForm
        platform={platform}
        form={form}
        screenshotItems={screenshotItems}
        isCapturing={isCapturing}
        screenshotError={screenshotError}
        isSubmitting={status === 'submitting'}
        availableTags={availableTags}
        availableMembers={availableMembers}
        formDataLoading={formDataLoading}
        onFieldChange={updateField}
        onCapture={capture}
        onRemoveScreenshot={removeScreenshot}
        onAnnotateScreenshot={setAnnotated}
        onSubmit={() => void submit(
          screenshotItems.map((item) => item.annotated ?? item.result.dataUrl),
          envInfo,
        )}
        onSettings={openSettings}
      />
    );
  };

  return (
    <div className="popup-root">
      <Header
        onSettingsClick={openSettings}
        onHistoryClick={() => setShowHistory((v) => !v)}
        showingHistory={showHistory}
        user={user}
        platform={platform}
      />
      <main className="flex-1 bg-mat-bg overflow-hidden">
        {showHistory ? <HistoryView /> : renderBody()}
      </main>
    </div>
  );
}

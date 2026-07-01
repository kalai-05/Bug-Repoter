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
  const [showHistory, setShowHistory] = useState(false);

  const { user } = useAuth();
  const { form, status, result, error, updateField, submit, reset } = useBugReport();
  const {
    result: screenshotResult,
    annotated,
    setAnnotated,
    isCapturing,
    error: screenshotError,
    capture,
    clear,
  } = useScreenshot();
  const { info: envInfo } = useEnvironment();
  const { tags: availableTags, members: availableMembers, isLoading: formDataLoading } = useClickUpFormData();

  useEffect(() => {
    void getStorageItem('clickupConfig').then((config) => {
      setIsConfigured(Boolean(config?.apiToken && config.listId));
    });
  }, []);

  const openSettings = () => void chrome.runtime.openOptionsPage();

  const renderBody = () => {
    if (isConfigured === null) return <LoadingSpinner />;
    if (!isConfigured) return <ConfigWarningView />;
    if (status === 'success' && result)
      return <SuccessView result={result} onReset={() => { reset(); clear(); }} />;
    if (status === 'error' && error) return <ErrorView message={error} onRetry={reset} />;

    return (
      <BugForm
        form={form}
        screenshotResult={screenshotResult}
        annotatedScreenshot={annotated}
        isCapturing={isCapturing}
        screenshotError={screenshotError}
        isSubmitting={status === 'submitting'}
        availableTags={availableTags}
        availableMembers={availableMembers}
        formDataLoading={formDataLoading}
        onFieldChange={updateField}
        onCapture={capture}
        onClearScreenshot={clear}
        onAnnotateScreenshot={setAnnotated}
        onSubmit={() => void submit(annotated ?? screenshotResult?.dataUrl ?? null, envInfo)}
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
      />
      <main className="flex-1 bg-mat-bg overflow-hidden">
        {showHistory ? <HistoryView /> : renderBody()}
      </main>
    </div>
  );
}

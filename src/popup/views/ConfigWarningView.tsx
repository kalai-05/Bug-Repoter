import { Button } from '../../components/Button';
import type { Platform } from '../../types/chrome.types';

interface ConfigWarningViewProps {
  platform?: Platform;
}

const PLATFORM_STEPS: Record<Platform, string[]> = {
  clickup: [
    'Open Settings below',
    'Paste your ClickUp API token',
    'Enter your Workspace, Space and List IDs',
  ],
  jira: [
    'Open Settings below',
    'Enter your Jira base URL and email',
    'Add your API token and project key',
  ],
  linear: [
    'Open Settings below',
    'Add your Linear API key',
    'Enter your team ID',
  ],
};

const PLATFORM_LABEL: Record<Platform, string> = {
  clickup: 'ClickUp',
  jira: 'Jira',
  linear: 'Linear',
};

function RadarIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
      {/* Outer ring */}
      <circle cx="18" cy="18" r="15" stroke="#7c3aed" strokeWidth="1.5" opacity="0.3"/>
      {/* Mid ring */}
      <circle cx="18" cy="18" r="9" stroke="#7c3aed" strokeWidth="1.5" opacity="0.5"/>
      {/* Inner ring */}
      <circle cx="18" cy="18" r="4" stroke="#7c3aed" strokeWidth="1.5" opacity="0.8"/>
      {/* Center dot */}
      <circle cx="18" cy="18" r="1.5" fill="#7c3aed"/>
      {/* Sweep line */}
      <line x1="18" y1="18" x2="28" y2="6" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
      {/* Bug on sweep */}
      <circle cx="27" cy="7" r="2" fill="#4f46e5"/>
    </svg>
  );
}

export function ConfigWarningView({ platform }: ConfigWarningViewProps) {
  const openOptions = () => void chrome.runtime.openOptionsPage();

  const steps = platform ? PLATFORM_STEPS[platform] : [
    'Open Settings below',
    'Choose your bug tracking platform',
    'Enter your API credentials',
  ];

  const platformLabel = platform ? PLATFORM_LABEL[platform] : null;

  return (
    <div className="flex flex-col items-center justify-center gap-5 px-6 py-8 text-center">
      {/* Icon */}
      <div
        className="w-18 h-18 rounded-2xl flex items-center justify-center"
        style={{
          width: 72,
          height: 72,
          background: 'linear-gradient(145deg, #ede9fe, #f5f3ff)',
          border: '1px solid #ddd6fe',
        }}
      >
        <RadarIcon />
      </div>

      {/* Copy */}
      <div className="flex flex-col gap-1.5">
        <h2 className="text-base font-bold text-mat-on-surface">Setup Required</h2>
        <p className="text-sm text-mat-on-surface-var leading-relaxed max-w-[240px]">
          {platformLabel
            ? `Connect your ${platformLabel} account to start reporting bugs.`
            : 'Choose a bug tracking platform to get started.'}
        </p>
      </div>

      {/* Steps */}
      <div
        className="w-full rounded-xl px-4 py-3 text-left flex flex-col gap-2.5"
        style={{ background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', border: '1px solid #ddd6fe' }}
      >
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <span
              className="flex-shrink-0 w-5 h-5 rounded-full text-white flex items-center justify-center text-2xs font-bold"
              style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
            >
              {i + 1}
            </span>
            <span className="text-xs text-mat-on-surface-var font-medium">{step}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Button
        variant="filled"
        size="lg"
        fullWidth
        onClick={openOptions}
        icon={
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        }
      >
        Open Settings
      </Button>
    </div>
  );
}

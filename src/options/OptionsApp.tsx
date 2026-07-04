import { useState, useCallback } from 'react';
import { useSettings } from '../hooks/useSettings';
import type { SettingsFormState } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import type { GoogleUser } from '../types/auth.types';
import type { Platform } from '../types/chrome.types';

/* ── Icons ─────────────────────────────────────────────────── */

function ClickUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12l4.5 4.5L12 6l4.5 6.5L21 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function JiraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L2 12l10 10 10-10L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M12 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function LinearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function GoogleColorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function AlertCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4h6v2" />
    </svg>
  );
}

/* ── Field tooltip help ─────────────────────────────────────── */

interface FieldHelp {
  title: string;
  steps: string[];
}

const CLICKUP_HELP = {
  apiToken: {
    title: 'How to get your API Token',
    steps: [
      'Click your avatar at the bottom-left in ClickUp',
      'Go to Settings → Apps',
      'Under "API Token" click Generate (or copy existing)',
      'Paste the token here',
    ],
  },
  workspaceId: {
    title: 'How to find your Workspace ID',
    steps: [
      'Open ClickUp in your browser',
      'Look at the address bar URL',
      'Format: app.clickup.com/{ID}/home',
      'Copy the number right after the domain',
    ],
  },
  spaceId: {
    title: 'How to find your Space ID',
    steps: [
      'Right-click any Space in the left sidebar',
      'Select "Copy link"',
      'Paste the link somewhere — look at the end',
      'The last number is your Space ID',
      'Example: …/s/90120056789 → ID is 90120056789',
    ],
  },
  folderId: {
    title: 'How to find your Folder ID (optional)',
    steps: [
      'Right-click any Folder in the left sidebar',
      'Select "Copy link"',
      'The last number in the URL is your Folder ID',
      'Leave blank if your lists are directly in a Space',
    ],
  },
  listId: {
    title: 'How to find your List ID',
    steps: [
      'Right-click any List in the left sidebar',
      'Select "Copy link"',
      'Paste the link and look at the end',
      'The last number is your List ID',
      'Example: …/l/901205678901 → ID is 901205678901',
    ],
  },
} satisfies Record<string, FieldHelp>;

const JIRA_HELP = {
  baseUrl: {
    title: 'Your Jira Base URL',
    steps: [
      'Open Jira in your browser',
      'Look at the URL bar',
      'Copy everything up to and including ".atlassian.net"',
      'Example: https://yourcompany.atlassian.net',
      'Do NOT include any path after the domain',
    ],
  },
  email: {
    title: 'Your Atlassian Email',
    steps: [
      'Use the email address you log into Jira with',
      'To confirm: click your avatar in Jira → top of the menu',
    ],
  },
  apiToken: {
    title: 'How to create a Jira API Token',
    steps: [
      'Go to id.atlassian.com in your browser',
      'Click Security in the left menu',
      'Click "Create and manage API tokens"',
      'Click "Create API token" and give it a name',
      'Copy the token immediately — it won\'t show again',
    ],
  },
  projectKey: {
    title: 'Where to find your Project Key',
    steps: [
      'Open any issue inside your Jira project',
      'Look at the issue number (e.g. "BUG-123")',
      'The letters before the dash are the Project Key',
      'Example: "BUG" from "BUG-123"',
      'Keys are typically 2–5 uppercase letters',
    ],
  },
} satisfies Record<string, FieldHelp>;

const LINEAR_HELP = {
  apiKey: {
    title: 'How to create a Linear API Key',
    steps: [
      'Open Linear and click Settings (bottom-left gear)',
      'Click API in the left sidebar',
      'Under Personal API Keys, click "Create key"',
      'Give it a label (e.g. "Bug Reporter") and click Create',
      'Copy the key immediately — it won\'t show again',
    ],
  },
  teamId: {
    title: 'How to find your Team Key',
    steps: [
      'Open Linear and go to Settings',
      'Click Teams in the left sidebar',
      'Click on your team name',
      'Look at the browser URL — it ends with your Team Key',
      'Example: linear.app/…/settings/teams/BUG → Key is BUG',
      'Paste that short key here (e.g. BUG, ENG, DEV)',
    ],
  },
} satisfies Record<string, FieldHelp>;

function TooltipHelp({ help }: { help: FieldHelp }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-4 h-4 rounded-full text-mat-muted hover:text-mat-primary transition-colors focus:outline-none"
        aria-label="How to find this value"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      </button>

      {open && (
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-64 rounded-xl border border-mat-outline-var bg-white shadow-card-hover p-3.5 flex flex-col gap-2.5"
          role="tooltip"
        >
          {/* Arrow */}
          <div
            className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l border-t border-mat-outline-var"
            style={{ transform: 'translateY(-50%) rotate(-45deg)' }}
          />
          {/* Title */}
          <p className="text-xs font-bold text-mat-on-surface leading-snug">{help.title}</p>
          {/* Steps */}
          <ol className="flex flex-col gap-1.5">
            {help.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className="flex-shrink-0 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center mt-0.5"
                  style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}
                >
                  {i + 1}
                </span>
                <span className="text-xs text-mat-on-surface-var leading-snug">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/* ── Field components ───────────────────────────────────────── */

interface FieldProps {
  label: string;
  hint?: string | undefined;
  required?: boolean | undefined;
  error?: string | undefined;
  help?: FieldHelp | undefined;
  children: React.ReactNode;
}

function Field({ label, hint, required, error, help, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <label className="field-label mb-0 flex items-center gap-1 flex-1">
          {label}
          {required && <span className="text-mat-error" aria-hidden="true">*</span>}
          {hint && !required && (
            <span className="ml-1 normal-case tracking-normal text-mat-muted font-normal">
              — {hint}
            </span>
          )}
        </label>
        {help && <TooltipHelp help={help} />}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-2xs text-mat-error font-medium">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

interface TextInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hasError?: boolean;
  autoComplete?: string;
  spellCheck?: boolean;
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  type?: string;
}

function TextInput({ value, onChange, placeholder, hasError, autoComplete = 'off', spellCheck = false, inputMode, type = 'text' }: TextInputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete={autoComplete}
      spellCheck={spellCheck}
      inputMode={inputMode}
      className={`field-base px-3 py-2.5 ${hasError ? 'field-error' : ''}`}
    />
  );
}

interface TokenInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hasError?: boolean;
}

function TokenInput({ value, onChange, placeholder, hasError }: TokenInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="new-password"
        spellCheck={false}
        className={`field-base px-3 py-2.5 pr-10 font-mono text-xs ${hasError ? 'field-error' : ''}`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        title={visible ? 'Hide token' : 'Show token'}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-mat-muted hover:text-mat-primary transition-colors p-0.5"
        tabIndex={-1}
      >
        <EyeIcon open={visible} />
      </button>
    </div>
  );
}

/* ── Section card ───────────────────────────────────────────── */

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
  children: React.ReactNode;
}

function SettingsSection({ icon, title, description, accent, children }: SectionProps) {
  return (
    <section className="card">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-mat-outline-var rounded-t-xl overflow-hidden" style={{ background: accent }}>
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/90 text-mat-primary shadow-sm">
          {icon}
        </span>
        <div>
          <h2 className="text-sm font-bold text-mat-on-surface">{title}</h2>
          <p className="text-2xs text-mat-on-surface-var mt-0.5">{description}</p>
        </div>
      </div>
      <div className="px-6 py-5 flex flex-col gap-4">{children}</div>
    </section>
  );
}

/* ── Platform tab selector ──────────────────────────────────── */

interface PlatformTabsProps {
  value: Platform;
  onChange: (p: Platform) => void;
}

const PLATFORMS: Array<{ id: Platform; label: string; icon: React.ReactNode }> = [
  { id: 'clickup', label: 'ClickUp', icon: <ClickUpIcon /> },
  { id: 'jira', label: 'Jira', icon: <JiraIcon /> },
  { id: 'linear', label: 'Linear', icon: <LinearIcon /> },
];

function PlatformTabs({ value, onChange }: PlatformTabsProps) {
  return (
    <div className="flex gap-2 p-1 rounded-xl bg-mat-surface-var border border-mat-outline-var">
      {PLATFORMS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          className={[
            'flex-1 flex items-center justify-center gap-2 h-9 rounded-lg text-xs font-semibold transition-all',
            value === p.id
              ? 'bg-white shadow-sm text-mat-primary'
              : 'text-mat-muted hover:text-mat-on-surface',
          ].join(' ')}
        >
          {p.icon}
          {p.label}
        </button>
      ))}
    </div>
  );
}

/* ── Confirm-before-clear button ────────────────────────────── */

function ClearButton({ onConfirm }: { onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);

  const handleClick = useCallback(() => {
    if (!armed) {
      setArmed(true);
      setTimeout(() => setArmed(false), 3000);
    } else {
      setArmed(false);
      onConfirm();
    }
  }, [armed, onConfirm]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        'flex items-center gap-1.5 px-3 h-9 rounded-lg text-xs font-semibold transition-all',
        armed
          ? 'bg-mat-error text-white'
          : 'text-mat-error bg-mat-error-light hover:bg-mat-error hover:text-white',
      ].join(' ')}
    >
      <TrashIcon />
      {armed ? 'Confirm — this cannot be undone' : 'Clear all data'}
    </button>
  );
}

/* ── Google Account section ─────────────────────────────────── */

interface GoogleAccountSectionProps {
  user: GoogleUser | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  error: import('../types/auth.types').AuthError | null;
  onLogin: () => void;
  onLogout: () => void;
  onClearError: () => void;
}

function GoogleAccountSection({
  user,
  isLoading,
  isAuthenticating,
  error,
  onLogin,
  onLogout,
  onClearError,
}: GoogleAccountSectionProps) {
  return (
    <SettingsSection
      icon={<GoogleColorIcon />}
      title="Google Account"
      description="Sign in to enable screenshot uploads to Google Drive."
      accent="#FEF9EE"
    >
      {isLoading ? (
        <div className="flex items-center gap-2 py-2 text-sm text-mat-muted">
          <div className="w-4 h-4 rounded-full border-2 border-mat-primary-container border-t-mat-primary animate-spin" />
          Checking sign-in status…
        </div>
      ) : user ? (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-mat-bg border border-mat-outline-var">
          <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-mat-outline-var shrink-0 bg-mat-primary-container">
            {user.picture && (
              <img
                src={user.picture}
                alt={user.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
            <span
              className="absolute inset-0 flex items-center justify-center text-base font-bold text-mat-primary -z-10 select-none"
              aria-hidden="true"
            >
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-mat-on-surface truncate">{user.name}</p>
            <p className="text-2xs text-mat-muted truncate">{user.email}</p>
            <p className="text-2xs text-mat-success font-medium mt-1 flex items-center gap-1">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              Connected
            </p>
          </div>

          <button
            type="button"
            onClick={onLogout}
            disabled={isAuthenticating}
            className="px-3 h-8 rounded-lg text-xs font-semibold text-mat-error bg-mat-error-light hover:bg-mat-error hover:text-white transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAuthenticating ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
                Signing out…
              </span>
            ) : (
              'Sign Out'
            )}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-sm text-mat-on-surface-var font-medium">No account connected</p>
            <p className="text-2xs text-mat-muted max-w-xs leading-relaxed">
              Sign in with Google to automatically upload bug screenshots to Drive.
            </p>
          </div>

          <button
            type="button"
            onClick={onLogin}
            disabled={isAuthenticating}
            className="flex items-center gap-3 px-5 h-10 rounded-lg border border-mat-outline-var bg-white text-sm font-medium text-mat-on-surface shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAuthenticating ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-mat-outline-var border-t-[#4285F4] animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <GoogleColorIcon />
                Sign in with Google
              </>
            )}
          </button>

          {error && (
            <div className="w-full flex items-start gap-2 px-4 py-3 rounded-lg bg-mat-error-container border border-mat-error/30 text-mat-error text-2xs">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 mt-0.5" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <span className="flex-1">{error.userMessage}</span>
              <button
                type="button"
                onClick={onClearError}
                className="shrink-0 text-mat-error/60 hover:text-mat-error transition-colors"
                aria-label="Dismiss error"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </SettingsSection>
  );
}

/* ── Platform config sections ───────────────────────────────── */

interface ConfigSectionProps {
  errors: import('../hooks/useSettings').SettingsValidationErrors;
  f: (field: keyof SettingsFormState) => { value: string; onChange: (v: string) => void; hasError: boolean };
}

function ClickUpConfigSection({ errors, f }: ConfigSectionProps) {
  return (
    <SettingsSection
      icon={<ClickUpIcon />}
      title="ClickUp Integration"
      description="Connect your ClickUp workspace to automatically create bug tickets."
      accent="#EEF0FF"
    >
      <Field
        label="API Token"
        required
        error={errors.clickupApiToken}
        help={CLICKUP_HELP.apiToken}
      >
        <TokenInput
          {...f('clickupApiToken')}
          placeholder="pk_XXXXXXXXXX_XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Workspace ID" required error={errors.clickupWorkspaceId} help={CLICKUP_HELP.workspaceId}>
          <TextInput {...f('clickupWorkspaceId')} placeholder="e.g. 9012345678" inputMode="numeric" />
        </Field>
        <Field label="Space ID" required error={errors.clickupSpaceId} help={CLICKUP_HELP.spaceId}>
          <TextInput {...f('clickupSpaceId')} placeholder="e.g. 90120056789" inputMode="numeric" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Folder ID" hint="optional" error={errors.clickupFolderId} help={CLICKUP_HELP.folderId}>
          <TextInput {...f('clickupFolderId')} placeholder="e.g. 90130056789" inputMode="numeric" />
        </Field>
        <Field label="List ID" required error={errors.clickupListId} help={CLICKUP_HELP.listId}>
          <TextInput {...f('clickupListId')} placeholder="e.g. 901205678901" inputMode="numeric" />
        </Field>
      </div>
    </SettingsSection>
  );
}

function JiraConfigSection({ errors, f }: ConfigSectionProps) {
  return (
    <SettingsSection
      icon={<JiraIcon />}
      title="Jira Integration"
      description="Connect your Jira project to create bug issues automatically."
      accent="#E8F0FE"
    >
      <Field
        label="Jira Base URL"
        required
        error={errors.jiraBaseUrl}
        help={JIRA_HELP.baseUrl}
      >
        <TextInput
          {...f('jiraBaseUrl')}
          placeholder="https://yourcompany.atlassian.net"
          type="url"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Email" required error={errors.jiraEmail} help={JIRA_HELP.email}>
          <TextInput
            {...f('jiraEmail')}
            placeholder="you@company.com"
            type="email"
            autoComplete="email"
          />
        </Field>
        <Field label="Project Key" required error={errors.jiraProjectKey} help={JIRA_HELP.projectKey}>
          <TextInput {...f('jiraProjectKey')} placeholder="e.g. BUG, ENG" />
        </Field>
      </div>

      <Field
        label="API Token"
        required
        error={errors.jiraApiToken}
        help={JIRA_HELP.apiToken}
      >
        <TokenInput {...f('jiraApiToken')} placeholder="ATATT3xFfGF0..." />
      </Field>
    </SettingsSection>
  );
}

function LinearConfigSection({ errors, f }: ConfigSectionProps) {
  return (
    <SettingsSection
      icon={<LinearIcon />}
      title="Linear Integration"
      description="Connect your Linear team to create bug issues automatically."
      accent="#F0EDFF"
    >
      <Field
        label="API Key"
        required
        error={errors.linearApiKey}
        help={LINEAR_HELP.apiKey}
      >
        <TokenInput {...f('linearApiKey')} placeholder="lin_api_XXXXXXXXXX..." />
      </Field>

      <Field
        label="Team Key"
        required
        hint="from Settings → Teams URL"
        error={errors.linearTeamId}
        help={LINEAR_HELP.teamId}
      >
        <TextInput {...f('linearTeamId')} placeholder="e.g. BUG, ENG, DEV" />
      </Field>
    </SettingsSection>
  );
}

/* ── Main OptionsApp ────────────────────────────────────────── */

export function OptionsApp() {
  const { user, isLoading: authLoading, isAuthenticating, error: authError, login, logout, clearError } = useAuth();
  const { form, errors, status, saveError, isDirty, updateField, switchPlatform, save, clearAll } = useSettings();

  const f = (field: keyof SettingsFormState) => ({
    value: form[field] as string,
    onChange: (v: string) => updateField(field, v),
    hasError: Boolean(errors[field]),
  });

  const isLoading = status === 'loading';
  const isSaving = status === 'saving';

  const handlePlatformChange = (p: Platform) => {
    void switchPlatform(p);
  };

  return (
    <div className="min-h-screen bg-mat-bg">
      {/* ── Header ── */}
      <header className="popup-header sticky top-0 z-10">
        <div className="max-w-[700px] mx-auto w-full flex items-center gap-3">
          <img
            src="icons/icon32.png"
            alt=""
            className="w-8 h-8 rounded-lg shadow-sm"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div>
            <h1 className="text-white font-bold text-base leading-tight">Bug Reporter</h1>
            <p className="text-white/65 text-xs">Settings &amp; Configuration</p>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="max-w-[700px] mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-20">
            <div className="w-5 h-5 rounded-full border-2 border-mat-primary-container border-t-mat-primary animate-spin" />
            <span className="text-sm text-mat-muted font-medium">Loading settings…</span>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* ── Google Account section ── */}
            <GoogleAccountSection
              user={user}
              isLoading={authLoading}
              isAuthenticating={isAuthenticating}
              error={authError}
              onLogin={() => void login()}
              onLogout={() => void logout()}
              onClearError={clearError}
            />

            {/* ── Platform selector ── */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-mat-muted uppercase tracking-wider">Bug Tracking Platform</p>
              <PlatformTabs value={form.platform} onChange={handlePlatformChange} />
            </div>

            {/* ── Platform-specific config ── */}
            {form.platform === 'clickup' && (
              <ClickUpConfigSection errors={errors} f={f} />
            )}
            {form.platform === 'jira' && (
              <JiraConfigSection errors={errors} f={f} />
            )}
            {form.platform === 'linear' && (
              <LinearConfigSection errors={errors} f={f} />
            )}

            {/* ── Actions ── */}
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => void save()}
                disabled={isSaving || (!isDirty && status !== 'idle')}
                className={[
                  'flex items-center gap-2 px-5 h-10 rounded-lg text-sm font-semibold text-white shadow-btn',
                  'transition-all duration-fast ease-material',
                  isSaving || (!isDirty && status === 'saved')
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:shadow-btn-hover active:scale-95',
                ].join(' ')}
                style={{ background: 'linear-gradient(135deg, #5B5FCF, #7c3aed)' }}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    Save Settings
                  </>
                )}
              </button>

              <ClearButton onConfirm={() => void clearAll()} />
            </div>

            {/* ── Status banners ── */}
            {status === 'saved' && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-mat-success-container border border-[#a7f3d0] text-mat-success animate-[fadeIn_0.2s_ease]">
                <span className="text-mat-success"><CheckCircleIcon /></span>
                <div>
                  <p className="text-sm font-semibold text-mat-success">Settings saved!</p>
                  <p className="text-2xs text-mat-success/80 mt-0.5">
                    Your configuration has been stored in Chrome sync storage.
                  </p>
                </div>
              </div>
            )}

            {status === 'error' && saveError && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-mat-error-container border border-mat-error/30">
                <span className="text-mat-error"><AlertCircleIcon /></span>
                <div>
                  <p className="text-sm font-semibold text-mat-error">Save failed</p>
                  <p className="text-2xs text-mat-error/80 mt-0.5">{saveError}</p>
                </div>
              </div>
            )}

            {status !== 'saved' && Object.keys(errors).length > 0 && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-mat-error-container border border-mat-error/30">
                <span className="text-mat-error mt-0.5"><AlertCircleIcon /></span>
                <div>
                  <p className="text-sm font-semibold text-mat-error">Please fix the errors above</p>
                  <p className="text-2xs text-mat-error/80 mt-0.5">
                    {Object.keys(errors).length} field{Object.keys(errors).length !== 1 ? 's' : ''} need
                    {Object.keys(errors).length === 1 ? 's' : ''} attention.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

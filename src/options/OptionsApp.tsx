import { useState, useCallback } from 'react';
import { useSettings } from '../hooks/useSettings';
import type { SettingsFormState } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import type { GoogleUser } from '../types/auth.types';

/* ── Icons ─────────────────────────────────────────────────── */

function ClickUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 12l4.5 4.5L12 6l4.5 6.5L21 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
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

function GoogleDriveIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12.18 2.25L8 9.75l4.18 7.5H20l-3.82-7.5z" />
      <path d="M3 17.25l4.18-7.5 4 .5L7 17.25H3z" />
      <path d="M7.18 17.25h9.64L20 21H4z" />
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

/* ── Field components ───────────────────────────────────────── */

interface FieldProps {
  label: string;
  hint?: string | undefined;
  required?: boolean | undefined;
  error?: string | undefined;
  children: React.ReactNode;
}

function Field({ label, hint, required, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="field-label flex items-center gap-1">
        {label}
        {required && <span className="text-mat-error" aria-hidden="true">*</span>}
        {hint && !required && (
          <span className="ml-1 normal-case tracking-normal text-mat-muted font-normal">
            — {hint}
          </span>
        )}
      </label>
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
}

function TextInput({ value, onChange, placeholder, hasError, autoComplete = 'off', spellCheck = false, inputMode }: TextInputProps) {
  return (
    <input
      type="text"
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
    <section className="card overflow-hidden">
      {/* Section header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-mat-outline-var" style={{ background: accent }}>
        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/90 text-mat-primary shadow-sm">
          {icon}
        </span>
        <div>
          <h2 className="text-sm font-bold text-mat-on-surface">{title}</h2>
          <p className="text-2xs text-mat-on-surface-var mt-0.5">{description}</p>
        </div>
      </div>

      {/* Section body */}
      <div className="px-6 py-5 flex flex-col gap-4">{children}</div>
    </section>
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
        /* ── Signed-in state ── */
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
        /* ── Signed-out state ── */
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

/* ── Main OptionsApp ────────────────────────────────────────── */

export function OptionsApp() {
  const { user, isLoading: authLoading, isAuthenticating, error: authError, login, logout, clearError } = useAuth();
  const { form, errors, status, saveError, isDirty, updateField, save, clearAll } = useSettings();

  const f = (field: keyof SettingsFormState) => ({
    value: form[field],
    onChange: (v: string) => updateField(field, v),
    hasError: Boolean(errors[field]),
  });

  const isLoading = status === 'loading';
  const isSaving = status === 'saving';

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
            <h1 className="text-white font-bold text-base leading-tight">ClickUp Bug Reporter</h1>
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

            {/* ── ClickUp section ── */}
            <SettingsSection
              icon={<ClickUpIcon />}
              title="ClickUp Integration"
              description="Connect your ClickUp workspace to automatically create bug tickets."
              accent="#EEF0FF"
            >
              <Field
                label="API Token"
                required
                hint="Personal API token from ClickUp → Settings → Apps"
                error={errors.clickupApiToken}
              >
                <TokenInput
                  {...f('clickupApiToken')}
                  placeholder="pk_XXXXXXXXXX_XXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Workspace ID" required error={errors.clickupWorkspaceId}>
                  <TextInput
                    {...f('clickupWorkspaceId')}
                    placeholder="e.g. 9012345678"
                    inputMode="numeric"
                  />
                </Field>
                <Field label="Space ID" required error={errors.clickupSpaceId}>
                  <TextInput
                    {...f('clickupSpaceId')}
                    placeholder="e.g. 90120056789"
                    inputMode="numeric"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Folder ID" hint="optional" error={errors.clickupFolderId}>
                  <TextInput
                    {...f('clickupFolderId')}
                    placeholder="e.g. 90130056789"
                    inputMode="numeric"
                  />
                </Field>
                <Field label="List ID" required error={errors.clickupListId}>
                  <TextInput
                    {...f('clickupListId')}
                    placeholder="e.g. 901205678901"
                    inputMode="numeric"
                  />
                </Field>
              </div>

              {/* Help row */}
              <p className="text-2xs text-mat-muted leading-relaxed">
                Find IDs by right-clicking any item in ClickUp and choosing <strong>Copy link</strong>.
                The numeric segment at the end of the URL is the ID.
              </p>
            </SettingsSection>

            {/* ── Google Drive section ── */}
            <SettingsSection
              icon={<GoogleDriveIcon />}
              title="Google Drive Integration"
              description="Upload bug screenshots directly to Google Drive. Both fields are optional."
              accent="#F0FDF4"
            >
              <Field
                label="OAuth Client ID"
                hint="optional"
                error={errors.googleClientId}
              >
                <TextInput
                  {...f('googleClientId')}
                  placeholder="XXXXXXXXXXXX-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com"
                  autoComplete="off"
                />
              </Field>

              <Field
                label="Drive Folder ID"
                hint="optional — screenshots go to Drive root if blank"
                error={errors.googleDriveFolderId}
              >
                <TextInput
                  {...f('googleDriveFolderId')}
                  placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms"
                />
              </Field>

              <p className="text-2xs text-mat-muted leading-relaxed">
                Create an OAuth 2.0 Client ID in{' '}
                <strong>Google Cloud Console → APIs &amp; Services → Credentials</strong>.
                Copy the Folder ID from the Drive URL after <code className="bg-mat-outline-var px-1 rounded">/folders/</code>.
              </p>
            </SettingsSection>

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

            {/* Validation summary — show when there are errors after a save attempt */}
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

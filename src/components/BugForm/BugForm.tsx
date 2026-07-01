import type { FormEvent } from 'react';
import { Button } from '../Button';
import { Input } from '../Input';
import { TextArea } from '../TextArea';
import { Select } from '../Select';
import { ScreenshotPreview } from '../ScreenshotPreview';
import { TagPicker } from '../TagPicker/TagPicker';
import { AssigneePicker } from '../AssigneePicker/AssigneePicker';
import { validateBugReport, getFieldError } from '../../utils/validation.utils';
import type { BugReportFormState, BugPriority, BugType, ClickUpTag, ClickUpMember } from '../../types';
import type { ScreenshotCaptureError, ScreenshotResult } from '../../types/screenshot.types';

/* ── Option lists ────────────────────────────────────────────── */

const PRIORITY_OPTIONS: Array<{ value: BugPriority; label: string }> = [
  { value: 'urgent', label: '🔴  Urgent' },
  { value: 'high', label: '🟠  High' },
  { value: 'normal', label: '🔵  Normal' },
  { value: 'low', label: '⚪  Low' },
];

const BUG_TYPE_OPTIONS: Array<{ value: BugType; label: string }> = [
  { value: 'functional', label: '⚙️  Functional' },
  { value: 'ui', label: '🎨  UI / Visual' },
  { value: 'performance', label: '⚡  Performance' },
  { value: 'security', label: '🔐  Security' },
  { value: 'crash', label: '💥  Crash' },
  { value: 'other', label: '🔮  Other' },
];

/* ── Sub-components ──────────────────────────────────────────── */

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 -mx-1">
      <span className="text-2xs font-semibold tracking-widest uppercase text-mat-muted whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-mat-outline-var" />
    </div>
  );
}

function SettingsRow({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex items-center justify-center pt-1">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 text-2xs font-semibold text-mat-muted
          hover:text-mat-primary transition-colors duration-fast ease-material
          focus:outline-none focus-visible:ring-2 focus-visible:ring-mat-primary rounded px-2 py-1"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        Settings
      </button>
    </div>
  );
}

/* ── BugForm ─────────────────────────────────────────────────── */

export interface BugFormProps {
  form: BugReportFormState;
  /** Full screenshot result including base64, dimensions, and size metadata */
  screenshotResult: ScreenshotResult | null;
  /** Annotated PNG data URL, replaces raw screenshot in submission when set */
  annotatedScreenshot?: string | null;
  isCapturing: boolean;
  screenshotError: ScreenshotCaptureError | null;
  isSubmitting: boolean;
  /** ClickUp space tags fetched from the API */
  availableTags: ClickUpTag[];
  /** ClickUp workspace members fetched from the API */
  availableMembers: ClickUpMember[];
  formDataLoading: boolean;
  onFieldChange: <K extends keyof BugReportFormState>(
    field: K,
    value: BugReportFormState[K],
  ) => void;
  onCapture: () => void;
  onClearScreenshot: () => void;
  onAnnotateScreenshot?: (dataUrl: string) => void;
  /** Called with the screenshot data URL (or null) at submission time */
  onSubmit: () => void;
  onSettings: () => void;
}

export function BugForm({
  form,
  screenshotResult,
  annotatedScreenshot,
  isCapturing,
  screenshotError,
  isSubmitting,
  availableTags,
  availableMembers,
  formDataLoading,
  onFieldChange,
  onCapture,
  onClearScreenshot,
  onAnnotateScreenshot,
  onSubmit,
  onSettings,
}: BugFormProps) {
  const { errors } = validateBugReport(form);
  const canSubmit = errors.length === 0 && !isSubmitting;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── Main card ── */}
      <div className="m-4 card overflow-hidden">
        <div className="px-4 pt-4 pb-3 flex flex-col gap-4">
          <Input
            label="Ticket Title"
            required
            placeholder="Brief description of what went wrong…"
            value={form.title}
            onChange={(e) => onFieldChange('title', e.target.value)}
            error={getFieldError(errors, 'title')}
            maxLength={200}
            autoFocus
            icon={
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="21" y1="10" x2="3" y2="10" />
                <line x1="21" y1="6" x2="3" y2="6" />
                <line x1="21" y1="14" x2="3" y2="14" />
                <line x1="21" y1="18" x2="9" y2="18" />
              </svg>
            }
          />

          <TextArea
            label="Bug Summary"
            placeholder="Brief description of what went wrong…"
            value={form.description}
            onChange={(e) => onFieldChange('description', e.target.value)}
            rows={2}
          />

          <TextArea
            label="Steps to Reproduce"
            placeholder={`1. Go to…\n2. Click on…\n3. Notice that…`}
            value={form.stepsToReproduce}
            onChange={(e) => onFieldChange('stepsToReproduce', e.target.value)}
            rows={3}
          />

          <div className="grid grid-cols-2 gap-3">
            <TextArea
              label="Expected Result"
              placeholder="What should happen…"
              value={form.expectedResult}
              onChange={(e) => onFieldChange('expectedResult', e.target.value)}
              rows={2}
            />
            <TextArea
              label="Actual Result"
              placeholder="What actually happens…"
              value={form.actualResult}
              onChange={(e) => onFieldChange('actualResult', e.target.value)}
              rows={2}
            />
          </div>

          {/* 2-column dropdowns */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Priority"
              options={PRIORITY_OPTIONS}
              value={form.priority}
              onChange={(e) => onFieldChange('priority', e.target.value as BugPriority)}
            />
            <Select
              label="Bug Type"
              options={BUG_TYPE_OPTIONS}
              value={form.bugType}
              onChange={(e) => onFieldChange('bugType', e.target.value as BugType)}
            />
          </div>

          {/* Tags — fetched from ClickUp space */}
          <TagPicker
            label="Tags"
            selected={form.tags}
            available={availableTags}
            isLoading={formDataLoading}
            onChange={(tags) => onFieldChange('tags', tags)}
          />

          {/* Assignees — fetched from ClickUp workspace */}
          <AssigneePicker
            label="Assignees"
            selected={form.assignees}
            members={availableMembers}
            isLoading={formDataLoading}
            onChange={(ids) => onFieldChange('assignees', ids)}
          />
        </div>

        {/* ── Screenshot section ── */}
        <div className="px-4 pb-3">
          <SectionDivider label="Screenshot" />
        </div>

        <div className="px-4 pb-4">
          <ScreenshotPreview
            result={screenshotResult}
            annotatedDataUrl={annotatedScreenshot ?? null}
            isCapturing={isCapturing}
            error={screenshotError}
            onCapture={onCapture}
            onClear={onClearScreenshot}
            {...(onAnnotateScreenshot ? { onAnnotate: onAnnotateScreenshot } : {})}
          />
        </div>

      </div>

      {/* ── Action footer ── */}
      <div className="px-4 pb-4 flex flex-col gap-2">
        <Button
          type="submit"
          variant="filled"
          size="lg"
          fullWidth
          loading={isSubmitting}
          disabled={!canSubmit}
          icon={
            !isSubmitting ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : undefined
          }
        >
          {isSubmitting ? 'Creating Ticket…' : 'Create Ticket'}
        </Button>

        <SettingsRow onClick={onSettings} />
      </div>
    </form>
  );
}

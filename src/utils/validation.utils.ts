import type { BugReportFormState } from '../types';

export interface ValidationError {
  field: keyof BugReportFormState;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateBugReport(form: BugReportFormState): ValidationResult {
  const errors: ValidationError[] = [];

  // Title
  if (!form.title.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (form.title.trim().length < 5) {
    errors.push({ field: 'title', message: 'Title must be at least 5 characters' });
  } else if (form.title.trim().length > 200) {
    errors.push({ field: 'title', message: 'Title must be under 200 characters' });
  }

  return { valid: errors.length === 0, errors };
}

export function getFieldError(
  errors: ValidationError[],
  field: keyof BugReportFormState,
): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}

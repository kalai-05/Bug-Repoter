import type { TextareaHTMLAttributes } from 'react';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | undefined;
  hint?: string;
  wrapperClassName?: string;
}

export function TextArea({
  label,
  error,
  hint,
  id,
  rows = 4,
  className = '',
  wrapperClassName = '',
  required,
  ...rest
}: TextAreaProps) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={textareaId} className="field-label">
          {label}
          {required && (
            <span className="text-mat-error normal-case tracking-normal ml-0.5">*</span>
          )}
        </label>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        required={required}
        className={[
          'field-base px-3 py-2.5 resize-y min-h-[88px]',
          error ? 'field-error' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      />

      {error ? (
        <p className="flex items-center gap-1 text-2xs text-mat-error font-medium">
          <svg className="shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {error}
        </p>
      ) : hint ? (
        <p className="text-2xs text-mat-muted">{hint}</p>
      ) : null}
    </div>
  );
}

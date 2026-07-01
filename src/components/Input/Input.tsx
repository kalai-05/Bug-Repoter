import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | undefined;
  hint?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
  wrapperClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  icon,
  suffix,
  id,
  className = '',
  wrapperClassName = '',
  required,
  ...rest
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
          {required && (
            <span className="text-mat-error normal-case tracking-normal ml-0.5">*</span>
          )}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 flex items-center text-mat-muted pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          required={required}
          className={[
            'field-base h-10 px-3',
            icon ? 'pl-9' : '',
            suffix ? 'pr-9' : '',
            error ? 'field-error' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
        {suffix && (
          <span className="absolute right-3 flex items-center text-mat-muted pointer-events-none">
            {suffix}
          </span>
        )}
      </div>

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

import type { SelectHTMLAttributes } from 'react';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string = string>
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | undefined;
  hint?: string;
  options: SelectOption<T>[];
  wrapperClassName?: string;
  leadingIcon?: string;
}

const CHEVRON_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2349454F' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`;

export function Select<T extends string = string>({
  label,
  error,
  hint,
  options,
  id,
  wrapperClassName = '',
  leadingIcon,
  className = '',
  required,
  ...rest
}: SelectProps<T>) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={selectId} className="field-label">
          {label}
          {required && (
            <span className="text-mat-error normal-case tracking-normal ml-0.5">*</span>
          )}
        </label>
      )}

      <div className="relative">
        {leadingIcon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-base leading-none z-10"
            aria-hidden="true"
          >
            {leadingIcon}
          </span>
        )}
        <select
          id={selectId}
          required={required}
          style={{
            backgroundImage: CHEVRON_SVG,
            backgroundPosition: 'right 10px center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '16px',
          }}
          className={[
            'field-base h-10 appearance-none cursor-pointer',
            'pr-9',
            leadingIcon ? 'pl-9' : 'pl-3',
            error ? 'field-error' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="flex items-center gap-1 text-2xs text-mat-error font-medium">{error}</p>
      ) : hint ? (
        <p className="text-2xs text-mat-muted">{hint}</p>
      ) : null}
    </div>
  );
}

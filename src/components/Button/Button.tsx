import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  filled: [
    'bg-mat-primary text-mat-on-primary shadow-btn',
    'hover:bg-mat-primary-dark hover:shadow-btn-hover',
    'active:shadow-field active:scale-[0.99]',
    'disabled:bg-mat-muted disabled:shadow-none disabled:text-white/70',
  ].join(' '),

  tonal: [
    'bg-mat-primary-container text-mat-on-primary-container',
    'hover:bg-indigo-100',
    'active:bg-indigo-200 active:scale-[0.99]',
    'disabled:bg-mat-outline-var disabled:text-mat-muted',
  ].join(' '),

  outlined: [
    'bg-transparent border border-mat-primary text-mat-primary',
    'hover:bg-mat-primary-container',
    'active:bg-indigo-100 active:scale-[0.99]',
    'disabled:border-mat-outline disabled:text-mat-muted',
  ].join(' '),

  ghost: [
    'bg-transparent text-mat-primary',
    'hover:bg-mat-primary-light',
    'active:bg-mat-primary-container active:scale-[0.99]',
    'disabled:text-mat-muted',
  ].join(' '),

  danger: [
    'bg-mat-error text-white shadow-sm',
    'hover:bg-red-700 hover:shadow-md',
    'active:scale-[0.99]',
    'disabled:bg-mat-muted disabled:shadow-none',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-4 text-xs gap-1.5 rounded',
  md: 'h-10 px-5 text-sm gap-2 rounded',
  lg: 'h-11 px-6 text-sm gap-2 rounded-md',
};

export function Button({
  variant = 'filled',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled ?? loading;

  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-semibold tracking-wide',
        'transition-all duration-fast ease-material',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-mat-primary focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:pointer-events-none select-none',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? (
        <svg
          className="animate-spin shrink-0"
          style={{ width: size === 'sm' ? 12 : 14, height: size === 'sm' ? 12 : 14 }}
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-80"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
}

import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  badge?: React.ReactNode;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      badge,
      id,
      disabled,
      required,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {(label || badge) && (
          <div className="flex items-center justify-between">
            {label && (
              <label
                htmlFor={textareaId}
                className="text-xs font-medium text-text-primary flex items-center"
              >
                <span>{label}</span>
                {required && <span className="text-error ml-1">*</span>}
              </label>
            )}
            {badge && <div>{badge}</div>}
          </div>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          disabled={disabled}
          required={required}
          className={twMerge(
            clsx(
              'w-full bg-surface text-text-primary text-sm rounded-lg border border-border p-3 transition-all placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-ring disabled:bg-neutral-50 disabled:opacity-60 shadow-subtle resize-y leading-relaxed font-sans',
              error && 'border-error focus:border-error focus:ring-error/20',
              className
            )
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-text-secondary">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'ArcTextarea';


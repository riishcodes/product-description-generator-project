import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium text-text-primary flex items-center"
          >
            <span>{label}</span>
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center w-full">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            required={required}
            className={twMerge(
              clsx(
                'w-full appearance-none bg-surface text-text-primary text-sm rounded-lg border border-border px-3.5 py-2 pr-9 transition-all focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-ring disabled:bg-neutral-50 disabled:opacity-60 shadow-subtle cursor-pointer',
                error && 'border-error focus:border-error focus:ring-error/20',
                className
              )
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-text-secondary absolute right-3 pointer-events-none" />
        </div>
        {error ? (
          <p className="text-xs text-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-text-secondary">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'ArcSelect';


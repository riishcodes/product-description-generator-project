import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className,
}) => {
  const variantConfig = {
    info: {
      bg: 'bg-neutral-50',
      border: 'border-border',
      text: 'text-text-primary',
      icon: <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-success-subtle',
      border: 'border-success/30',
      text: 'text-text-primary',
      icon: <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-warning-subtle',
      border: 'border-warning/30',
      text: 'text-text-primary',
      icon: <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />,
    },
    error: {
      bg: 'bg-error-subtle',
      border: 'border-error/30',
      text: 'text-text-primary',
      icon: <AlertCircle className="w-4 h-4 text-error shrink-0 mt-0.5" />,
    },
  };

  const config = variantConfig[variant];

  return (
    <div
      role="alert"
      className={twMerge(
        clsx(
          'p-3.5 rounded-lg border flex gap-3 items-start shadow-subtle text-xs transition-all',
          config.bg,
          config.border,
          config.text,
          className
        )
      )}
    >
      {config.icon}
      <div className="flex-1 flex flex-col gap-0.5">
        {title && <h5 className="font-semibold text-xs tracking-tight">{title}</h5>}
        <div className="text-text-secondary leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary p-0.5 rounded transition-colors focus:outline-none"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

Alert.displayName = 'ArcAlert';


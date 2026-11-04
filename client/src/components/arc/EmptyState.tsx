import React from 'react';
import { Sparkles } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-border bg-surface/50 backdrop-blur-sm',
          className
        )
      )}
    >
      <div className="w-11 h-11 rounded-full bg-accent-subtle flex items-center justify-center text-accent mb-3.5 shadow-subtle border border-accent/10">
        {icon || <Sparkles className="w-5 h-5" />}
      </div>
      <h4 className="text-sm font-semibold text-text-primary tracking-tight mb-1">{title}</h4>
      <p className="text-xs text-text-secondary max-w-sm leading-relaxed mb-4">{description}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};

EmptyState.displayName = 'ArcEmptyState';


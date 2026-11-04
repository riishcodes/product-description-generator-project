import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'outline';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-surface border border-border shadow-card rounded-xl',
      subtle: 'bg-background border border-border/80 rounded-xl',
      outline: 'bg-transparent border border-border rounded-xl',
    };

    return (
      <div
        ref={ref}
        className={twMerge(clsx('transition-all', variantStyles[variant], className))}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'ArcCard';

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge(clsx('p-5 pb-3 border-b border-border/60 flex flex-col gap-1', className))}
      {...props}
    >
      {children}
    </div>
  )
);
CardHeader.displayName = 'ArcCardHeader';

export const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={twMerge(clsx('text-base font-semibold text-text-primary tracking-tight', className))}
      {...props}
    >
      {children}
    </h3>
  )
);
CardTitle.displayName = 'ArcCardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={twMerge(clsx('text-xs text-text-secondary leading-relaxed', className))}
      {...props}
    >
      {children}
    </p>
  )
);
CardDescription.displayName = 'ArcCardDescription';

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={twMerge(clsx('p-5', className))} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'ArcCardContent';

export const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge(clsx('p-4 px-5 pt-3 border-t border-border/60 flex items-center justify-between', className))}
      {...props}
    >
      {children}
    </div>
  )
);
CardFooter.displayName = 'ArcCardFooter';


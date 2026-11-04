import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  value,
  label = 'Copy',
  className,
  size = 'sm',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : label}
      title={copied ? 'Copied to clipboard' : label}
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 font-medium rounded-md border border-border bg-surface text-text-secondary hover:text-text-primary hover:bg-neutral-50 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-subtle',
          size === 'sm' ? 'px-2.5 py-1 text-xs h-7' : 'px-3 py-1.5 text-sm h-8',
          copied && 'border-success text-success bg-success-subtle',
          className
        )
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="check"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1 text-success"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Copied</span>
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{label}</span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

CopyButton.displayName = 'ArcCopyButton';


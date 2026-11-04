import React, { createContext, useContext, useState } from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
}) => {
  const [internalTab, setInternalTab] = useState(defaultValue);
  const currentTab = value !== undefined ? value : internalTab;

  const handleTabChange = (newVal: string) => {
    if (value === undefined) {
      setInternalTab(newVal);
    }
    onValueChange?.(newVal);
  };

  return (
    <TabsContext.Provider value={{ activeTab: currentTab, setActiveTab: handleTabChange }}>
      <div className={twMerge('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

export const TabsList: React.FC<TabsListProps> = ({ className, children }) => {
  return (
    <div
      className={twMerge(
        'inline-flex items-center gap-1 p-1 bg-neutral-100/80 rounded-lg border border-border/80',
        className
      )}
    >
      {children}
    </div>
  );
};

export interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  className,
  children,
  icon,
  badge,
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.activeTab === value;

  return (
    <button
      type="button"
      onClick={() => context.setActiveTab(value)}
      className={twMerge(
        clsx(
          'relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          isActive ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary',
          className
        )
      )}
    >
      {isActive && (
        <motion.div
          layoutId="arc-tabs-indicator"
          className="absolute inset-0 bg-surface rounded-md shadow-subtle border border-border/60"
          transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {icon && <span className="w-3.5 h-3.5">{icon}</span>}
        <span>{children}</span>
        {badge && <span>{badge}</span>}
      </span>
    </button>
  );
};

export interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, className, children }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.activeTab !== value) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={twMerge('pt-3', className)}
    >
      {children}
    </motion.div>
  );
};


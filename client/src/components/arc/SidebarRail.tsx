import React from 'react';
import { Layers, GitCompare, ShieldCheck, FileCode2, ExternalLink } from 'lucide-react';

export type DashboardView = 'workbench' | 'comparison' | 'audit' | 'rules';

interface SidebarRailProps {
  activeView: DashboardView;
  onSelectView: (view: DashboardView) => void;
  unsupportedCount?: number;
}

export const SidebarRail: React.FC<SidebarRailProps> = ({
  activeView,
  onSelectView,
  unsupportedCount = 0,
}) => {
  const navItems: Array<{
    id: DashboardView;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeVariant?: 'error' | 'neutral';
  }> = [
    {
      id: 'workbench',
      label: 'Workbench',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'comparison',
      label: 'Comparison',
      icon: <GitCompare className="w-4 h-4" />,
    },
    {
      id: 'audit',
      label: 'Claim Audit',
      icon: <ShieldCheck className="w-4 h-4" />,
      badge: unsupportedCount > 0 ? unsupportedCount : undefined,
      badgeVariant: 'error',
    },
    {
      id: 'rules',
      label: 'Prompt Specs',
      icon: <FileCode2 className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-14 sm:w-16 border-r border-border bg-surface flex flex-col items-center py-4 justify-between shrink-0 select-none">
      <div className="flex flex-col items-center gap-6 w-full">
        {/* Brand Logo */}
        <div className="w-9 h-9 rounded-lg bg-text-primary text-surface flex items-center justify-center font-bold text-sm tracking-tight shadow-subtle">
          PD
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col items-center gap-1.5 w-full px-2" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                title={item.label}
                className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-neutral-100 text-text-primary font-medium'
                    : 'text-text-secondary hover:text-text-primary hover:bg-neutral-50'
                }`}
              >
                {item.icon}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-error text-white text-[10px] font-mono flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex flex-col items-center gap-3">
        <a
          href="https://uiarc.dev"
          target="_blank"
          rel="noreferrer"
          title="Arc UI Component Registry"
          className="w-8 h-8 rounded-md flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-neutral-100 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
};


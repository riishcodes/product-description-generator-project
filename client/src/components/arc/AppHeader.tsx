import React from 'react';
import { ShieldCheck, ChevronRight, Download, RotateCcw, Bug } from 'lucide-react';
import { Badge } from './Badge';
import { Button } from './Button';

interface AppHeaderProps {
  productName: string;
  aiConnected: boolean;
  modelName: string;
  onResetExample: () => void;
  onInjectTestHallucination?: () => void;
  onExportJson?: () => void;
  hasResults?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  productName,
  aiConnected,
  modelName,
  onResetExample,
  onInjectTestHallucination,
  onExportJson,
  hasResults,
}) => {
  return (
    <header className="h-14 border-b border-border bg-surface/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Breadcrumb Pathing */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-text-primary tracking-tight">
          <div className="w-5 h-5 rounded bg-accent text-white flex items-center justify-center font-bold text-[10px] shadow-subtle">
            PD
          </div>
          <span>Product Generator</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
        <span className="text-text-secondary hidden sm:inline">Workspace</span>
        <ChevronRight className="w-3.5 h-3.5 text-text-muted hidden sm:inline" />
        <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 text-text-primary font-medium border border-border truncate max-w-[160px] sm:max-w-[240px]">
          {productName || 'New Product'}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Engine Telemetry */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-50 border border-border text-[11px]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              aiConnected ? 'bg-success animate-pulse' : 'bg-warning'
            }`}
          />
          <span className="text-text-secondary">Engine:</span>
          <span className="font-medium text-text-primary font-mono">{modelName}</span>
        </div>

        <Badge variant="neutral" size="sm" className="hidden lg:inline-flex">
          <ShieldCheck className="w-3 h-3 text-success mr-1" />
          Anti-Hallucination Active
        </Badge>

        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetExample}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            title="Reset form to default test specification"
            className="text-xs text-text-secondary hover:text-text-primary h-8"
          >
            Reset
          </Button>

          {onInjectTestHallucination && hasResults && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onInjectTestHallucination}
              leftIcon={<Bug className="w-3.5 h-3.5 text-warning" />}
              title="Test the verification system by deliberately injecting an unverified specification"
              className="text-xs hidden sm:inline-flex h-8 border-warning/40 hover:bg-warning-subtle text-text-primary"
            >
              Test Hallucination
            </Button>
          )}

          {hasResults && onExportJson && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onExportJson}
              leftIcon={<Download className="w-3.5 h-3.5" />}
              className="text-xs h-8"
            >
              Export JSON
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

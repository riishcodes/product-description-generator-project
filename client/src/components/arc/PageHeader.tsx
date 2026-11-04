import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { Badge } from './Badge';

export interface PageHeaderProps {
  aiConnected?: boolean;
  modelName?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  aiConnected = true,
  modelName = 'Gemini AI',
}) => {
  return (
    <header className="w-full border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-white shadow-subtle">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-semibold text-text-primary tracking-tight">
                Product Description Generator
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-mono font-medium tracking-wider bg-neutral-100 text-text-secondary rounded border border-border">
                Arc UI
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-text-secondary">
              Dual-audience generation with automated factual verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-50 border border-border text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                aiConnected ? 'bg-success animate-pulse' : 'bg-warning'
              }`}
            />
            <span className="text-[11px] font-medium text-text-secondary hidden sm:inline">
              {aiConnected ? 'AI Engine:' : 'Engine:'}
            </span>
            <span className="text-[11px] font-medium text-text-primary">
              {modelName}
            </span>
          </div>

          <Badge variant="accent" size="sm" className="hidden md:inline-flex">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Anti-Hallucination Active
          </Badge>
        </div>
      </div>
    </header>
  );
};

PageHeader.displayName = 'ArcPageHeader';

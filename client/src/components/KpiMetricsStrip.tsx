import React from 'react';
import { ShieldCheck, ShieldAlert, Clock, CheckCircle2, FileText } from 'lucide-react';
import { GenerateResponse, VerificationReportData } from '../types';

interface KpiMetricsStripProps {
  generationResult: GenerateResponse | null;
  verificationResult: VerificationReportData | null;
  featureCount: number;
}

export const KpiMetricsStrip: React.FC<KpiMetricsStripProps> = ({
  generationResult,
  verificationResult,
  featureCount,
}) => {
  if (!generationResult) return null;

  const totalWords =
    (generationResult.description1?.wordCount || 0) +
    (generationResult.description2?.wordCount || 0);

  const approxReadSeconds = Math.ceil((totalWords / 200) * 60);

  const isFlagged = (verificationResult?.unsupportedCount || 0) > 0;
  const supportedPercent =
    verificationResult && verificationResult.totalClaims > 0
      ? Math.round((verificationResult.supportedCount / verificationResult.totalClaims) * 100)
      : 100;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* 1. Factual Grounding Metric */}
      <div className="p-3 rounded-lg border border-border bg-surface shadow-subtle flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary block">
            Factual Grounding
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span
              className={`text-lg font-mono font-bold ${
                isFlagged ? 'text-error' : 'text-success'
              }`}
            >
              {isFlagged ? 'FLAGGED' : `${supportedPercent}%`}
            </span>
            <span className="text-[11px] text-text-muted">
              {isFlagged ? 'unverified spec' : 'zero hallucinations'}
            </span>
          </div>
        </div>
        <div
          className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${
            isFlagged
              ? 'bg-error-subtle text-error'
              : 'bg-success-subtle text-success'
          }`}
        >
          {isFlagged ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
        </div>
      </div>

      {/* 2. Verified Feature Alignment */}
      <div className="p-3 rounded-lg border border-border bg-surface shadow-subtle flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary block">
            Verified Specs
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-mono font-bold text-text-primary">
              {featureCount}
            </span>
            <span className="text-[11px] text-text-muted">features grounded</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-md bg-neutral-100 text-text-primary flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </div>

      {/* 3. Output Volume & Word Counts */}
      <div className="p-3 rounded-lg border border-border bg-surface shadow-subtle flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary block">
            Output Budget
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-mono font-medium text-text-primary">
              {generationResult.description1?.wordCount}w
            </span>
            <span className="text-text-muted text-xs">/</span>
            <span className="text-xs font-mono font-medium text-text-primary">
              {generationResult.description2?.wordCount}w
            </span>
            <span className="text-[11px] text-text-muted ml-1">({totalWords} total)</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-md bg-neutral-100 text-text-primary flex items-center justify-center shrink-0">
          <FileText className="w-4 h-4" />
        </div>
      </div>

      {/* 4. Reading Time */}
      <div className="p-3 rounded-lg border border-border bg-surface shadow-subtle flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary block">
            Est. Reading Time
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-mono font-bold text-text-primary">
              ~{approxReadSeconds}s
            </span>
            <span className="text-[11px] text-text-muted">concise length</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-md bg-neutral-100 text-text-primary flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

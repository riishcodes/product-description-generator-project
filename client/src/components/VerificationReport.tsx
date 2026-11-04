import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './arc/Card';
import { Badge } from './arc/Badge';
import { Button } from './arc/Button';
import { Alert } from './arc/Alert';
import { VerificationReportData, ClaimClassification } from '../types';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  RotateCw,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Hash,
} from 'lucide-react';

interface VerificationReportProps {
  report: VerificationReportData;
  isVerifying: boolean;
  onVerifyAgain: () => void;
  onRegenerateAudience: (target: 'audience1' | 'audience2' | 'both') => void;
  audience1: string;
  audience2: string;
}

export const VerificationReport: React.FC<VerificationReportProps> = ({
  report,
  isVerifying,
  onVerifyAgain,
  onRegenerateAudience,
  audience1,
  audience2,
}) => {
  const [filter, setFilter] = useState<'ALL' | ClaimClassification>('ALL');

  const filteredClaims = report.claims.filter((c) => {
    if (filter === 'ALL') return true;
    return c.classification === filter;
  });

  const hasAudience1Flags = report.claims.some(
    (c) => c.audience === audience1 && c.classification === 'UNSUPPORTED'
  );
  const hasAudience2Flags = report.claims.some(
    (c) => c.audience === audience2 && c.classification === 'UNSUPPORTED'
  );

  const groundingPercent =
    report.totalClaims > 0
      ? Math.round((report.supportedCount / report.totalClaims) * 100)
      : 100;


  return (
    <Card className="border-border shadow-card bg-surface rounded-xl overflow-hidden">
      <CardHeader className="p-3.5 px-4 pb-2.5 border-b border-border/80 bg-surface">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border ${
                report.overallStatus === 'PASSED'
                  ? 'bg-success-subtle text-success border-success-border'
                  : report.overallStatus === 'FLAGGED'
                  ? 'bg-error-subtle text-error border-error-border'
                  : 'bg-warning-subtle text-warning border-warning-border'
              }`}
            >
              {report.overallStatus === 'PASSED' ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : report.overallStatus === 'FLAGGED' ? (
                <ShieldAlert className="w-3.5 h-3.5" />
              ) : (
                <ShieldQuestion className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-xs font-semibold tracking-tight text-text-primary uppercase font-mono">
                Factual Claim Verification Ledger
              </CardTitle>
              <Badge
                variant={
                  report.overallStatus === 'PASSED'
                    ? 'success'
                    : report.overallStatus === 'FLAGGED'
                    ? 'error'
                    : 'warning'
                }
                size="sm"
                dot
              >
                {report.overallStatus === 'PASSED'
                  ? 'VERIFIED (100% GROUNDED)'
                  : report.overallStatus === 'FLAGGED'
                  ? 'UNSUPPORTED SPECS DETECTED'
                  : 'REQUIRES REVIEW'}
              </Badge>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onVerifyAgain}
            isLoading={isVerifying}
            leftIcon={<RotateCw className="w-3 h-3" />}
            className="text-xs self-start sm:self-auto h-7 px-2"
          >
            Re-audit
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3.5">
        {/* Metric summary counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2 rounded-lg border border-border bg-neutral-50/50 flex flex-col gap-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">
              Claims Checked
            </span>
            <span className="text-base font-mono font-bold text-text-primary">
              {report.totalClaims}
            </span>
          </div>

          <div className="p-2 rounded-lg border border-success-border bg-success-subtle/50 flex flex-col gap-0.5">
            <span className="text-[10px] font-mono text-success uppercase tracking-wider flex items-center gap-1 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Supported
            </span>
            <span className="text-base font-mono font-bold text-success">
              {report.supportedCount}
            </span>
          </div>

          <div
            className={`p-2 rounded-lg border flex flex-col gap-0.5 ${
              report.unsupportedCount > 0
                ? 'border-error-border bg-error-subtle'
                : 'border-border bg-neutral-50/50'
            }`}
          >
            <span
              className={`text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 font-semibold ${
                report.unsupportedCount > 0 ? 'text-error' : 'text-text-secondary'
              }`}
            >
              <XCircle className="w-3 h-3" /> Unsupported
            </span>
            <span
              className={`text-base font-mono font-bold ${
                report.unsupportedCount > 0 ? 'text-error' : 'text-text-primary'
              }`}
            >
              {report.unsupportedCount}
            </span>
          </div>

          <div
            className={`p-2 rounded-lg border flex flex-col gap-0.5 ${
              report.needsReviewCount > 0
                ? 'border-warning-border bg-warning-subtle'
                : 'border-border bg-neutral-50/50'
            }`}
          >
            <span
              className={`text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 font-semibold ${
                report.needsReviewCount > 0 ? 'text-warning' : 'text-text-secondary'
              }`}
            >
              <HelpCircle className="w-3 h-3" /> Needs Review
            </span>
            <span
              className={`text-base font-mono font-bold ${
                report.needsReviewCount > 0 ? 'text-warning' : 'text-text-primary'
              }`}
            >
              {report.needsReviewCount}
            </span>
          </div>
        </div>

        {/* Actionable Alert when unsupported claims exist */}
        {report.unsupportedCount > 0 && (
          <Alert variant="error" title="Unsupported Product Specifications Flagged">
            <div className="space-y-1.5 mt-1 text-xs">
              <p>
                The generator introduced specifications that were not in your original verified feature list.
                Regenerate the affected description to maintain strict factual adherence.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {hasAudience1Flags && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => onRegenerateAudience('audience1')}
                    leftIcon={<RotateCw className="w-3 h-3" />}
                    className="text-xs h-7"
                  >
                    Regenerate {audience1}
                  </Button>
                )}
                {hasAudience2Flags && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => onRegenerateAudience('audience2')}
                    leftIcon={<RotateCw className="w-3 h-3" />}
                    className="text-xs h-7"
                  >
                    Regenerate {audience2}
                  </Button>
                )}
              </div>
            </div>
          </Alert>
        )}

        {/* Filter Pills */}
        <div className="flex items-center justify-between border-b border-border pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono uppercase text-text-muted">Filter:</span>
            {(['ALL', 'SUPPORTED', 'UNSUPPORTED', 'NEEDS REVIEW'] as const).map((opt) => {
              const count =
                opt === 'ALL'
                  ? report.totalClaims
                  : opt === 'SUPPORTED'
                  ? report.supportedCount
                  : opt === 'UNSUPPORTED'
                  ? report.unsupportedCount
                  : report.needsReviewCount;
              const isSelected = filter === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFilter(opt)}
                  className={`text-[11px] px-2 py-0.5 rounded transition-all font-mono ${
                    isSelected
                      ? 'bg-neutral-900 text-white font-medium'
                      : 'text-text-secondary hover:text-text-primary bg-neutral-100'
                  }`}
                >
                  {opt === 'ALL' ? 'All' : opt === 'SUPPORTED' ? 'Supported' : opt === 'UNSUPPORTED' ? 'Unsupported' : 'Review'} ({count})
                </button>
              );
            })}
          </div>

          <span className="text-[10px] text-text-muted font-mono hidden sm:inline">
            {filteredClaims.length} records shown
          </span>
        </div>

        {/* Claim Ledger Rows */}
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {filteredClaims.length === 0 ? (
            <div className="text-center py-4 text-text-secondary text-xs">
              No claims match this filter.
            </div>
          ) : (
            filteredClaims.map((claim) => (
              <div
                key={claim.id}
                className={`p-2.5 rounded-lg border text-xs flex flex-col gap-1.5 transition-colors ${
                  claim.classification === 'SUPPORTED'
                    ? 'border-success-border/60 bg-success-subtle/20'
                    : claim.classification === 'UNSUPPORTED'
                    ? 'border-error-border bg-error-subtle/30'
                    : 'border-warning-border/60 bg-warning-subtle/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <span className="mt-0.5 shrink-0">
                      {claim.classification === 'SUPPORTED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                      ) : claim.classification === 'UNSUPPORTED' ? (
                        <XCircle className="w-3.5 h-3.5 text-error" />
                      ) : (
                        <HelpCircle className="w-3.5 h-3.5 text-warning" />
                      )}
                    </span>
                    <div className="space-y-0.5">
                      <p className="font-medium text-text-primary text-xs leading-relaxed font-sans">
                        &ldquo;{claim.claimText}&rdquo;
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-text-secondary font-mono">
                        <span>Target: <strong>{claim.audience}</strong></span>
                        {claim.isNumericalOrMetric && (
                          <span className="inline-flex items-center gap-0.5 text-accent font-medium">
                            <Hash className="w-3 h-3" /> Metric Check
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant={
                      claim.classification === 'SUPPORTED'
                        ? 'success'
                        : claim.classification === 'UNSUPPORTED'
                        ? 'error'
                        : 'warning'
                    }
                    size="sm"
                    dot
                  >
                    {claim.classification}
                  </Badge>
                </div>

                <div className="bg-surface rounded px-2.5 py-1 text-[11px] text-text-secondary border border-border">
                  <span className="font-medium text-text-primary">Evidence: </span>
                  {claim.reason}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>

      <CardFooter className="p-2.5 px-4 border-t border-border bg-neutral-50/50 flex flex-col sm:flex-row gap-2 items-center justify-between text-[11px] text-text-secondary">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-text-muted shrink-0" />
          <span>
            Hybrid verification: Deterministic metric pattern matching + Semantic grounding against supplied specs.
          </span>
        </div>
        <span className="font-mono text-[10px] text-text-muted">
          Grounding Ratio: {groundingPercent}%
        </span>
      </CardFooter>
    </Card>
  );
};

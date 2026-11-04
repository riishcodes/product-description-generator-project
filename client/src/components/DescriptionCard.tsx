import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './arc/Card';
import { Badge } from './arc/Badge';
import { Button } from './arc/Button';
import { CopyButton } from './arc/CopyButton';
import { RotateCw, CheckCircle2, AlertOctagon, Clock, Copy, Check } from 'lucide-react';
import { GeneratedDescription } from '../types';

interface DescriptionCardProps {
  description: GeneratedDescription;
  index: 1 | 2;
  onRegenerate: () => void;
  isRegenerating: boolean;
  unsupportedClaimsCount?: number;
}

export const DescriptionCard: React.FC<DescriptionCardProps> = ({
  description,
  index,
  onRegenerate,
  isRegenerating,
  unsupportedClaimsCount = 0,
}) => {
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const isFlagged = unsupportedClaimsCount > 0;
  const wordCount = description.wordCount;
  const approxSeconds = Math.max(5, Math.ceil((wordCount / 200) * 60));

  // Audience styling accents
  const getAudienceTheme = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('student')) {
      return {
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
        headerBorder: 'border-b-indigo-500/20',
        accentBar: 'bg-indigo-500',
        lightBg: 'bg-indigo-50/20',
      };
    }
    if (lower.includes('professional')) {
      return {
        badgeBg: 'bg-blue-50 text-blue-700 border-blue-200/80',
        headerBorder: 'border-b-blue-500/20',
        accentBar: 'bg-blue-600',
        lightBg: 'bg-blue-50/20',
      };
    }
    if (lower.includes('tech')) {
      return {
        badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200/80',
        headerBorder: 'border-b-cyan-500/20',
        accentBar: 'bg-cyan-600',
        lightBg: 'bg-cyan-50/20',
      };
    }
    if (lower.includes('luxury')) {
      return {
        badgeBg: 'bg-amber-50 text-amber-800 border-amber-200/80',
        headerBorder: 'border-b-amber-500/20',
        accentBar: 'bg-amber-600',
        lightBg: 'bg-amber-50/20',
      };
    }
    if (lower.includes('budget')) {
      return {
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
        headerBorder: 'border-b-emerald-500/20',
        accentBar: 'bg-emerald-600',
        lightBg: 'bg-emerald-50/20',
      };
    }
    return {
      badgeBg: 'bg-neutral-100 text-text-primary border-neutral-200',
      headerBorder: 'border-b-neutral-300/30',
      accentBar: 'bg-neutral-600',
      lightBg: 'bg-neutral-50/20',
    };
  };

  const theme = getAudienceTheme(description.audience);

  // Split text into sentences for readability
  const sentences = description.text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const handleCopyMarkdown = async () => {
    const md = `### ${description.audience} Description\n\n${description.text}\n\n*Word count: ${description.wordCount}*`;
    try {
      await navigator.clipboard.writeText(md);
      setCopiedMarkdown(true);
      setTimeout(() => setCopiedMarkdown(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Card className="flex flex-col h-full bg-surface border-border shadow-card rounded-xl overflow-hidden group">
      {/* Top Accent Strip */}
      <div className={`h-1 w-full ${theme.accentBar}`} />

      <CardHeader className="p-4 pb-3 border-b border-border/80 bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded bg-neutral-100 text-text-primary text-xs font-mono font-semibold flex items-center justify-center border border-border">
              {index}
            </span>
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight text-text-primary">
                {description.audience}
              </CardTitle>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isFlagged ? (
              <Badge variant="error" size="sm" dot>
                <AlertOctagon className="w-3 h-3 mr-0.5" />
                {unsupportedClaimsCount} Flagged
              </Badge>
            ) : (
              <Badge variant="success" size="sm" dot>
                <CheckCircle2 className="w-3 h-3 mr-0.5" />
                Verified Factual
              </Badge>
            )}

            <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-neutral-100 text-text-secondary border border-border">
              {wordCount}w
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 flex-1 flex flex-col justify-between">
        {isRegenerating ? (
          <div className="h-32 flex flex-col items-center justify-center text-text-secondary gap-2 animate-pulse">
            <RotateCw className="w-5 h-5 animate-spin text-accent" />
            <p className="text-xs font-medium">Synthesizing verified copy for {description.audience}...</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="text-sm text-text-primary leading-relaxed font-sans select-text space-y-2">
              {sentences.map((sentence, sIdx) => (
                <span
                  key={sIdx}
                  className="inline hover:bg-amber-50/60 rounded px-1 transition-colors cursor-text"
                >
                  {sentence}{' '}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 text-[11px] text-text-muted border-t border-border/50 mt-4">
          <span className="flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3" />
            ~{approxSeconds}s reading time
          </span>
          <span className="font-mono text-[10px] text-text-secondary">
            Audience Matrix #{index}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-3 px-4 border-t border-border bg-neutral-50/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CopyButton value={description.text} label="Copy Text" size="sm" />
          <button
            type="button"
            onClick={handleCopyMarkdown}
            title="Copy as formatted Markdown"
            className="text-xs text-text-secondary hover:text-text-primary px-2 py-1 rounded border border-border bg-surface hover:bg-neutral-50 transition-colors flex items-center gap-1"
          >
            {copiedMarkdown ? (
              <>
                <Check className="w-3 h-3 text-success" />
                <span className="text-success font-medium">Copied MD</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>MD</span>
              </>
            )}
          </button>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          isLoading={isRegenerating}
          leftIcon={<RotateCw className="w-3 h-3" />}
          className="text-xs h-7"
        >
          Regenerate Card {index}
        </Button>
      </CardFooter>
    </Card>
  );
};

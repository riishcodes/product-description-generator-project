import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './arc/Card';
import { ComparisonData } from '../types';
import {
  GitCompare,
  Target,
  MessageSquare,
  Sparkles,
  Volume2,
  Users2,
  ArrowLeftRight,
} from 'lucide-react';

interface ComparisonPanelProps {
  comparison: ComparisonData;
  audience1: string;
  audience2: string;
}

export const ComparisonPanel: React.FC<ComparisonPanelProps> = ({
  comparison,
  audience1,
  audience2,
}) => {
  const comparisonRows = [
    {
      id: 'messaging',
      title: 'Messaging Angle',
      icon: <MessageSquare className="w-3.5 h-3.5 text-accent" />,
      content: comparison.messagingDifferences,
    },
    {
      id: 'benefits',
      title: 'Benefits Emphasized',
      icon: <Sparkles className="w-3.5 h-3.5 text-indigo-500" />,
      content: comparison.benefitsEmphasized,
    },
    {
      id: 'positioning',
      title: 'Market Positioning',
      icon: <Target className="w-3.5 h-3.5 text-blue-500" />,
      content: comparison.positioningSummary,
    },
    {
      id: 'tone',
      title: 'Tone & Style Adaptation',
      icon: <Volume2 className="w-3.5 h-3.5 text-amber-500" />,
      content: comparison.toneDifferences,
    },
    {
      id: 'addressing',
      title: 'Audience Addressing',
      icon: <Users2 className="w-3.5 h-3.5 text-emerald-500" />,
      content: comparison.audienceAddressingSummary,
    },
  ];

  return (
    <Card className="border-border shadow-card bg-surface rounded-xl overflow-hidden">
      <CardHeader className="p-3.5 px-4 pb-2.5 border-b border-border/80 bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-neutral-100 flex items-center justify-center text-text-primary border border-border">
              <GitCompare className="w-3.5 h-3.5" />
            </div>
            <CardTitle className="text-xs font-semibold tracking-tight text-text-primary uppercase font-mono">
              Audience Positioning Comparison
            </CardTitle>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-text-primary font-medium border border-border flex items-center gap-1">
            <span>{audience1}</span>
            <ArrowLeftRight className="w-3 h-3 text-text-muted" />
            <span>{audience2}</span>
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-2.5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {comparisonRows.map((row) => (
            <div
              key={row.id}
              className="p-3 rounded-lg border border-border bg-neutral-50/60 flex flex-col gap-1 text-xs"
            >
              <div className="flex items-center gap-1.5 font-semibold text-text-primary">
                {row.icon}
                <span className="font-mono text-[11px]">{row.title}</span>
              </div>
              <p className="text-text-secondary leading-relaxed text-[11px]">
                {row.content}
              </p>
            </div>
          ))}

          {/* Key Takeaway Summary Card */}
          <div className="p-3 rounded-lg border border-border bg-accent-subtle/40 flex flex-col justify-between gap-1 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-accent font-mono text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zero-Fabrication Synthesis</span>
            </div>
            <p className="text-text-secondary leading-relaxed text-[11px]">
              Both descriptions draw exclusively from the identical verified specification set, adapting tone, phrasing, and benefit emphasis without inventing unverified claims.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

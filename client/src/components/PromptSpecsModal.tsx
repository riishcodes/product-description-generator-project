import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './arc/Card';
import { Badge } from './arc/Badge';
import { ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

export const PromptSpecsModal: React.FC = () => {
  const prohibitedItems = [
    'Battery life & capacity (e.g. 40-hour battery, 5000 mAh)',
    'Dimensions & physical weight (e.g. 250 grams, 15 mm)',
    'Technical standards & versions (e.g. Bluetooth 5.3, aptX)',
    'Active Noise Cancellation (ANC) unless explicitly specified',
    'Wireless range claims (e.g. 20-metre range)',
    'Fast charging & charging speed figures',
    'Prices, warranties, and money-back guarantees',
    'Third-party ratings and unverifiable certifications (e.g. IPX8)',
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <Card className="border-border shadow-card bg-surface">
        <CardHeader className="p-4 pb-3 border-b border-border/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <CardTitle className="text-sm font-semibold tracking-tight text-text-primary">
                AI Generation Instruction Specification
              </CardTitle>
            </div>
            <Badge variant="accent" size="sm">
              Zero-Hallucination Policy
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4 text-xs">
          <div>
            <h4 className="font-semibold text-text-primary mb-1">System Prompt Constraint:</h4>
            <pre className="p-3 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap">
{`"You are a factual product copywriter.

Generate concise, engaging product descriptions using only the information explicitly provided by the user.

Never invent, assume or infer product specifications.
Every factual product claim must be supported by the original product information.
If information is missing, omit it rather than guessing.

Generate two distinct descriptions for the two supplied audiences.
Return valid structured JSON."`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-warning" />
              <span>Deterministic Prohibited Specifications Checked:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {prohibitedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded border border-border bg-neutral-50/50 flex items-center gap-2"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  <span className="text-text-secondary">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

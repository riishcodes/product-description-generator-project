import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './arc/Card';
import { Input } from './arc/Input';
import { Textarea } from './arc/Textarea';
import { Button } from './arc/Button';
import { Badge } from './arc/Badge';
import { AudienceSelector } from './AudienceSelector';
import { GenerateRequest, WritingTone, DescriptionLength } from '../types';
import { PRODUCT_PRESETS, ProductPreset } from '../constants/presets';
import {
  ArrowRight,
  SlidersHorizontal,
  Bookmark,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';

interface ProductFormProps {
  onGenerate: (data: GenerateRequest) => void;
  isLoading: boolean;
  productName: string;
  setProductName: (name: string) => void;
  features: string;
  setFeatures: (features: string) => void;
  audience1: string;
  setAudience1: (aud: string) => void;
  audience2: string;
  setAudience2: (aud: string) => void;
  tone: WritingTone;
  setTone: (tone: WritingTone) => void;
  length: DescriptionLength;
  setLength: (length: DescriptionLength) => void;
  onSelectPreset?: (preset: ProductPreset) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onGenerate,
  isLoading,
  productName,
  setProductName,
  features,
  setFeatures,
  audience1,
  setAudience1,
  audience2,
  setAudience2,
  tone,
  setTone,
  length,
  setLength,
  onSelectPreset,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newSpecInput, setNewSpecInput] = useState('');

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!productName.trim()) {
      newErrors.productName = 'Product name is required';
    }

    if (!features.trim()) {
      newErrors.features = 'At least one verified feature is required';
    }

    if (!audience1) {
      newErrors.audience1 = 'Target Audience 1 is required';
    }

    if (!audience2) {
      newErrors.audience2 = 'Target Audience 2 is required';
    } else if (audience1.toLowerCase() === audience2.toLowerCase()) {
      newErrors.audience2 = 'Audience 2 must be different from Audience 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (validate()) {
      onGenerate({
        productName: productName.trim(),
        features: features.trim(),
        audience1,
        audience2,
        tone,
        length,
      });
    }
  };

  const handleApplyPreset = (preset: ProductPreset) => {
    setProductName(preset.name);
    setFeatures(preset.features);
    setAudience1(preset.audience1);
    setAudience2(preset.audience2);
    setTone(preset.tone);
    setLength(preset.length);
    setErrors({});
    onSelectPreset?.(preset);
  };

  const featureLines = features
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean);

  const featureCount = featureLines.length;

  const handleAddSpec = () => {
    if (!newSpecInput.trim()) return;
    const updated = features.trim()
      ? `${features.trim()}\n${newSpecInput.trim()}`
      : newSpecInput.trim();
    setFeatures(updated);
    setNewSpecInput('');
    if (errors.features) setErrors((prev) => ({ ...prev, features: '' }));
  };

  const handleRemoveSpec = (index: number) => {
    const updated = featureLines.filter((_, i) => i !== index).join('\n');
    setFeatures(updated);
  };

  const toneOptions: Array<{ value: WritingTone; label: string; desc: string }> = [
    { value: 'Friendly and engaging', label: 'Friendly', desc: 'Relatable & conversational' },
    { value: 'Professional and informative', label: 'Professional', desc: 'Precise & work-oriented' },
    { value: 'Persuasive and sales-focused', label: 'Persuasive', desc: 'Benefit-driven & active' },
  ];

  const lengthOptions: Array<{ value: DescriptionLength; label: string; range: string }> = [
    { value: 'short', label: 'Short', range: '30–50 words' },
    { value: 'medium', label: 'Medium', range: '50–80 words' },
    { value: 'detailed', label: 'Detailed', range: '80–120 words' },
  ];

  return (
    <Card className="border-border shadow-card bg-surface rounded-xl overflow-hidden">
      <CardHeader className="p-4 pb-3 border-b border-border/80 bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center text-text-primary border border-border">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight text-text-primary">
                Product Specification Editor
              </CardTitle>
            </div>
          </div>
          <Badge variant={featureCount > 0 ? 'neutral' : 'warning'} size="sm">
            <span className="font-mono font-semibold">{featureCount}</span> verified {featureCount === 1 ? 'spec' : 'specs'}
          </Badge>
        </div>
      </CardHeader>

      {/* Quick Test Presets Carousel / Bar */}
      <div className="px-4 py-2.5 bg-neutral-50/70 border-b border-border/60">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Bookmark className="w-3 h-3 text-text-muted" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary font-medium">
            Test Case Presets:
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRODUCT_PRESETS.map((p) => {
            const isSelected = productName === p.name;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`text-[11px] px-2.5 py-1 rounded-md transition-all font-medium border flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-subtle'
                    : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-neutral-100 border-border'
                }`}
              >
                <span>{p.name}</span>
                <span className={`text-[9px] px-1 rounded font-mono ${isSelected ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-text-muted'}`}>
                  {p.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <CardContent className="p-4 space-y-4">
          {/* Product Name */}
          <Input
            label="Product Name"
            placeholder="e.g. Wireless Headphones"
            value={productName}
            onChange={(e) => {
              setProductName(e.target.value);
              if (errors.productName) setErrors((prev) => ({ ...prev, productName: '' }));
            }}
            error={errors.productName}
            required
          />

          {/* Product Features with Interactive Token Chips */}
          <div className="space-y-2">
            <Textarea
              label="Verified Product Features & Specs"
              placeholder="One specification per line:&#10;Bluetooth connectivity&#10;Lightweight design&#10;Cushioned ear pads&#10;Built-in microphone"
              value={features}
              onChange={(e) => {
                setFeatures(e.target.value);
                if (errors.features) setErrors((prev) => ({ ...prev, features: '' }));
              }}
              error={errors.features}
              required
              rows={4}
              helperText="The verifier audits all generated claims strictly against this verified list."
            />

            {/* Visual Feature Token Pills */}
            {featureLines.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block">
                  Active Verified Claims Ledger ({featureLines.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {featureLines.map((line, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-neutral-50 text-text-primary border border-border group hover:border-neutral-300 transition-colors"
                    >
                      <Check className="w-3 h-3 text-success shrink-0" />
                      <span className="font-medium">{line}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        title="Remove specification"
                        className="text-text-muted hover:text-error ml-0.5"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Add Spec Input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="+ Add verified feature (e.g. Cushioned ear pads)"
                value={newSpecInput}
                onChange={(e) => setNewSpecInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSpec();
                  }
                }}
                className="flex-1 bg-surface text-xs rounded-md border border-border px-3 py-1.5 placeholder:text-text-muted focus:outline-none focus:border-accent shadow-subtle"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSpec}
                className="text-xs h-7 px-2.5"
              >
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
          </div>

          {/* Dual Audience Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <AudienceSelector
              label="Audience 1"
              value={audience1}
              onChange={(val) => {
                setAudience1(val);
                if (errors.audience1) setErrors((prev) => ({ ...prev, audience1: '' }));
                if (val.toLowerCase() === audience2.toLowerCase()) {
                  setErrors((prev) => ({
                    ...prev,
                    audience2: 'Audience 2 must be different from Audience 1',
                  }));
                } else if (errors.audience2?.includes('different')) {
                  setErrors((prev) => ({ ...prev, audience2: '' }));
                }
              }}
              error={errors.audience1}
            />

            <AudienceSelector
              label="Audience 2"
              value={audience2}
              onChange={(val) => {
                setAudience2(val);
                if (errors.audience2) setErrors((prev) => ({ ...prev, audience2: '' }));
              }}
              disabledValue={audience1}
              error={errors.audience2}
            />
          </div>

          {/* Writing Tone Segmented Control */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-medium text-text-primary block">
              Writing Tone
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-neutral-100 border border-border">
              {toneOptions.map((t) => {
                const isSelected = tone === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTone(t.value)}
                    className={`py-1.5 px-2 rounded-md text-center transition-all select-none ${
                      isSelected
                        ? 'bg-surface text-text-primary font-semibold shadow-subtle border border-border/80'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="text-xs block leading-tight">{t.label}</span>
                    <span className="text-[10px] text-text-muted block truncate mt-0.5">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description Length Segmented Control */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-medium text-text-primary block">
              Target Length
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-neutral-100 border border-border">
              {lengthOptions.map((l) => {
                const isSelected = length === l.value;
                return (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setLength(l.value)}
                    className={`py-1.5 px-2 rounded-md text-center transition-all select-none ${
                      isSelected
                        ? 'bg-surface text-text-primary font-semibold shadow-subtle border border-border/80'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="text-xs block leading-tight">{l.label}</span>
                    <span className="text-[10px] font-mono text-text-muted block mt-0.5">{l.range}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-3 border-t border-border bg-neutral-50/60 flex items-center justify-between">
          <div className="text-[11px] text-text-secondary flex items-center gap-1 font-mono">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] shadow-subtle">⌘</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] shadow-subtle">Enter</kbd>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Generate & Audit
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

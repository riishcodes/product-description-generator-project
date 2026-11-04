import React from 'react';
import { PRODUCT_PRESETS, ProductPreset } from '../constants/presets';
import { X, Sparkles, Check } from 'lucide-react';

interface ExamplesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (preset: ProductPreset) => void;
  currentName: string;
}

export const ExamplesModal: React.FC<ExamplesModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  currentName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Product Presets & Examples</h3>
              <p className="text-xs text-slate-500">Pick an example to populate verified specifications</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {PRODUCT_PRESETS.map((p) => {
            const isSelected = p.name === currentName;
            return (
              <div
                key={p.id}
                onClick={() => {
                  onSelect(p);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-900">{p.name}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {p.category}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {p.features.split('\n').join(' • ')}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500 font-mono">
                  <span>Audiences: {p.audience1} vs {p.audience2}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};


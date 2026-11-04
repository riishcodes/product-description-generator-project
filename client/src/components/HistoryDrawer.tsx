import React from 'react';
import { X, Clock, Trash2 } from 'lucide-react';
import { GenerateResponse } from '../types';

export interface HistoryItem {
  id: string;
  timestamp: string;
  response: GenerateResponse;
  features?: string;
}

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Generation History</h3>
              <p className="text-xs text-slate-500">Recently generated product copy ({history.length})</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClear}
                title="Clear history"
                className="text-xs text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {history.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No generations recorded yet in this session.
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all space-y-2 bg-white"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-900">{item.response.productName}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-xs text-slate-600 space-y-1">
                  <div>
                    <span className="font-medium text-indigo-600">[{item.response.description1.audience}]:</span>{' '}
                    <span className="line-clamp-1">{item.response.description1.text}</span>
                  </div>
                  <div>
                    <span className="font-medium text-blue-600">[{item.response.description2.audience}]:</span>{' '}
                    <span className="line-clamp-1">{item.response.description2.text}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

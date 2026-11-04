import React, { useState } from 'react';
import { X, Key, Check, ExternalLink, AlertCircle } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  modelName: string;
  onSaveKey: (key: string) => Promise<boolean>;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  modelName,
  onSaveKey,
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      setErrorMsg('Please enter an API key');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const ok = await onSaveKey(keyInput.trim());
      if (ok) {
        setSuccessMsg(true);
        setTimeout(() => {
          setSuccessMsg(false);
          onClose();
        }, 1500);
      } else {
        setErrorMsg('Failed to initialize client with this key.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving key');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Google Gemini API Configuration</h3>
              <p className="text-xs text-slate-500">Live AI Engine connection</p>
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

        {/* Current Status Box */}
        <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
          isConnected
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-600 animate-pulse' : 'bg-amber-600'}`} />
            <span className="font-medium">
              {isConnected ? `Connected: ${modelName}` : 'Deterministic Engine (API key not yet set)'}
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase font-semibold">
            {isConnected ? 'Live AI' : 'Offline Mode'}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Gemini API Key
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              className="w-full bg-white text-xs text-slate-800 rounded-xl border border-slate-200 px-3.5 py-2.5 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all font-mono shadow-2xs"
            />
            <p className="text-[11px] text-slate-500 flex items-center justify-between">
              <span>Kept strictly server-side in <code>server/.env</code></span>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-0.5"
              >
                <span>Get API Key</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>Connected to Gemini successfully!</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'Connecting...' : 'Save & Connect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

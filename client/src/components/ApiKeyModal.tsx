import React, { useState } from 'react';
import { X, Key, Check, ExternalLink, AlertCircle, Trash2 } from 'lucide-react';
import { maskApiKey } from '../services/userKey';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** True when the deployment has an operator-supplied server key. */
  isServerConnected: boolean;
  /** The visitor's own key, stored in this browser. */
  userApiKey: string | null;
  modelName: string;
  onSaveKey: (key: string) => Promise<boolean>;
  onRemoveKey: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  isServerConnected,
  userApiKey,
  modelName,
  onSaveKey,
  onRemoveKey,
}) => {
  const [keyInput, setKeyInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isConnected = Boolean(userApiKey) || isServerConnected;

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
        setKeyInput('');
        setSuccessMsg(true);
        setTimeout(() => {
          setSuccessMsg(false);
          onClose();
        }, 1200);
      } else {
        setErrorMsg('This key could not be verified. Check it and try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not verify this key');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = () => {
    onRemoveKey();
    setKeyInput('');
    setErrorMsg(null);
    setSuccessMsg(false);
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
              <h3 className="text-base font-semibold text-slate-900">Gemini API Key</h3>
              <p className="text-xs text-slate-500">Use your own key for generation and verification</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close API key settings"
            className="text-slate-400 hover:text-slate-600 p-2 -m-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current status */}
        <div
          className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
            isConnected
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <div className="flex items-start gap-2 min-w-0">
            <span
              className={`w-2 h-2 mt-1 rounded-full shrink-0 ${
                isConnected ? 'bg-green-600 animate-pulse' : 'bg-amber-600'
              }`}
            />
            <div className="min-w-0">
              <p className="font-medium">
                {userApiKey
                  ? `Using your key (${maskApiKey(userApiKey)})`
                  : isServerConnected
                  ? `Connected with the app's key`
                  : 'No key configured — deterministic mode'}
              </p>
              <p className="text-[10px] opacity-80 mt-0.5 break-words">
                {userApiKey
                  ? 'Stored in this browser only. Never saved on the server.'
                  : isServerConnected
                  ? `Model: ${modelName}`
                  : 'Generation still works, but without live AI copy.'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase font-semibold shrink-0">
            {userApiKey ? 'Your Key' : isServerConnected ? 'Server Key' : 'Offline'}
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-3 pt-1">
          <div className="space-y-1.5">
            <label htmlFor="gemini-api-key" className="text-xs font-semibold text-slate-700 block">
              {userApiKey ? 'Replace your key' : 'Paste your Gemini API key'}
            </label>
            <input
              id="gemini-api-key"
              type="password"
              placeholder="AIzaSy..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-white text-base sm:text-xs text-slate-800 rounded-xl border border-slate-200 px-3.5 py-2.5 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 transition-all font-mono shadow-sm"
            />
            <p className="text-[11px] text-slate-500 flex items-start justify-between gap-2">
              <span className="leading-relaxed">
                Stored in this browser and sent to this app's API over HTTPS. It is never saved on the server.
              </span>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center gap-0.5 shrink-0"
              >
                <span>Get a key</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="break-words">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>Key verified and saved in this browser.</span>
            </div>
          )}

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
            {userApiKey ? (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove my key</span>
              </button>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2 ml-auto">
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
                className="px-4 py-2 min-h-[36px] text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Verifying...' : 'Verify & use'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

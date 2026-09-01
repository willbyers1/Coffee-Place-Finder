import React, { useState } from 'react';
import { X, Key, ShieldCheck, Check, Trash2, ExternalLink, Lock, AlertTriangle } from 'lucide-react';
import { ByokStatus } from '../lib/types';

interface ByokModalProps {
  isOpen: boolean;
  onClose: () => void;
  byokStatus: ByokStatus;
  onSaveKey: (key: string) => Promise<void>;
  onRemoveKey: () => Promise<void>;
}

export const ByokModal: React.FC<ByokModalProps> = ({
  isOpen,
  onClose,
  byokStatus,
  onSaveKey,
  onRemoveKey,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim() || apiKeyInput.trim().length < 10) {
      setStatusMsg({ type: 'error', text: 'Please enter a valid Google Maps API Key.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      await onSaveKey(apiKeyInput.trim());
      setStatusMsg({ type: 'success', text: 'API Key encrypted and saved successfully!' });
      setApiKeyInput('');
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save API key' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (confirm('Are you sure you want to remove your custom Google Maps API key?')) {
      setIsSubmitting(true);
      setStatusMsg(null);
      try {
        await onRemoveKey();
        setStatusMsg({ type: 'success', text: 'Custom key removed.' });
      } catch (err: any) {
        setStatusMsg({ type: 'error', text: err.message || 'Failed to remove API key' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E8E2D9] w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col text-[#2C1810]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D9] bg-[#FAF7F2]">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-[#5D4037] text-white">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#5D4037]">BYOK — Bring Your Own Key</h2>
              <p className="text-xs text-[#7A6860]">Configure your Google Maps API Key</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#7A6860] hover:text-[#5D4037] hover:bg-white border border-[#E8E2D9] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          {/* Current Key Status Card */}
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8E2D9] flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#7A6860]">Current Key Status</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${byokStatus.configured ? 'bg-emerald-500' : 'bg-[#D4A373]'}`} />
                <span className="font-bold text-sm text-[#5D4037]">
                  {byokStatus.configured ? 'Active Key Configured' : 'Using Default System Key'}
                </span>
              </div>
              {byokStatus.maskedKey && (
                <p className="text-xs font-mono text-[#5D4037] mt-1">
                  Key: {byokStatus.maskedKey}
                </p>
              )}
            </div>

            {byokStatus.source === 'user' && (
              <button
                onClick={handleRemove}
                disabled={isSubmitting}
                className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
                title="Remove Custom Key"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium border ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {statusMsg.text}
            </div>
          )}

          {/* Explanation Box */}
          <div className="text-xs text-[#2C1810] space-y-2 bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E8E2D9]">
            <p className="font-semibold text-[#5D4037] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#5D4037]" />
              AES-256 Server-Side Encryption
            </p>
            <p className="text-[#7A6860] leading-relaxed">
              Your API key is encrypted at rest on our server using server-side AES-256-GCM encryption. It is never logged or exposed in plain text in network API responses.
            </p>
            <a
              href="https://console.cloud.google.com/google/maps-apis/credentials"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#5D4037] hover:underline font-bold"
            >
              <span>Get a Google Maps API Key in Google Cloud Console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#5D4037] mb-1 block">
                Enter your Google Maps API Key
              </label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8E2D9] rounded-md px-3 py-2.5 text-xs text-[#2C1810] placeholder-[#7A6860]/60 font-mono focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-white hover:bg-[#FAF7F2] text-[#7A6860] text-xs font-semibold rounded-md border border-[#E8E2D9]"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#5D4037] hover:bg-[#432C25] text-white font-bold text-xs rounded-md shadow-xs transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Validating & Saving...' : 'Save & Validate Key'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

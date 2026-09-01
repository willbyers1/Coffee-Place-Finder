import React, { useState } from 'react';
import { X, User, Mail, Lock, Sparkles, LogIn } from 'lucide-react';
import { User as UserType } from '../lib/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType, token: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login' ? { email, password } : { email, password, name };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.user, data.token);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error authenticating');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setEmail('demo@coffeeshopfinder.com');
    setPassword('demo123456');
    setMode('login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-[#E8E2D9] w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col text-[#2C1810]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E2D9] bg-[#FAF7F2]">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-[#5D4037] text-white font-bold">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-[#5D4037]">
              {mode === 'login' ? 'Log In to Coffee Shop Finder' : 'Create Account'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[#7A6860] hover:text-[#5D4037] hover:bg-white border border-[#E8E2D9] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#E8E2D9] bg-[#FAF7F2] p-1">
          <button
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${
              mode === 'login' ? 'bg-white text-[#5D4037] shadow-2xs border border-[#E8E2D9]' : 'text-[#7A6860] hover:text-[#5D4037]'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${
              mode === 'register' ? 'bg-white text-[#5D4037] shadow-2xs border border-[#E8E2D9]' : 'text-[#7A6860] hover:text-[#5D4037]'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Quick Demo Fill Button */}
          <button
            type="button"
            onClick={fillDemoAccount}
            className="w-full py-2 px-3 bg-[#FAF7F2] hover:bg-[#F0ECE7] text-[#5D4037] border border-[#E8E2D9] text-xs font-bold rounded-lg flex items-center justify-center space-x-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#D4A373]" />
            <span>Click to Auto-Fill Demo Account</span>
          </button>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
              {errorMsg}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="text-xs font-semibold text-[#5D4037] mb-1 block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#7A6860] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#E8E2D9] rounded-md pl-9 pr-3 py-2 text-xs text-[#2C1810] placeholder-[#7A6860]/60 focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#5D4037] mb-1 block">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#7A6860] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8E2D9] rounded-md pl-9 pr-3 py-2 text-xs text-[#2C1810] placeholder-[#7A6860]/60 focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#5D4037] mb-1 block">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#7A6860] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-[#E8E2D9] rounded-md pl-9 pr-3 py-2 text-xs text-[#2C1810] placeholder-[#7A6860]/60 focus:outline-none focus:ring-2 focus:ring-[#5D4037]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#5D4037] hover:bg-[#432C25] text-white font-bold text-sm rounded-md shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Processing...' : mode === 'login' ? 'Log In' : 'Create Account'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

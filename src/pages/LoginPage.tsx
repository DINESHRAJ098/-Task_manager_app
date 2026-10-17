import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { CheckSquare, Lock, Mail, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

interface LoginPageProps {
  onSwitchToRegister: () => void;
  onOpenDocs: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSwitchToRegister,
  onOpenDocs,
}) => {
  const { login, fillDemoUser, error, clearError, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    try {
      await login(email, password);
    } catch {
      // Error handled by AuthContext
    }
  };

  const handleFillDemo = async () => {
    setEmail('alex@example.com');
    setPassword('Password123!');
    clearError();
    setLocalError(null);
    try {
      await fillDemoUser();
    } catch {
      // Error handled
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-indigo-600 text-white items-center justify-center shadow-sm mb-3">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to access your task dashboard and real-time filters
          </p>
        </div>

        {/* Demo Account Quick-Fill Card */}
        <div className="mb-6 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-semibold text-indigo-950 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Explore Demo Account</span>
            </div>
            <div className="text-slate-600 text-[11px] mt-0.5">
              Pre-seeded with tasks, stats, and JWT auth
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            disabled={isLoading}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            1-Click Login
          </button>
        </div>

        {displayError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'Signing in...' : 'Sign In with JWT'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Switch to Register */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
          <span>Don't have an account yet? </span>
          <button
            onClick={onSwitchToRegister}
            className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline cursor-pointer"
          >
            Create an account
          </button>
        </div>

        {/* Docs Button */}
        <div className="mt-4 text-center">
          <button
            onClick={onOpenDocs}
            className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            View Full-Stack MERN Architecture Guide
          </button>
        </div>
      </div>
    </div>
  );
};

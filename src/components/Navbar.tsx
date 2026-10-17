import React from 'react';
import { CheckSquare, LogOut, Code, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps {
  onOpenDocs: () => void;
  onOpenNewTask?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDocs, onOpenNewTask }) => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
            <CheckSquare className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            Task Manager
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-slate-900 transition-colors whitespace-nowrap text-slate-900 font-semibold cursor-pointer"
          >
            Dashboard
          </button>
          <button
            onClick={onOpenDocs}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer text-slate-600"
          >
            <Code className="w-4 h-4 text-slate-500" />
            <span>Architecture & API Guide</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action / User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {onOpenNewTask && (
                <button
                  onClick={onOpenNewTask}
                  className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap cursor-pointer"
                >
                  + New Task
                </button>
              )}

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs text-slate-600">
                <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-medium text-slate-900 truncate max-w-[120px]">{user.name}</div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[120px]">{user.email}</div>
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign out of your account"
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenDocs}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Docs
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

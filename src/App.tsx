/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ProjectDocsModal } from './components/ProjectDocsModal.js';
import { CheckSquare } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md animate-bounce mb-3">
          <CheckSquare className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-slate-600">Initializing Task Manager...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Navigation */}
      <Navbar
        onOpenDocs={() => setIsDocsOpen(true)}
        onOpenNewTask={isAuthenticated ? () => setIsCreateModalOpen(true) : undefined}
      />

      {/* Main Content Area */}
      <div className="flex-1">
        {isAuthenticated ? (
          <DashboardPage
            onOpenDocs={() => setIsDocsOpen(true)}
            isCreateModalOpen={isCreateModalOpen}
            setIsCreateModalOpen={setIsCreateModalOpen}
          />
        ) : authView === 'login' ? (
          <LoginPage
            onSwitchToRegister={() => setAuthView('register')}
            onOpenDocs={() => setIsDocsOpen(true)}
          />
        ) : (
          <RegisterPage
            onSwitchToLogin={() => setAuthView('login')}
            onOpenDocs={() => setIsDocsOpen(true)}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Task Manager Application</span>
            <span aria-hidden="true">·</span>
            <span>MERN Stack (MongoDB, Express, React, Node.js)</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDocsOpen(true)}
              className="hover:text-indigo-600 transition-colors cursor-pointer"
            >
              Full Code & Setup Guide
            </button>
            <span aria-hidden="true">·</span>
            <span>JWT Bearer Protected</span>
          </div>
        </div>
      </footer>

      {/* Architecture and Setup Guide Modal */}
      <ProjectDocsModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FolderTree, ShieldCheck, Database, Server } from 'lucide-react';

interface ProjectDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDocsModal: React.FC<ProjectDocsModalProps> = ({ isOpen, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'setup' | 'structure' | 'backend' | 'api'>('setup');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const envContent = `# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Connection String
# Local MongoDB: mongodb://localhost:27017/taskmanager
# MongoDB Atlas: mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskmanager?retryWrites=true&w=majority
MONGODB_URI=mongodb://localhost:27017/taskmanager

# JWT Secret for Signing Authentication Tokens
JWT_SECRET=super_secret_jwt_encryption_key_change_in_production_2026`;

  const setupCommands = `# 1. Clone repository & install dependencies
git clone <your-repo-url>
cd task-manager-application
npm install

# 2. Configure environment variables
cp .env.example .env
# Edit .env with your MongoDB URI & JWT Secret

# 3. Start development server (Node Express API + React Vite)
npm run dev

# 4. Open browser
http://localhost:3000`;

  const concurrentScript = `// package.json scripts to run concurrently in standalone setups:
{
  "scripts": {
    "dev": "tsx server.ts",
    "dev:concurrent": "concurrently \\"npm run server\\" \\"npm run client\\"",
    "server": "nodemon backend/server.js",
    "client": "vite",
    "build": "vite build",
    "start": "node server.js"
  }
}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">MERN Task Manager Architecture Guide</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Production-ready project structure, environment configuration, and execution instructions
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('setup')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'setup'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Setup & Concurrently
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'structure'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Folder Structure
          </button>
          <button
            onClick={() => setActiveTab('backend')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'backend'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            Backend & Mongoose Models
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'api'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            REST API Endpoints
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs">
          {activeTab === 'setup' && (
            <div className="space-y-6">
              {/* Environment Variables */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <span>1. Environment Setup (.env)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(envContent, 'env')}
                    className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    {copiedKey === 'env' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'env' ? 'Copied' : 'Copy .env'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {envContent}
                </pre>
              </div>

              {/* Install and Run Commands */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Terminal className="w-4 h-4 text-indigo-600" />
                    <span>2. Install Dependencies & Run Server</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(setupCommands, 'cmd')}
                    className="flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    {copiedKey === 'cmd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'cmd' ? 'Copied' : 'Copy commands'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {setupCommands}
                </pre>
              </div>

              {/* Concurrently Setup */}
              <div>
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-2">
                  <Server className="w-4 h-4 text-indigo-600" />
                  <span>3. Running Backend & Frontend Concurrently (Option)</span>
                </div>
                <p className="text-slate-600 mb-2">
                  In this unified project, Express mounts Vite middlewares directly in development on port 3000. If you prefer running separate processes for backend (port 5000) and frontend (port 3000), install <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">concurrently</code>:
                </p>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {concurrentScript}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'structure' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <FolderTree className="w-4 h-4 text-indigo-600" />
                <span>Clean Project Folder Structure</span>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] leading-relaxed overflow-x-auto">
{`task-manager-application/
├── backend/
│   ├── config/
│   │   └── db.ts                   # MongoDB connection & auto-healing fallback
│   ├── models/
│   │   ├── User.ts                 # Mongoose User model with bcrypt pre-save hash
│   │   └── Task.ts                 # Mongoose Task model (title, desc, priority, status, dueDate, user)
│   ├── middleware/
│   │   └── authMiddleware.ts       # JWT Bearer token verification & user context injection
│   ├── routes/
│   │   ├── authRoutes.ts           # POST /register, POST /login, GET /me
│   │   └── taskRoutes.ts           # Protected CRUD + stats + search + filtering
│   └── server.ts                   # Express application routes & error handling
│
├── frontend (src/)/
│   ├── components/
│   │   ├── Navbar.tsx              # Top bar with logo, profile, docs trigger
│   │   ├── TaskStats.tsx           # Statistical summary metrics with tabular numerals
│   │   ├── TaskFilterBar.tsx       # Status tabs, priority filter, search input, sorting
│   │   ├── TaskCard.tsx            # Task item, priority, due date, status toggle
│   │   ├── TaskModal.tsx           # Create & Edit task dialog with validation
│   │   ├── DeleteConfirmModal.tsx  # Task deletion confirmation dialog
│   │   └── ProjectDocsModal.tsx    # In-app architecture & setup documentation
│   ├── context/
│   │   └── AuthContext.tsx         # React Auth context (login, register, logout, persistence)
│   ├── pages/
│   │   ├── DashboardPage.tsx       # Main authenticated tasks dashboard
│   │   ├── LoginPage.tsx           # User login with 1-click Demo credentials
│   │   └── RegisterPage.tsx        # User registration form
│   ├── services/
│   │   └── api.ts                  # Fetch API client with Bearer token injection
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── App.tsx                     # Top-level application controller
│   └── main.tsx                    # React DOM entry point
│
├── server.ts                       # Full-stack root entry point (Express + Vite middleware)
├── .env.example                    # Environment variable template
└── package.json                    # Project scripts & dependencies`}
              </pre>
            </div>
          )}

          {activeTab === 'backend' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Security & Architecture Highlights</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-900">User Schema & Security</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Passwords are encrypted before storage using <code className="text-indigo-600 font-mono">bcryptjs</code> with 10 salt rounds. Passwords are never returned in JSON responses.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Unique indexed email verification</li>
                    <li>Pre-save hook hashes updated passwords</li>
                    <li>Instance method <code className="text-indigo-600 font-mono">matchPassword()</code></li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-900">Task Schema & Ownership</h4>
                  <p className="text-slate-600 leading-relaxed">
                    Every task is strictly bound to an authenticated user ID via <code className="text-indigo-600 font-mono">user: ObjectId</code>.
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    <li>Enums: Low, Medium, High Priority</li>
                    <li>Enums: Pending, In Progress, Completed</li>
                    <li>Ownership checks on GET, PUT, and DELETE</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Server className="w-4 h-4 text-indigo-600" />
                <span>Complete RESTful API Specification</span>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                      <th className="p-3">Method</th>
                      <th className="p-3">Endpoint</th>
                      <th className="p-3">Access</th>
                      <th className="p-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr>
                      <td className="p-3 font-bold text-emerald-600">POST</td>
                      <td className="p-3">/api/auth/register</td>
                      <td className="p-3 font-sans text-slate-500">Public</td>
                      <td className="p-3 font-sans">Register new user & return JWT token</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-emerald-600">POST</td>
                      <td className="p-3">/api/auth/login</td>
                      <td className="p-3 font-sans text-slate-500">Public</td>
                      <td className="p-3 font-sans">Authenticate credentials & return JWT token</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-indigo-600">GET</td>
                      <td className="p-3">/api/auth/me</td>
                      <td className="p-3 font-sans text-amber-600">Protected</td>
                      <td className="p-3 font-sans">Get authenticated user context</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-indigo-600">GET</td>
                      <td className="p-3">/api/tasks</td>
                      <td className="p-3 font-sans text-amber-600">Protected</td>
                      <td className="p-3 font-sans">Get tasks with filters (?status, ?priority, ?search, ?sortBy)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-indigo-600">GET</td>
                      <td className="p-3">/api/tasks/stats</td>
                      <td className="p-3 font-sans text-amber-600">Protected</td>
                      <td className="p-3 font-sans">Get count metrics (pending, in progress, completed, overdue)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-emerald-600">POST</td>
                      <td className="p-3">/api/tasks</td>
                      <td className="p-3 font-sans text-amber-600">Protected</td>
                      <td className="p-3 font-sans">Create a new task for the authenticated user</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-amber-600">PUT</td>
                      <td className="p-3">/api/tasks/:id</td>
                      <td className="p-3 font-sans text-amber-600">Protected</td>
                      <td className="p-3 font-sans">Update task details or change status</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-rose-600">DELETE</td>
                      <td className="p-3">/api/tasks/:id</td>
                      <td className="p-3 font-sans text-amber-600">Protected</td>
                      <td className="p-3 font-sans">Delete task (with ownership validation)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-[11px] text-slate-500">
            Task Manager API v1.0.0 · MongoDB & Express Backend
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

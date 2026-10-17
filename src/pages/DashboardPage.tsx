import React, { useState, useEffect, useCallback } from 'react';
import { Task, TaskStats as ITaskStats, TaskFilterOptions, TaskPriority, TaskStatus } from '../types/index.js';
import { taskApi } from '../services/api.js';
import { TaskStats } from '../components/TaskStats.js';
import { TaskFilterBar } from '../components/TaskFilterBar.js';
import { TaskCard } from '../components/TaskCard.js';
import { TaskModal } from '../components/TaskModal.js';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal.js';
import { Plus, CheckSquare, Search, RefreshCw, AlertCircle } from 'lucide-react';

interface DashboardPageProps {
  onOpenDocs: () => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenDocs,
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<ITaskStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search State
  const [filters, setFilters] = useState<TaskFilterOptions>({
    status: 'All',
    priority: 'All',
    search: '',
    sortBy: 'createdAt',
    order: 'desc',
  });

  // Modal States
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch Tasks and Stats
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [tasksRes, statsRes] = await Promise.all([
        taskApi.getTasks(filters),
        taskApi.getStats(),
      ]);
      setTasks(tasksRes.tasks || []);
      setStats(statsRes.stats || null);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to load tasks from server');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Filter Changes
  const handleFilterChange = (updated: Partial<TaskFilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: 'All',
      priority: 'All',
      search: '',
      sortBy: 'createdAt',
      order: 'desc',
    });
  };

  // Create or Update Task Handler
  const handleSaveTask = async (data: {
    title: string;
    description: string;
    dueDate?: string;
    priority: TaskPriority;
    status: TaskStatus;
    tags: string[];
  }) => {
    if (editingTask) {
      // Update existing
      await taskApi.updateTask(editingTask._id, data);
      setEditingTask(null);
    } else {
      // Create new
      await taskApi.createTask(data);
    }
    // Refresh list and stats
    await fetchDashboardData();
  };

  // Quick Status Toggle Handler directly on Task Card
  const handleQuickStatusChange = async (task: Task, newStatus: TaskStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: newStatus } : t))
    );

    try {
      await taskApi.updateTask(task._id, { status: newStatus });
      // Update stats silently
      const statsRes = await taskApi.getStats();
      setStats(statsRes.stats);
    } catch (err) {
      console.error('Failed to change task status:', err);
      // Revert if error
      fetchDashboardData();
    }
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async (task: Task) => {
    setIsDeleting(true);
    try {
      await taskApi.deleteTask(task._id);
      setDeletingTask(null);
      await fetchDashboardData();
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Task Workspace</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize tasks, monitor deadlines, and filter by priority in real time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchDashboardData()}
            title="Refresh Tasks"
            disabled={isLoading}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setEditingTask(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <TaskStats
        stats={stats}
        activeStatus={filters.status}
        onSelectStatus={(s) => handleFilterChange({ status: s })}
      />

      {/* Interactive Filter & Search Bar */}
      <TaskFilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        totalFilteredCount={tasks.length}
      />

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-rose-700 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchDashboardData()}
            className="underline font-medium hover:text-rose-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tasks Grid or Empty States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-12 bg-slate-200 rounded" />
              </div>
              <div className="h-5 w-3/4 bg-slate-200 rounded" />
              <div className="h-12 w-full bg-slate-100 rounded" />
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <div className="h-3 w-16 bg-slate-200 rounded" />
                <div className="h-3 w-20 bg-slate-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={(t) => {
                setEditingTask(t);
                setIsCreateModalOpen(true);
              }}
              onDelete={(t) => setDeletingTask(t)}
              onStatusChange={handleQuickStatusChange}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto my-6">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No tasks found</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            {filters.search || filters.status !== 'All' || filters.priority !== 'All'
              ? 'No tasks match the selected search criteria or status filter. Try resetting filters to see all tasks.'
              : 'You have not added any tasks to your workspace yet. Click the button below to create your first task.'}
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            {filters.search || filters.status !== 'All' || filters.priority !== 'All' ? (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                Clear All Filters
              </button>
            ) : null}

            <button
              onClick={() => {
                setEditingTask(null);
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              + Create First Task
            </button>
          </div>
        </div>
      )}

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialTask={editingTask}
      />

      {/* Task Deletion Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingTask}
        task={deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </main>
  );
};

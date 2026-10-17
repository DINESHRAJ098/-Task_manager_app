import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { TaskFilterOptions } from '../types/index.js';

interface TaskFilterBarProps {
  filters: TaskFilterOptions;
  onChange: (updated: Partial<TaskFilterOptions>) => void;
  onReset: () => void;
  totalFilteredCount: number;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  filters,
  onChange,
  onReset,
  totalFilteredCount,
}) => {
  const statuses = ['All', 'Pending', 'In Progress', 'Completed'];
  const priorities = ['All', 'High', 'Medium', 'Low'];

  const hasActiveFilters =
    filters.status !== 'All' ||
    filters.priority !== 'All' ||
    filters.search.trim() !== '' ||
    filters.sortBy !== 'createdAt';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-xs space-y-4">
      {/* Top Row: Search Bar & Sort Selector */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by title, keyword, or tag..."
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onChange({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & Order Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sort:</span>
          </div>

          <select
            value={filters.sortBy}
            onChange={(e) => onChange({ sortBy: e.target.value as TaskFilterOptions['sortBy'] })}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="createdAt">Date Created</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Alphabetical</option>
          </select>

          <button
            onClick={() => onChange({ order: filters.order === 'asc' ? 'desc' : 'asc' })}
            title={`Sort ${filters.order === 'asc' ? 'Ascending' : 'Descending'}`}
            className="px-2.5 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {filters.order === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
      </div>

      {/* Bottom Row: Segmented Status Buttons & Priority Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        {/* Status Segmented Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full">
          {statuses.map((s) => {
            const isActive = filters.status === s;
            return (
              <button
                key={s}
                onClick={() => onChange({ status: s })}
                className={`px-3 py-1.5 font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* Priority & Reset Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">Priority:</span>
            <select
              value={filters.priority}
              onChange={(e) => onChange({ priority: e.target.value })}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              {priorities.map((p) => (
                <option key={p} value={p}>
                  {p === 'All' ? 'All Priorities' : `${p} Priority`}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium cursor-pointer"
            >
              Reset Filters
            </button>
          )}

          <span className="text-slate-400 hidden md:inline">
            Showing <strong className="text-slate-700 tabular-nums">{totalFilteredCount}</strong> tasks
          </span>
        </div>
      </div>
    </div>
  );
};

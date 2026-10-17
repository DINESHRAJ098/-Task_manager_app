import React from 'react';
import { TaskStats as ITaskStats } from '../types/index.js';
import { CheckCircle2, Clock, AlertTriangle, Layers, ListTodo } from 'lucide-react';

interface TaskStatsProps {
  stats: ITaskStats | null;
  activeStatus: string;
  onSelectStatus: (status: string) => void;
}

export const TaskStats: React.FC<TaskStatsProps> = ({
  stats,
  activeStatus,
  onSelectStatus,
}) => {
  const cards = [
    {
      label: 'Total Tasks',
      value: stats?.total ?? 0,
      icon: Layers,
      color: 'text-slate-700',
      statusKey: 'All',
    },
    {
      label: 'In Progress',
      value: stats?.inProgress ?? 0,
      icon: Clock,
      color: 'text-indigo-600',
      statusKey: 'In Progress',
    },
    {
      label: 'Pending',
      value: stats?.pending ?? 0,
      icon: ListTodo,
      color: 'text-amber-600',
      statusKey: 'Pending',
    },
    {
      label: 'Completed',
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      statusKey: 'Completed',
    },
    {
      label: 'Overdue',
      value: stats?.overdue ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-600',
      statusKey: 'Overdue',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
      {cards.map((item) => {
        const Icon = item.icon;
        const isSelected = activeStatus === item.statusKey;

        return (
          <button
            key={item.label}
            onClick={() => onSelectStatus(item.statusKey)}
            className={`p-4 text-left rounded-xl border transition-all cursor-pointer ${
              isSelected
                ? 'bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500'
                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">{item.label}</span>
              <Icon className={`w-4 h-4 ${item.color}`} />
            </div>
            <div className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {item.value}
            </div>
          </button>
        );
      })}
    </div>
  );
};

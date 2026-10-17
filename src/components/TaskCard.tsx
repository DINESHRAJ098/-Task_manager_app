import React from 'react';
import { Task, TaskPriority, TaskStatus } from '../types/index.js';
import { Calendar, CheckCircle2, Clock, MoreVertical, Edit2, Trash2, Tag, AlertCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, newStatus: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const isCompleted = task.status === 'Completed';

  // Format Due Date
  let dueDateText = 'No due date';
  let isOverdue = false;
  let isDueSoon = false;

  if (task.dueDate) {
    const due = new Date(task.dueDate);
    const now = new Date();
    dueDateText = due.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: due.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });

    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (!isCompleted) {
      if (diffHours < 0) {
        isOverdue = true;
      } else if (diffHours < 48) {
        isDueSoon = true;
      }
    }
  }

  // Priority indicator styles (clean typographic hierarchy, no pill enclosures)
  const priorityDetails: Record<TaskPriority, { text: string; colorClass: string }> = {
    High: { text: 'High Priority', colorClass: 'text-rose-600 font-semibold' },
    Medium: { text: 'Medium Priority', colorClass: 'text-amber-600 font-medium' },
    Low: { text: 'Low Priority', colorClass: 'text-slate-500 font-normal' },
  };

  const priorityMeta = priorityDetails[task.priority] || priorityDetails.Medium;

  // Status visual indicator
  const statusIcon = {
    Pending: <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />,
    'In Progress': <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0 animate-spin-slow" />,
    Completed: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />,
  }[task.status];

  return (
    <div
      className={`group bg-white rounded-xl border transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md ${
        isCompleted
          ? 'border-slate-200 bg-slate-50/50'
          : isOverdue
          ? 'border-rose-300 ring-1 ring-rose-200'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div>
        {/* Header: Status Quick Selector & Action Buttons */}
        <div className="flex items-center justify-between gap-3 mb-3">
          {/* Quick Status Dropdown */}
          <div className="flex items-center gap-1.5 text-xs">
            {statusIcon}
            <select
              value={task.status}
              onChange={(e) => onStatusChange(task, e.target.value as TaskStatus)}
              className="bg-transparent font-medium text-slate-700 hover:text-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-1 py-0.5 cursor-pointer text-xs"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              title="Edit Task"
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(task)}
              title="Delete Task"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Task Title */}
        <h3
          className={`text-base font-semibold leading-snug mb-2 ${
            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
          }`}
        >
          {task.title}
        </h3>

        {/* Task Description */}
        {task.description && (
          <p
            className={`text-xs leading-relaxed mb-4 line-clamp-3 ${
              isCompleted ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            {task.description}
          </p>
        )}
      </div>

      {/* Footer Metadata: Clean unboxed text with typographic separators */}
      <div className="pt-3 border-t border-slate-100 mt-2 space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
          {/* Priority */}
          <span className={priorityMeta.colorClass}>{priorityMeta.text}</span>

          <span aria-hidden="true">·</span>

          {/* Due Date Indicator */}
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span
              className={
                isOverdue
                  ? 'text-rose-600 font-semibold flex items-center gap-1'
                  : isDueSoon
                  ? 'text-amber-600 font-medium'
                  : 'text-slate-600'
              }
            >
              {isOverdue && <AlertCircle className="w-3 h-3" />}
              {isOverdue ? `Overdue (${dueDateText})` : dueDateText}
            </span>
          </div>
        </div>

        {/* Optional Tags list */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <Tag className="w-3 h-3 text-slate-400" />
            {task.tags.map((t, idx) => (
              <span key={idx} className="text-slate-600">
                #{t}
                {idx < task.tags!.length - 1 && <span className="text-slate-300 ml-1">·</span>}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

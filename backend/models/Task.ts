import mongoose, { Document, Schema, Model } from 'mongoose';
import { isUsingMemoryFallback } from '../config/db.js';

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  dueDate?: Date | string;
  priority: TaskPriority;
  status: TaskStatus;
  user: string | mongoose.Types.ObjectId;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITaskDocument extends Document, Omit<ITask, '_id' | 'user'> {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
}

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    dueDate: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'Medium',
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'In Progress', 'Completed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'Pending',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to an authenticated user'],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Real Mongoose Model
export const MongooseTaskModel: Model<ITaskDocument> =
  mongoose.models.Task || mongoose.model<ITaskDocument>('Task', taskSchema);

// Memory fallback store initialized with realistic demo tasks
let memoryTasks: ITask[] = [
  {
    _id: '65f02b111111111111111101',
    title: 'Architect JWT Authentication Middleware',
    description: 'Implement secure Bearer token validation, user context extraction, and token expiration checks for REST API endpoints.',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    priority: 'High',
    status: 'In Progress',
    user: '65f01a111111111111111101',
    tags: ['Backend', 'Security'],
    createdAt: new Date('2026-03-01T09:00:00Z'),
    updatedAt: new Date('2026-03-01T09:00:00Z'),
  },
  {
    _id: '65f02b111111111111111102',
    title: 'Design Responsive Task Filtering Interface',
    description: 'Build segmented status filters, priority level badges, and debounced keyword search bar with Tailwind CSS.',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    priority: 'Medium',
    status: 'Completed',
    user: '65f01a111111111111111101',
    tags: ['Frontend', 'UI/UX'],
    createdAt: new Date('2026-03-02T11:30:00Z'),
    updatedAt: new Date('2026-03-02T16:00:00Z'),
  },
  {
    _id: '65f02b111111111111111103',
    title: 'Configure MongoDB Schema Indexes',
    description: 'Add compound indexes on user + status and user + priority for optimal query performance under high load.',
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    priority: 'Medium',
    status: 'Pending',
    user: '65f01a111111111111111101',
    tags: ['Database', 'Optimization'],
    createdAt: new Date('2026-03-03T14:15:00Z'),
    updatedAt: new Date('2026-03-03T14:15:00Z'),
  },
  {
    _id: '65f02b111111111111111104',
    title: 'Perform Security Audit on Password Hashing',
    description: 'Verify bcrypt salt rounds, validate password complexity requirements, and guard against timing attack vectors.',
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString(), // Overdue example
    priority: 'High',
    status: 'Pending',
    user: '65f01a111111111111111101',
    tags: ['Security', 'Audit'],
    createdAt: new Date('2026-02-28T08:00:00Z'),
    updatedAt: new Date('2026-02-28T08:00:00Z'),
  },
  {
    _id: '65f02b111111111111111105',
    title: 'Prepare Docker Compose & Deployment Guide',
    description: 'Document step-by-step setup instructions for running MongoDB and Node.js concurrently in development and production.',
    dueDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    priority: 'Low',
    status: 'Pending',
    user: '65f01a111111111111111101',
    tags: ['DevOps', 'Documentation'],
    createdAt: new Date('2026-03-04T10:00:00Z'),
    updatedAt: new Date('2026-03-04T10:00:00Z'),
  },
];

export interface TaskQueryParams {
  user: string;
  status?: string;
  priority?: string;
  search?: string;
  sortBy?: 'dueDate' | 'priority' | 'createdAt' | 'title';
  order?: 'asc' | 'desc';
}

// Unified TaskModel Proxy
export const TaskModel = {
  async find(params: TaskQueryParams): Promise<ITask[]> {
    if (!isUsingMemoryFallback && mongoose.connection.readyState === 1) {
      try {
        const query: Record<string, unknown> = { user: params.user };

        if (params.status && params.status !== 'All') {
          query.status = params.status;
        }

        if (params.priority && params.priority !== 'All') {
          query.priority = params.priority;
        }

        if (params.search) {
          const searchRegex = new RegExp(params.search, 'i');
          query.$or = [{ title: searchRegex }, { description: searchRegex }];
        }

        const sortField = params.sortBy || 'createdAt';
        const sortDirection = params.order === 'asc' ? 1 : -1;

        const docs = await MongooseTaskModel.find(query).sort({ [sortField]: sortDirection });
        return docs.map((doc) => {
          const obj = doc.toObject() as unknown as ITask;
          obj._id = doc._id.toString();
          obj.user = doc.user.toString();
          return obj;
        });
      } catch (e) {
        console.warn('Mongoose task find failed, falling back:', e);
      }
    }

    // Memory Store query resolution
    let results = memoryTasks.filter((t) => t.user.toString() === params.user.toString());

    if (params.status && params.status !== 'All') {
      results = results.filter((t) => t.status === params.status);
    }

    if (params.priority && params.priority !== 'All') {
      results = results.filter((t) => t.priority === params.priority);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      results = results.filter(
        (t) => t.title.toLowerCase().includes(q) || (t.description && t.description.toLowerCase().includes(q))
      );
    }

    const sortField = params.sortBy || 'createdAt';
    const isAsc = params.order === 'asc';

    results.sort((a, b) => {
      let valA: unknown = a[sortField as keyof ITask];
      let valB: unknown = b[sortField as keyof ITask];

      if (sortField === 'dueDate') {
        valA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        valB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      } else if (sortField === 'priority') {
        const priorityOrder: Record<TaskPriority, number> = { High: 3, Medium: 2, Low: 1 };
        valA = priorityOrder[a.priority];
        valB = priorityOrder[b.priority];
      }

      if (valA! < valB!) return isAsc ? -1 : 1;
      if (valA! > valB!) return isAsc ? 1 : -1;
      return 0;
    });

    return results.map((t) => ({ ...t }));
  },

  async findById(id: string, userId: string): Promise<ITask | null> {
    if (!isUsingMemoryFallback && mongoose.connection.readyState === 1) {
      try {
        const doc = await MongooseTaskModel.findOne({ _id: id, user: userId });
        if (doc) {
          const obj = doc.toObject() as unknown as ITask;
          obj._id = doc._id.toString();
          obj.user = doc.user.toString();
          return obj;
        }
        return null;
      } catch (e) {
        console.warn('Mongoose task findById failed:', e);
      }
    }

    const found = memoryTasks.find((t) => t._id === id && t.user.toString() === userId.toString());
    return found ? { ...found } : null;
  },

  async create(data: {
    title: string;
    description?: string;
    dueDate?: string | Date;
    priority?: TaskPriority;
    status?: TaskStatus;
    user: string;
    tags?: string[];
  }): Promise<ITask> {
    if (!isUsingMemoryFallback && mongoose.connection.readyState === 1) {
      try {
        const doc = await MongooseTaskModel.create({
          ...data,
          user: new mongoose.Types.ObjectId(data.user),
        });
        const obj = doc.toObject() as unknown as ITask;
        obj._id = doc._id.toString();
        obj.user = doc.user.toString();
        return obj;
      } catch (e) {
        console.warn('Mongoose task create failed:', e);
      }
    }

    const newTask: ITask = {
      _id: new mongoose.Types.ObjectId().toString(),
      title: data.title.trim(),
      description: data.description?.trim() || '',
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
      priority: data.priority || 'Medium',
      status: data.status || 'Pending',
      user: data.user,
      tags: data.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    memoryTasks.unshift(newTask);
    return { ...newTask };
  },

  async findByIdAndUpdate(
    id: string,
    userId: string,
    updates: Partial<ITask>
  ): Promise<ITask | null> {
    if (!isUsingMemoryFallback && mongoose.connection.readyState === 1) {
      try {
        const doc = await MongooseTaskModel.findOneAndUpdate(
          { _id: id, user: userId },
          { ...updates, updatedAt: new Date() },
          { new: true, runValidators: true }
        );
        if (doc) {
          const obj = doc.toObject() as unknown as ITask;
          obj._id = doc._id.toString();
          obj.user = doc.user.toString();
          return obj;
        }
        return null;
      } catch (e) {
        console.warn('Mongoose task update failed:', e);
      }
    }

    const index = memoryTasks.findIndex((t) => t._id === id && t.user.toString() === userId.toString());
    if (index === -1) return null;

    const existing = memoryTasks[index];
    const updated: ITask = {
      ...existing,
      ...updates,
      _id: existing._id,
      user: existing.user,
      updatedAt: new Date(),
    };

    memoryTasks[index] = updated;
    return { ...updated };
  },

  async findByIdAndDelete(id: string, userId: string): Promise<boolean> {
    if (!isUsingMemoryFallback && mongoose.connection.readyState === 1) {
      try {
        const result = await MongooseTaskModel.findOneAndDelete({ _id: id, user: userId });
        return !!result;
      } catch (e) {
        console.warn('Mongoose task delete failed:', e);
      }
    }

    const initialLength = memoryTasks.length;
    memoryTasks = memoryTasks.filter((t) => !(t._id === id && t.user.toString() === userId.toString()));
    return memoryTasks.length < initialLength;
  },

  async getStats(userId: string) {
    const tasks = await this.find({ user: userId });
    const now = new Date().getTime();

    const stats = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'Pending').length,
      inProgress: tasks.filter((t) => t.status === 'In Progress').length,
      completed: tasks.filter((t) => t.status === 'Completed').length,
      highPriority: tasks.filter((t) => t.priority === 'High').length,
      overdue: tasks.filter(
        (t) => t.status !== 'Completed' && t.dueDate && new Date(t.dueDate).getTime() < now
      ).length,
    };

    return stats;
  },
};

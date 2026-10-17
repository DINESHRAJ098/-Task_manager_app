import { Router, Response } from 'express';
import { TaskModel, TaskPriority, TaskStatus } from '../models/Task.js';
import { protect, AuthenticatedRequest } from '../middleware/authMiddleware.js';

const router = Router();

// Protect all task routes with JWT authentication middleware
router.use(protect);

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task analytics and metrics for the authenticated user
 * @access  Private
 */
router.get('/stats', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const stats = await TaskModel.getStats(userId);
    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task metrics: ' + err.message,
    });
  }
});

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for the logged in user with search, filter, and sort
 * @access  Private
 */
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { status, priority, search, sortBy, order } = req.query;

    const tasks = await TaskModel.find({
      user: userId,
      status: status as string,
      priority: priority as string,
      search: search as string,
      sortBy: sortBy as 'dueDate' | 'priority' | 'createdAt' | 'title',
      order: order as 'asc' | 'desc',
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks: ' + err.message,
    });
  }
});

/**
 * @route   POST /api/tasks
 * @desc    Create a new task assigned to the authenticated user
 * @access  Private
 */
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { title, description, dueDate, priority, status, tags } = req.body;

    if (!title || !title.trim()) {
      res.status(400).json({
        success: false,
        message: 'Task title is required',
      });
      return;
    }

    const validPriorities: TaskPriority[] = ['Low', 'Medium', 'High'];
    if (priority && !validPriorities.includes(priority)) {
      res.status(400).json({
        success: false,
        message: 'Priority must be Low, Medium, or High',
      });
      return;
    }

    const validStatuses: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];
    if (status && !validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Status must be Pending, In Progress, or Completed',
      });
      return;
    }

    const task = await TaskModel.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      dueDate: dueDate || undefined,
      priority: priority || 'Medium',
      status: status || 'Pending',
      tags: Array.isArray(tags) ? tags : [],
      user: userId,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      message: 'Failed to create task: ' + err.message,
    });
  }
});

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID (ensuring user ownership)
 * @access  Private
 */
router.get('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const task = await TaskModel.findById(id, userId);

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized to access',
      });
      return;
    }

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve task: ' + err.message,
    });
  }
});

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update task (status, priority, title, details)
 * @access  Private
 */
router.put('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;
    const { title, description, dueDate, priority, status, tags } = req.body;

    const existingTask = await TaskModel.findById(id, userId);
    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized to modify',
      });
      return;
    }

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate).toISOString() : null;
    if (priority !== undefined) updates.priority = priority;
    if (status !== undefined) updates.status = status;
    if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : [];

    const updatedTask = await TaskModel.findByIdAndUpdate(id, userId, updates);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      message: 'Failed to update task: ' + err.message,
    });
  }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task with user ownership confirmation
 * @access  Private
 */
router.delete('/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const existingTask = await TaskModel.findById(id, userId);
    if (!existingTask) {
      res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized to delete',
      });
      return;
    }

    const deleted = await TaskModel.findByIdAndDelete(id, userId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Could not delete task',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
      id,
    });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({
      success: false,
      message: 'Failed to delete task: ' + err.message,
    });
  }
});

export default router;

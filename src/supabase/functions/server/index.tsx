import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))
app.use('*', logger(console.log))

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Task interface
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

// Helper function to generate unique ID
function generateId(): string {
  return crypto.randomUUID();
}

// Get all tasks
app.get('/make-server-7ddd31f8/tasks', async (c) => {
  try {
    const tasks = await kv.getByPrefix('task:');
    console.log('Retrieved tasks:', tasks);
    
    // Sort tasks by creation date (newest first)
    const sortedTasks = tasks.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json({ success: true, tasks: sortedTasks });
  } catch (error) {
    console.log('Error getting tasks:', error);
    return c.json({ success: false, error: 'Failed to retrieve tasks' }, 500);
  }
});

// Get single task by ID
app.get('/make-server-7ddd31f8/tasks/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const task = await kv.get(`task:${id}`);
    
    if (!task) {
      return c.json({ success: false, error: 'Task not found' }, 404);
    }
    
    console.log('Retrieved task:', task);
    return c.json({ success: true, task });
  } catch (error) {
    console.log('Error getting task:', error);
    return c.json({ success: false, error: 'Failed to retrieve task' }, 500);
  }
});

// Create new task
app.post('/make-server-7ddd31f8/tasks', async (c) => {
  try {
    const body = await c.req.json();
    const { title, description, status, priority, dueDate } = body;
    
    // Validation
    if (!title || !title.trim()) {
      return c.json({ success: false, error: 'Title is required' }, 400);
    }
    
    const now = new Date().toISOString();
    const taskId = generateId();
    
    const newTask: Task = {
      id: taskId,
      title: title.trim(),
      description: description?.trim() || '',
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || '',
      createdAt: now,
      updatedAt: now
    };
    
    await kv.set(`task:${taskId}`, newTask);
    console.log('Created task:', newTask);
    
    return c.json({ success: true, task: newTask }, 201);
  } catch (error) {
    console.log('Error creating task:', error);
    return c.json({ success: false, error: 'Failed to create task' }, 500);
  }
});

// Update existing task
app.put('/make-server-7ddd31f8/tasks/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const { title, description, status, priority, dueDate } = body;
    
    // Get existing task
    const existingTask = await kv.get(`task:${id}`);
    if (!existingTask) {
      return c.json({ success: false, error: 'Task not found' }, 404);
    }
    
    // Validation
    if (!title || !title.trim()) {
      return c.json({ success: false, error: 'Title is required' }, 400);
    }
    
    const updatedTask: Task = {
      ...existingTask,
      title: title.trim(),
      description: description?.trim() || '',
      status: status || existingTask.status,
      priority: priority || existingTask.priority,
      dueDate: dueDate || '',
      updatedAt: new Date().toISOString()
    };
    
    await kv.set(`task:${id}`, updatedTask);
    console.log('Updated task:', updatedTask);
    
    return c.json({ success: true, task: updatedTask });
  } catch (error) {
    console.log('Error updating task:', error);
    return c.json({ success: false, error: 'Failed to update task' }, 500);
  }
});

// Delete task
app.delete('/make-server-7ddd31f8/tasks/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Check if task exists
    const existingTask = await kv.get(`task:${id}`);
    if (!existingTask) {
      return c.json({ success: false, error: 'Task not found' }, 404);
    }
    
    await kv.del(`task:${id}`);
    console.log('Deleted task:', id);
    
    return c.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.log('Error deleting task:', error);
    return c.json({ success: false, error: 'Failed to delete task' }, 500);
  }
});

// Health check endpoint
app.get('/make-server-7ddd31f8/health', (c) => {
  return c.json({ success: true, message: 'Task Management API is running', timestamp: new Date().toISOString() });
});

Deno.serve(app.fetch)
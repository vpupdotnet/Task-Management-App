import { useState, useEffect } from 'react';
import { Task } from './types/task';
import { TaskList } from './components/TaskList';
import { TaskPreview } from './components/TaskPreview';
import { TaskEdit } from './components/TaskEdit';
import { taskService } from './services/taskService';
import { Card, CardContent } from './components/ui/card';

type View = 'list' | 'preview' | 'edit' | 'create';

export default function App() {
  const [view, setView] = useState<View>('list');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from backend on component mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasksFromApi = await taskService.getAllTasks();
      setTasks(tasksFromApi);
      console.log('Loaded tasks from backend:', tasksFromApi);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setView('preview');
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setView('edit');
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setView('create');
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter(task => task.id !== taskId));
      setView('list');
      console.log('Task deleted successfully');
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task. Please try again.');
    }
  };

  const handleSaveTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    try {
      setError(null);
      
      if (taskData.id) {
        // Update existing task
        const updatedTask = await taskService.updateTask(taskData.id, taskData);
        setTasks(tasks.map(task => 
          task.id === taskData.id ? updatedTask : task
        ));
        console.log('Task updated successfully:', updatedTask);
      } else {
        // Create new task
        const newTask = await taskService.createTask(taskData);
        setTasks([newTask, ...tasks]);
        console.log('Task created successfully:', newTask);
      }
      
      setView('list');
    } catch (err) {
      console.error('Failed to save task:', err);
      setError('Failed to save task. Please try again.');
    }
  };

  const handleBack = () => {
    setView('list');
    setSelectedTask(null);
    setError(null);
  };

  // Error display component
  const ErrorDisplay = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="p-4">
        <p className="text-red-800 mb-2">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="text-red-600 underline hover:text-red-800"
          >
            Try again
          </button>
        )}
      </CardContent>
    </Card>
  );

  // Loading display
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-4xl mx-auto p-4">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Loading your tasks...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-4">
        {error && view === 'list' && (
          <div className="mb-4">
            <ErrorDisplay message={error} onRetry={loadTasks} />
          </div>
        )}
        
        {error && view !== 'list' && (
          <div className="mb-4">
            <ErrorDisplay message={error} />
          </div>
        )}

        {view === 'list' && (
          <TaskList
            tasks={tasks}
            onViewTask={handleViewTask}
            onEditTask={handleEditTask}
            onCreateTask={handleCreateTask}
          />
        )}
        
        {view === 'preview' && selectedTask && (
          <TaskPreview
            task={selectedTask}
            onBack={handleBack}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        )}
        
        {(view === 'edit' || view === 'create') && (
          <TaskEdit
            task={view === 'edit' ? selectedTask || undefined : undefined}
            onBack={handleBack}
            onSave={handleSaveTask}
          />
        )}
      </div>
    </div>
  );
}
import { Task } from "../types/task";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ArrowLeft, Edit2, Trash2 } from "lucide-react";

interface TaskPreviewProps {
  task: Task;
  onBack: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskPreview({ task, onBack, onEdit, onDelete }: TaskPreviewProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Tasks
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onEdit(task)} className="flex items-center gap-2">
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => onDelete(task.id)}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="pr-4">{task.title}</CardTitle>
            <div className="flex gap-2 flex-shrink-0">
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority} priority
              </Badge>
              <Badge className={getStatusColor(task.status)}>
                {task.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {task.description && (
            <div>
              <h3 className="mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4>Created</h4>
              <p className="text-muted-foreground">
                {new Date(task.createdAt).toLocaleDateString()} at{' '}
                {new Date(task.createdAt).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
            
            {task.dueDate && (
              <div>
                <h4>Due Date</h4>
                <p className="text-muted-foreground">
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>
            )}
            
            {task.updatedAt && task.updatedAt !== task.createdAt && (
              <div>
                <h4>Last Updated</h4>
                <p className="text-muted-foreground">
                  {new Date(task.updatedAt).toLocaleDateString()} at{' '}
                  {new Date(task.updatedAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
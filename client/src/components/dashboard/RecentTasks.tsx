import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

type Task = {
  id: string;
  title: string;
  project: string;
  dueDate: string;
  status: 'completed' | 'in-progress' | 'overdue';
  priority: 'low' | 'medium' | 'high';
};

const RecentTasks: React.FC = () => {
  // In a real app, these would come from your API/state
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Design new dashboard layout',
      project: 'Website Redesign',
      dueDate: '2023-12-15',
      status: 'in-progress',
      priority: 'high',
    },
    {
      id: '2',
      title: 'Fix login form validation',
      project: 'User Authentication',
      dueDate: '2023-12-10',
      status: 'completed',
      priority: 'medium',
    },
    {
      id: '3',
      title: 'Prepare project presentation',
      project: 'Quarterly Review',
      dueDate: '2023-12-05',
      status: 'overdue',
      priority: 'high',
    },
    {
      id: '4',
      title: 'Update documentation',
      project: 'API Integration',
      dueDate: '2023-12-12',
      status: 'in-progress',
      priority: 'low',
    },
  ];

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: Task['priority']) => {
    const styles = {
      low: 'bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full',
      medium: 'bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full',
      high: 'bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full',
    };

    return (
      <span className={styles[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-start justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
          <div className="flex items-start space-x-3">
            <div className="mt-1">
              {getStatusIcon(task.status)}
            </div>
            <div>
              <p className="font-medium">{task.title}</p>
              <p className="text-sm text-muted-foreground">{task.project}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-sm text-muted-foreground">
              {formatDate(task.dueDate)}
            </div>
            {getPriorityBadge(task.priority)}
          </div>
        </div>
      ))}
      <div className="text-center mt-4">
        <button className="text-sm text-primary hover:underline">
          View all tasks
        </button>
      </div>
    </div>
  );
};

export default RecentTasks;

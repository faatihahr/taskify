import React, { useState, useEffect } from 'react';
import { Bell, Calendar, AlertCircle, Clock, X, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { useAppSelector } from '../../store/hooks';

interface TaskWithDueDate {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  listTitle?: string;
  boardTitle?: string;
}

const DueDateNotification: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tasksWithDueDates, setTasksWithDueDates] = useState<TaskWithDueDate[]>([]);
  const { currentBoard } = useAppSelector((state) => state.boards);

  useEffect(() => {
    if (currentBoard) {
      const tasks: TaskWithDueDate[] = [];
      
      currentBoard.lists.forEach(list => {
        list.cards.forEach(card => {
          if (card.dueDate && !card.completed) {
            tasks.push({
              id: card.id,
              title: card.title,
              dueDate: card.dueDate,
              status: card.completed ? 'Done' : 'In Progress',
              listTitle: list.title,
              boardTitle: currentBoard.title
            });
          }
        });
      });

      // Sort by due date (earliest first)
      tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      
      setTasksWithDueDates(tasks);
    } else {
      setTasksWithDueDates([]);
    }
  }, [currentBoard]);

  const getNotificationType = (dueDate: string): 'overdue' | 'due-today' | 'due-soon' | 'upcoming' => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'due-today';
    if (diffDays <= 3) return 'due-soon';
    return 'upcoming';
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'overdue': return 'bg-red-500';
      case 'due-today': return 'bg-orange-500';
      case 'due-soon': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      case 'due-today': return <Clock className="h-4 w-4" />;
      case 'due-soon': return <Calendar className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays <= 7) {
      return `In ${diffDays} days`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getNotificationCount = () => {
    return tasksWithDueDates.filter(task => {
      const type = getNotificationType(task.dueDate);
      return type === 'overdue' || type === 'due-today' || type === 'due-soon';
    }).length;
  };

  const notificationCount = getNotificationCount();

  return (
    <div className="relative">
      {/* Notification Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full"
      >
        <Bell className="h-5 w-5" />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Due Date Notifications
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {tasksWithDueDates.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No tasks with due dates</p>
              </div>
            ) : (
              <div className="p-2">
                {tasksWithDueDates.map((task) => {
                  const type = getNotificationType(task.dueDate);
                  const color = getNotificationColor(type);
                  const icon = getNotificationIcon(type);
                  
                  return (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <div className={`p-2 rounded-full ${color} text-white flex-shrink-0`}>
                        {icon}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {task.title}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            type === 'overdue' ? 'bg-red-100 text-red-700' :
                            type === 'due-today' ? 'bg-orange-100 text-orange-700' :
                            type === 'due-soon' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {formatDueDate(task.dueDate)}
                          </span>
                          
                          {task.listTitle && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              in {task.listTitle}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {tasksWithDueDates.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{tasksWithDueDates.length} task(s) with due dates</span>
                <span>{notificationCount} need attention</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DueDateNotification;

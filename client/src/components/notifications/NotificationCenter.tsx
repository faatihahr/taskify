import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  AlertCircle,
  Clock,
  X,
  Check,
  CheckSquare,
  MessageSquare,
  Users,
  UserPlus
} from 'lucide-react';
import { Button } from '../ui/button';
import { useAppSelector } from '../../store/hooks';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  board?: {
    id: string;
    title: string;
  };
  card?: {
    id: string;
    title: string;
    list?: {
      id: string;
      title: string;
    };
  };
}

const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());

  const { user } = useAppSelector((state) => state.auth);
  const { boards } = useAppSelector((state) => state.boards);
  const navigate = useNavigate();

  // Load read notifications from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      const storageKey = `taskify-read-notifications-${user.id}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const readIds = JSON.parse(stored);
          setReadNotifications(new Set(readIds));
        } catch (error) {
          console.error('Failed to parse stored notifications:', error);
        }
      }
    } else {
      // Clear read notifications when user logs out
      setReadNotifications(new Set());
    }
  }, [user?.id]);

  // Save read notifications to localStorage whenever state changes
  useEffect(() => {
    if (user?.id && readNotifications.size > 0) {
      const storageKey = `taskify-read-notifications-${user.id}`;
      const readIds = Array.from(readNotifications);
      localStorage.setItem(storageKey, JSON.stringify(readIds));
    }
  }, [readNotifications, user?.id]);

  // Generate notifications from cards with due dates within 7 days
  const notifications = useMemo(() => {
    if (!boards || !user || boards.length === 0) return [];

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const upcomingCards = (boards || []).flatMap(board =>
      (board.lists || []).flatMap(list =>
        (list.cards || [])
          .filter(card => card.dueDate && !card.completed)
          .map(card => ({
            ...card,
            boardTitle: board.title,
            boardId: board.id,
            listTitle: list.title,
            listId: list.id,
          }))
      )
    ).filter(card => {
      const dueDate = new Date(card.dueDate!);
      return dueDate >= now && dueDate <= sevenDaysFromNow;
    }).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

    return upcomingCards.map(card => {
      const dueDate = new Date(card.dueDate!);
      const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      let type: string;
      let title: string;
      let message: string;

      if (daysDiff < 0) {
        // Overdue
        type = 'task_overdue';
        title = `Overdue: ${card.title}`;
        message = `This task was due ${Math.abs(daysDiff)} day${Math.abs(daysDiff) !== 1 ? 's' : ''} ago`;
      } else if (daysDiff === 0) {
        // Due today
        type = 'task_due';
        title = `Due Today: ${card.title}`;
        message = 'This task is due today';
      } else if (daysDiff === 1) {
        // Due tomorrow
        type = 'task_due';
        title = `Due Tomorrow: ${card.title}`;
        message = 'This task is due tomorrow';
      } else {
        // Due in X days
        type = 'task_due';
        title = `Due in ${daysDiff} days: ${card.title}`;
        message = `This task is due on ${dueDate.toLocaleDateString()}`;
      }

      return {
        id: `due-${card.id}`,
        title,
        message,
        type,
        isRead: readNotifications.has(`due-${card.id}`),
        createdAt: card.updatedAt,
        board: {
          id: card.boardId,
          title: card.boardTitle,
        },
        card: {
          id: card.id,
          title: card.title,
          list: {
            id: card.listId,
            title: card.listTitle,
          },
        },
      };
    });
  }, [boards, user, readNotifications]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (user) {
      // Auto-refresh every 2 hours (7200000 ms)
      const interval = setInterval(() => {
        // Force re-render to update time-based notifications
        setReadNotifications(prev => new Set(prev));
      }, 7200000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const markAsRead = (notificationId: string) => {
    setReadNotifications(prev => new Set([...prev, notificationId]));
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications(prev => new Set([...prev, ...allIds]));
  };

  const deleteNotification = (notificationId: string) => {
    // For client-side notifications, we can't actually delete them
    // Just mark as read to hide them
    markAsRead(notificationId);
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    // Mark as read when clicked
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Navigate to the relevant page based on notification type
    if (notification.card) {
      // Navigate to the board containing the card
      navigate(`/board/${notification.board?.id}`);
      setIsOpen(false);
    } else if (notification.board) {
      // Navigate to the board
      navigate(`/board/${notification.board.id}`);
      setIsOpen(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned': return <UserPlus className="h-4 w-4" />;
      case 'task_due': return <Clock className="h-4 w-4" />;
      case 'task_overdue': return <AlertCircle className="h-4 w-4" />;
      case 'board_shared': return <Users className="h-4 w-4" />;
      case 'comment_added': return <MessageSquare className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-100 text-gray-600';
    
    switch (type) {
      case 'task_overdue': return 'bg-red-500 text-white';
      case 'task_due': return 'bg-orange-500 text-white';
      case 'task_assigned': return 'bg-blue-500 text-white';
      case 'board_shared': return 'bg-green-500 text-white';
      case 'comment_added': return 'bg-purple-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

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
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs h-8 px-2"
                >
                  <CheckSquare className="h-3 w-3 mr-1" />
                  Read all
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="p-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                      !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className={`p-2 rounded-full flex-shrink-0 ${getNotificationColor(notification.type, notification.isRead)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div 
                      className="flex-1 min-w-0"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <p className={`font-medium truncate ${
                        !notification.isRead ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {notification.title}
                      </p>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        
                        {notification.card?.list && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            in {notification.card.list.title}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {!notification.isRead && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{notifications.length} notification(s)</span>
                <span>{unreadCount} unread</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

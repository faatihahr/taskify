import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { Link } from 'react-router-dom';

type Task = {
  id: string;
  title: string;
  boardTitle: string;
  boardId: string;
  dueDate?: string;
  status: 'completed' | 'in-progress' | 'overdue';
  priority: 'low' | 'medium' | 'high';
};

const RecentTasks: React.FC = () => {
  const { boards } = useAppSelector((state) => state.boards);

  // Get real tasks from all boards' cards with safe navigation
  const allCards = (boards || []).flatMap(board =>
    (board.lists || []).flatMap(list =>
      (list.cards || []).map(card => ({
        ...card,
        boardTitle: board.title,
        boardId: board.id,
        listTitle: list.title,
      }))
    )
  );

  // Sort by most recently updated and take top 5
  const recentCards = allCards
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Map cards to Task format
  const tasks: Task[] = recentCards.map((card, index) => {
    // Determine status based on completion and due date
    let status: 'completed' | 'in-progress' | 'overdue' = 'in-progress';
    if (card.completed) {
      status = 'completed';
    } else if (card.dueDate && new Date(card.dueDate) < new Date()) {
      status = 'overdue';
    }

    // Determine priority (for now, rotate through priorities)
    const priorities: ('low' | 'medium' | 'high')[] = ['low', 'medium', 'high'];
    const priority = priorities[index % 3];

    return {
      id: card.id,
      title: card.title,
      boardTitle: card.boardTitle,
      boardId: card.boardId,
      dueDate: card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : undefined,
      status,
      priority,
    };
  });

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
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No tasks yet</p>
          <Link to="/dashboard" className="text-sm text-primary hover:underline mt-2 inline-block">
            Create tasks in your boards
          </Link>
        </div>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="flex items-start justify-between p-3 hover:bg-muted/50 rounded-lg transition-colors">
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                {getStatusIcon(task.status)}
              </div>
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-muted-foreground">
                  <Link to={`/board/${task.boardId}`} className="hover:text-primary transition-colors">
                    {task.boardTitle}
                  </Link>
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {task.dueDate && (
                <div className="text-sm text-muted-foreground">
                  {formatDate(task.dueDate)}
                </div>
              )}
              {getPriorityBadge(task.priority)}
            </div>
          </div>
        ))
      )}
      <div className="text-center mt-4">
        <Link to="/boards" className="text-sm text-primary hover:underline">
          View all boards
        </Link>
      </div>
    </div>
  );
};

export default RecentTasks;

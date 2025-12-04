import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Folder, Users, Clock, CheckCircle } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { Link } from 'react-router-dom';
import CreateBoardModal from '../boards/CreateBoardModal';

const ProjectsOverview: React.FC = () => {
  const { boards } = useAppSelector((state) => state.boards);
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Open modal if URL is /boards/create
    if (location.pathname === '/boards/create') {
      setShowCreateModal(true);
    }
  }, [location.pathname]);

  const handleCreateBoard = () => {
    navigate('/boards/create');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const daysSinceCreated = (createdDate: string) => {
    const today = new Date();
    const created = new Date(createdDate);
    const diffTime = today.getTime() - created.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getBoardColor = (index: number) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
    return colors[index % colors.length];
  };

  const displayedBoards = boards.slice(0, 3); // Show only first 3 boards

  return (
    <div className="space-y-4">
      {displayedBoards.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No boards yet</p>
          <button 
            onClick={handleCreateBoard}
            className="text-sm text-primary hover:underline mt-2 inline-block cursor-pointer"
          >
            Create your first board
          </button>
        </div>
      ) : (
        displayedBoards.map((board, index) => (
          <div key={board.id} className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                <div className={`h-10 w-10 rounded-md ${getBoardColor(index)} flex items-center justify-center`}>
                  <Folder className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Link to={`/board/${board.id}`} className="font-medium hover:text-primary transition-colors">
                    {board.title}
                  </Link>
                  {board.description && (
                    <p className="text-sm text-muted-foreground mt-1">{board.description}</p>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center">
                      <Users className="h-3.5 w-3.5 mr-1" />
                      {board._count?.members || 0}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      {board._count?.lists || 0} lists
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1" />
                {formatDate(board.updatedAt)}
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Created {daysSinceCreated(board.createdAt)} days ago</span>
                <span>Updated {daysSinceCreated(board.updatedAt)} days ago</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full opacity-80" 
                  style={{ 
                    width: `${Math.min(100, (board._count?.lists || 0) * 20)}%`,
                    backgroundColor: getBoardColor(index).replace('bg-', '').replace('-500', ''),
                  }}
                />
              </div>
            </div>
          </div>
        ))
      )}
      
      {boards.length > 3 && (
        <div className="text-center pt-2">
          <Link to="/boards" className="text-sm text-primary hover:underline">
            View all {boards.length} boards
          </Link>
        </div>
      )}
      
      {/* Create Board Modal */}
      <CreateBoardModal 
        isOpen={showCreateModal} 
        onClose={() => {
          setShowCreateModal(false);
          // Redirect to /dashboard if we're on /boards/create
          if (location.pathname === '/boards/create') {
            navigate('/dashboard');
          }
        }} 
      />
    </div>
  );
};

export default ProjectsOverview;

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/layouts/header';
import Footer from '../components/layouts/footer';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Folder, Users, Clock, CheckCircle, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserBoards, deleteBoard } from '../store/boardsSlice';
import { Link } from 'react-router-dom';
import CreateBoardModal from '../components/boards/CreateBoardModal';
import { useAppSelector as useAuthSelector } from '../store/hooks';

const AllBoardsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { boards, loading } = useAppSelector((state) => state.boards);
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [boardToDelete, setBoardToDelete] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchUserBoards());
  }, [dispatch]);

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

  const handleDeleteBoard = async () => {
    if (!boardToDelete) return;

    try {
      await dispatch(deleteBoard({ boardId: boardToDelete })).unwrap();
      setBoardToDelete(null);
    } catch (error) {
      console.error('Failed to delete board:', error);
      alert('Failed to delete board. Please try again.');
    }
  };

  const isBoardOwner = (board: any) => {
    return user && board.ownerId === user.id;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 relative z-10 mt-24 md:mt-28 p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

          {loading ? (
            <div className="text-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground text-sm sm:text-base mt-2">Loading boards...</p>
            </div>
          ) : boards.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Folder className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-lg sm:text-xl font-semibold mb-2">No boards yet</h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-4">Create your first board to get started</p>
              <div className="flex justify-center">
                <Button onClick={handleCreateBoard} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Create Your First Board</span>
                  <span className="sm:hidden">Create Board</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {boards.map((board, index) => (
                <Card key={board.id} className="p-4 sm:p-6 hover:shadow-md transition-shadow">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-md ${getBoardColor(index)} flex items-center justify-center flex-shrink-0`}>
                          <Folder className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/board/${board.id}`}
                            className="font-medium text-sm sm:text-lg hover:text-primary transition-colors block truncate"
                          >
                            {board.title}
                          </Link>
                          {board.description && (
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                              {board.description}
                            </p>
                          )}
                        </div>
                      </div>
                      {isBoardOwner(board) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            setBoardToDelete(board.id);
                          }}
                          className="text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 h-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">{board._count?.members || 0} members</span>
                        <span className="sm:hidden">{board._count?.members || 0}</span>
                      </span>
                      <span className="flex items-center">
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span className="hidden sm:inline">{board._count?.lists || 0} lists</span>
                        <span className="sm:hidden">{board._count?.lists || 0}</span>
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span className="hidden sm:inline">Created {daysSinceCreated(board.createdAt)} days ago</span>
                        <span className="sm:hidden">{daysSinceCreated(board.createdAt)}d ago</span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(board.updatedAt)}
                        </span>
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

                    <div className="pt-2">
                      <Link to={`/board/${board.id}`}>
                        <Button variant="outline" className="w-full text-xs sm:text-sm py-2 sm:py-2">
                          Open Board
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
      
      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          // Redirect to /boards if we're on /boards/create
          if (location.pathname === '/boards/create') {
            navigate('/boards');
          }
        }}
      />

      {/* Delete Board Confirmation Dialog */}
      {boardToDelete && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Delete Board
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this board? This action cannot be undone and will permanently remove the board and all its content.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setBoardToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteBoard}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete Board
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllBoardsPage;

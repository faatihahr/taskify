import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/layouts/header';
import Footer from '../components/layouts/footer';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Folder, Users, Clock, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserBoards } from '../store/boardsSlice';
import { Link } from 'react-router-dom';
import CreateBoardModal from '../components/boards/CreateBoardModal';

const AllBoardsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { boards, loading } = useAppSelector((state) => state.boards);
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                All Boards {loading && '(Loading...)'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {boards.length} {boards.length === 1 ? 'board' : 'boards'} total
              </p>
            </div>
            {!loading && boards.length > 0 && (
              <Button onClick={handleCreateBoard} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Board
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading boards...</p>
            </div>
          ) : boards.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-xl font-semibold mb-2">No boards yet</h2>
              <p className="text-muted-foreground mb-4">Create your first board to get started</p>
              <div className="flex justify-center">
                <Button onClick={handleCreateBoard} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Board
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {boards.map((board, index) => (
                <Card key={board.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className={`h-12 w-12 rounded-md ${getBoardColor(index)} flex items-center justify-center`}>
                          <Folder className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <Link 
                            to={`/board/${board.id}`} 
                            className="font-medium text-lg hover:text-primary transition-colors"
                          >
                            {board.title}
                          </Link>
                          {board.description && (
                            <p className="text-sm text-muted-foreground mt-1">{board.description}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {board._count?.members || 0} members
                      </span>
                      <span className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {board._count?.lists || 0} lists
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Created {daysSinceCreated(board.createdAt)} days ago</span>
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
                        <Button variant="outline" className="w-full">
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
    </div>
  );
};

export default AllBoardsPage;

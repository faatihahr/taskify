import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/layouts/header';
import Footer from '../components/layouts/footer';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentTasks from '../components/dashboard/RecentTasks';
import ProjectsOverview from '../components/dashboard/ProjectsOverview';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserBoards } from '../store/boardsSlice';
import { useNavigate } from 'react-router-dom';
import CreateBoardModal from '../components/boards/CreateBoardModal';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading: boardsLoading } = useAppSelector((state) => state.boards);
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Fetch boards data when dashboard loads
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Dashboard {boardsLoading && '(Loading...)'}
              </h1>
              <div className="text-sm text-muted-foreground mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            <Button onClick={handleCreateBoard} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create New Board
            </Button>
          </div>
          
          <DashboardStats />
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
              <RecentTasks />
            </Card>
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Projects Overview</h2>
              <ProjectsOverview />
            </Card>
          </div>
        </div>
      </main>
      <Footer />
      
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

export default DashboardPage;

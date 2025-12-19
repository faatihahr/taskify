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
import { getPendingInvitations, acceptInvitationById } from '../store/invitationSlice';
import { useNavigate } from 'react-router-dom';
import CreateBoardModal from '../components/boards/CreateBoardModal';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading: boardsLoading } = useAppSelector((state) => state.boards);
  const { invitations, loading: invitationsLoading } = useAppSelector((state: any) => state.invitation);
  const location = useLocation();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    // Fetch boards data when dashboard loads
    dispatch(fetchUserBoards());
    // Fetch pending invitations
    dispatch(getPendingInvitations());
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

          {/* Pending Invitations Section */}
          {invitations && invitations.length > 0 && (
            <Card className="p-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200">
                  Pending Invitations ({invitations.length})
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(getPendingInvitations())}
                  disabled={invitationsLoading}
                >
                  Refresh
                </Button>
              </div>

              <div className="space-y-3">
                {invitations.map((invitation: any) => (
                  <div key={invitation.id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        Invited to "{invitation.board?.title || 'Unknown Board'}"
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Invited by {invitation.inviter?.name || 'Unknown User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          // TODO: Implement decline functionality
                          console.log('Decline invitation:', invitation.id);
                        }}
                        disabled={invitationsLoading}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={async () => {
                          try {
                            await dispatch(acceptInvitationById(invitation.id)).unwrap();
                            // Refresh invitations list
                            dispatch(getPendingInvitations());
                            // Refresh board list to show newly joined board
                            dispatch(fetchUserBoards());
                          } catch (error) {
                            console.error('Failed to accept invitation:', error);
                          }
                        }}
                        disabled={invitationsLoading}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

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

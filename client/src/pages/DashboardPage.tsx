import React, { useEffect } from 'react';
import Header from '../components/layouts/header';
import Footer from '../components/layouts/footer';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentTasks from '../components/dashboard/RecentTasks';
import ProjectsOverview from '../components/dashboard/ProjectsOverview';
import { Card } from '../components/ui/card';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserBoards } from '../store/boardsSlice';

const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading: boardsLoading } = useAppSelector((state) => state.boards);

  useEffect(() => {
    // Fetch boards data when dashboard loads
    dispatch(fetchUserBoards());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Dashboard {boardsLoading && '(Loading...)'}
            </h1>
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
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
    </div>
  );
};

export default DashboardPage;

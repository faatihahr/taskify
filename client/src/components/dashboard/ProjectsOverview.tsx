import React from 'react';
import { Folder, Users, Clock, CheckCircle } from 'lucide-react';

type Project = {
  id: string;
  name: string;
  progress: number;
  members: number;
  tasks: {
    completed: number;
    total: number;
  };
  deadline: string;
  color: string;
};

const ProjectsOverview: React.FC = () => {
  // In a real app, these would come from your API/state
  const projects: Project[] = [
    {
      id: '1',
      name: 'Website Redesign',
      progress: 75,
      members: 5,
      tasks: { completed: 15, total: 20 },
      deadline: '2023-12-31',
      color: 'bg-blue-500',
    },
    {
      id: '2',
      name: 'Mobile App Development',
      progress: 45,
      members: 8,
      tasks: { completed: 9, total: 20 },
      deadline: '2024-01-15',
      color: 'bg-green-500',
    },
    {
      id: '3',
      name: 'Marketing Campaign',
      progress: 30,
      members: 3,
      tasks: { completed: 6, total: 20 },
      deadline: '2023-12-20',
      color: 'bg-purple-500',
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const daysUntilDeadline = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div key={project.id} className="space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <div className={`h-10 w-10 rounded-md ${project.color} flex items-center justify-center`}>
                <Folder className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium">{project.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span className="flex items-center">
                    <Users className="h-3.5 w-3.5 mr-1" />
                    {project.members}
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    {project.tasks.completed}/{project.tasks.total} tasks
                  </span>
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground flex items-center">
              <Clock className="h-3.5 w-3.5 mr-1" />
              {formatDate(project.deadline)}
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress: {project.progress}%</span>
              <span>{daysUntilDeadline(project.deadline)} days left</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ 
                  width: `${project.progress}%`,
                  backgroundColor: project.color.replace('bg-', 'bg-opacity-80 ')
                }}
              />
            </div>
          </div>
        </div>
      ))}
      
      <div className="text-center pt-2">
        <button className="text-sm text-primary hover:underline">
          View all projects
        </button>
      </div>
    </div>
  );
};

export default ProjectsOverview;

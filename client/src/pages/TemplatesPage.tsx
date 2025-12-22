import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Star, Users, Calendar, KanbanSquare, Layout } from 'lucide-react';
import { useAppDispatch } from '../store/hooks';
import { createBoard, createList, createCard } from '../store/boardsSlice';

const TemplatesPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);

  // Board templates with actual structure
  const boardTemplates = [
    {
      id: 'meeting-agenda',
      title: 'Meeting Agenda',
      description: 'Organize your meetings with agenda, action items, and follow-ups',
      category: 'Business',
      uses: '1.2k',
      rating: 4.7,
      isNew: true,
      icon: Calendar,
      color: 'bg-blue-500',
      structure: {
        title: 'Meeting Agenda',
        lists: [
          {
            title: 'Agenda Items',
            cards: [
              { title: 'Welcome & Introduction', description: 'Team introductions and meeting overview' },
              { title: 'Previous Action Items Review', description: 'Review status of previous meeting action items' },
              { title: 'Main Discussion Topics', description: 'Key topics to be discussed' },
              { title: 'Decisions Needed', description: 'Items requiring team decisions' }
            ]
          },
          {
            title: 'In Progress',
            cards: [
              { title: 'Budget Review', description: 'Q4 budget allocation discussion' },
              { title: 'Project Timeline', description: 'Review project milestones and deadlines' }
            ]
          },
          {
            title: 'Action Items',
            cards: [
              { title: 'Send meeting notes', description: 'Distribute meeting summary to all participants' },
              { title: 'Schedule follow-up', description: 'Book next meeting date and time' },
              { title: 'Update project plan', description: 'Incorporate decisions into project roadmap' }
            ]
          },
          {
            title: 'Completed',
            cards: [
              { title: 'Q3 Review', description: 'Previous quarter performance review completed' },
              { title: 'Team feedback', description: 'Collected and documented team suggestions' }
            ]
          }
        ]
      }
    },
    {
      id: 'kanban-template',
      title: 'Kanban Template',
      description: 'Visual workflow management with To Do, In Progress, and Done stages',
      category: 'Productivity',
      uses: '3.5k',
      rating: 4.9,
      isNew: false,
      icon: KanbanSquare,
      color: 'bg-green-500',
      structure: {
        title: 'Kanban Board',
        lists: [
          {
            title: 'Backlog',
            cards: [
              { title: 'User authentication', description: 'Implement login and registration system' },
              { title: 'Database design', description: 'Design database schema and relationships' },
              { title: 'API documentation', description: 'Create comprehensive API documentation' },
              { title: 'Performance testing', description: 'Set up automated performance tests' }
            ]
          },
          {
            title: 'To Do',
            cards: [
              { title: 'Setup development environment', description: 'Configure local development setup' },
              { title: 'Create wireframes', description: 'Design initial UI/UX wireframes' },
              { title: 'Research competitors', description: 'Analyze competitor features and pricing' }
            ]
          },
          {
            title: 'In Progress',
            cards: [
              { title: 'Implement core features', description: 'Build main application functionality' },
              { title: 'Database integration', description: 'Connect application to database' }
            ]
          },
          {
            title: 'Testing',
            cards: [
              { title: 'Unit tests', description: 'Write comprehensive unit tests' },
              { title: 'Integration tests', description: 'Test component interactions' }
            ]
          },
          {
            title: 'Done',
            cards: [
              { title: 'Project setup', description: 'Initial project structure completed' },
              { title: 'Requirements gathering', description: 'All project requirements documented' }
            ]
          }
        ]
      }
    }
  ];

  const handleUseTemplate = async (template: any) => {
    try {
      setLoadingTemplate(template.id);
      
      // Create board first
      const boardResult = await dispatch(createBoard({
        title: template.structure.title,
        description: `Board created from ${template.title} template`
      })).unwrap();
      
      const boardId = boardResult.id;
      
      // Create lists and cards for each list
      for (const listData of template.structure.lists) {
        const listResult = await dispatch(createList({
          boardId,
          title: listData.title
        })).unwrap();
        
        const listId = listResult.id;
        
        // Create cards for this list
        for (const cardData of listData.cards) {
          await dispatch(createCard({
            listId,
            title: cardData.title,
            description: cardData.description
          })).unwrap();
        }
      }
      
      // Navigate to the newly created board
      navigate(`/board/${boardId}`);
    } catch (error) {
      console.error('Error creating board from template:', error);
      // Handle error - maybe show a toast notification
    } finally {
      setLoadingTemplate(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/80 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3 sm:py-4 shadow-lg">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="flex items-center gap-2 p-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Templates</h1>
            <p className="text-sm text-muted-foreground hidden sm:block">
              Get started faster with pre-built templates
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Board Templates */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Layout className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Board Templates</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {boardTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${template.color} bg-opacity-10 group-hover:bg-opacity-20 transition-colors`}>
                        <Icon className={`h-5 w-5 ${template.color.replace('bg-', 'text-')}`} />
                      </div>
                      {template.isNew && (
                        <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-md">
                          New
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardTitle className="text-sm font-medium mb-2 group-hover:text-primary transition-colors">
                      {template.title}
                    </CardTitle>
                    <CardDescription className="text-xs mb-3">
                      {template.description}
                    </CardDescription>
                    
                    {/* Template Preview */}
                    <div className="mb-3 p-2 bg-muted/50 rounded-md">
                      <div className="text-xs font-medium mb-2 text-muted-foreground">Preview:</div>
                      <div className="flex gap-1 overflow-x-auto">
                        {template.structure.lists.slice(0, 3).map((list, idx) => (
                          <div key={idx} className="flex-shrink-0 w-16 p-1 bg-background rounded border text-xs">
                            <div className="font-medium truncate">{list.title}</div>
                            <div className="text-muted-foreground text-xs">{list.cards.length}</div>
                          </div>
                        ))}
                        {template.structure.lists.length > 3 && (
                          <div className="flex-shrink-0 w-16 p-1 bg-muted rounded border text-xs flex items-center justify-center">
                            +{template.structure.lists.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{template.uses} uses</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{template.rating}</span>
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      disabled={loadingTemplate === template.id}
                    >
                      {loadingTemplate === template.id ? 'Creating...' : 'Use Template'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TemplatesPage;

import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Star, Users, Calendar, KanbanSquare, Layout, Briefcase, User, Bug, FileText, TrendingUp, CheckSquare } from 'lucide-react';
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
              { title: 'Team Standup & Updates', description: 'Quick team status updates and blockers' },
              { title: 'Product Roadmap Review', description: 'Review upcoming features and priorities' },
              { title: 'Client Feedback Discussion', description: 'Address recent client feedback and concerns' },
              { title: 'Resource Allocation', description: 'Discuss team capacity and project assignments' }
            ]
          },
          {
            title: 'In Progress',
            cards: [
              { title: 'Q4 Budget Planning', description: 'Finalize budget allocation for Q4 initiatives' },
              { title: 'Sprint Retrospective', description: 'Review last sprint and identify improvements' }
            ]
          },
          {
            title: 'Action Items',
            cards: [
              { title: 'Update project documentation', description: 'Ensure all project docs are current' },
              { title: 'Schedule stakeholder meeting', description: 'Coordinate meeting with key stakeholders' },
              { title: 'Implement feedback changes', description: 'Apply changes based on team input' }
            ]
          },
          {
            title: 'Completed',
            cards: [
              { title: 'Performance reviews completed', description: 'All quarterly performance reviews finished' },
              { title: 'Security audit passed', description: 'System security assessment successfully completed' }
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
              { title: 'Implement user authentication system', description: 'Build secure login and registration with JWT tokens' },
              { title: 'Design database architecture', description: 'Create optimized database schema for scalability' },
              { title: 'Create comprehensive API documentation', description: 'Document all endpoints with examples and error codes' },
              { title: 'Setup performance monitoring', description: 'Implement application performance tracking and alerts' }
            ]
          },
          {
            title: 'To Do',
            cards: [
              { title: 'Configure development environment', description: 'Set up local development with Docker and hot reload' },
              { title: 'Design user interface wireframes', description: 'Create detailed wireframes for all user flows' },
              { title: 'Conduct competitor analysis', description: 'Research market competitors and feature comparison' }
            ]
          },
          {
            title: 'In Progress',
            cards: [
              { title: 'Build core application features', description: 'Implement main functionality and user workflows' },
              { title: 'Integrate database connections', description: 'Connect application to production database' }
            ]
          },
          {
            title: 'Testing',
            cards: [
              { title: 'Write comprehensive unit tests', description: 'Create unit tests for all business logic components' },
              { title: 'Implement integration testing', description: 'Test API endpoints and database interactions' }
            ]
          },
          {
            title: 'Done',
            cards: [
              { title: 'Complete project infrastructure setup', description: 'All development tools and CI/CD pipelines ready' },
              { title: 'Finalize requirements documentation', description: 'Complete all functional and technical specifications' }
            ]
          }
        ]
      }
    },
    {
      id: 'project-management',
      title: 'Project Management',
      description: 'Complete project lifecycle management with planning, development, and delivery phases',
      category: 'Productivity',
      uses: '2.8k',
      rating: 4.8,
      isNew: false,
      icon: Briefcase,
      color: 'bg-purple-500',
      structure: {
        title: 'Project Management',
        lists: [
          {
            title: 'Planning',
            cards: [
              { title: 'Define project scope and objectives', description: 'Document project goals, deliverables, and success criteria' },
              { title: 'Create project timeline and milestones', description: 'Establish key dates and project phases' },
              { title: 'Identify stakeholders and team members', description: 'List all people involved and their roles' },
              { title: 'Conduct risk assessment', description: 'Identify potential risks and mitigation strategies' }
            ]
          },
          {
            title: 'Development',
            cards: [
              { title: 'Design system architecture', description: 'Create technical specifications and architecture diagrams' },
              { title: 'Implement core features', description: 'Build the main functionality of the project' },
              { title: 'Code review and quality assurance', description: 'Review code and ensure quality standards' },
              { title: 'Integration testing', description: 'Test component interactions and system integration' }
            ]
          },
          {
            title: 'Testing',
            cards: [
              { title: 'Unit testing', description: 'Test individual components and functions' },
              { title: 'User acceptance testing', description: 'Validate functionality with end users' },
              { title: 'Performance testing', description: 'Ensure system meets performance requirements' },
              { title: 'Bug fixes and refinements', description: 'Address issues found during testing' }
            ]
          },
          {
            title: 'Deployment',
            cards: [
              { title: 'Prepare deployment environment', description: 'Set up production environment and configurations' },
              { title: 'Data migration', description: 'Transfer data from old systems if applicable' },
              { title: 'Go-live preparation', description: 'Final checks before production release' },
              { title: 'Post-deployment monitoring', description: 'Monitor system performance after launch' }
            ]
          },
          {
            title: 'Completed',
            cards: [
              { title: 'Project documentation completed', description: 'All technical and user documentation finished' },
              { title: 'User training completed', description: 'Team and users trained on new system' },
              { title: 'Project handover', description: 'Transfer knowledge to maintenance team' },
              { title: 'Project retrospective', description: 'Review what went well and lessons learned' }
            ]
          }
        ]
      }
    },
    {
      id: 'personal-tasks',
      title: 'Personal Task Management',
      description: 'Organize your daily tasks, goals, and personal projects efficiently',
      category: 'Personal',
      uses: '1.9k',
      rating: 4.6,
      isNew: false,
      icon: User,
      color: 'bg-orange-500',
      structure: {
        title: 'Personal Tasks',
        lists: [
          {
            title: 'Today',
            cards: [
              { title: 'Morning routine', description: 'Exercise, meditation, and healthy breakfast' },
              { title: 'Check emails and messages', description: 'Respond to important communications' },
              { title: 'Review daily goals', description: 'Plan and prioritize tasks for the day' },
              { title: 'Work on main project', description: 'Focus on the most important task of the day' }
            ]
          },
          {
            title: 'This Week',
            cards: [
              { title: 'Grocery shopping', description: 'Plan meals and buy necessary items' },
              { title: 'Doctor appointment', description: 'Schedule and attend medical checkup' },
              { title: 'Read technical article', description: 'Learn something new in your field' },
              { title: 'Call family/friends', description: 'Maintain personal relationships' }
            ]
          },
          {
            title: 'This Month',
            cards: [
              { title: 'Review budget and expenses', description: 'Track spending and plan savings' },
              { title: 'Clean and organize home', description: 'Deep cleaning and decluttering' },
              { title: 'Learn new skill', description: 'Dedicate time to personal development' },
              { title: 'Plan vacation or break', description: 'Schedule time for rest and relaxation' }
            ]
          },
          {
            title: 'Backlog',
            cards: [
              { title: 'Update resume/CV', description: 'Keep professional documents current' },
              { title: 'Backup important files', description: 'Ensure data is safely stored' },
              { title: 'Organize digital files', description: 'Sort and archive documents and photos' },
              { title: 'Research investment options', description: 'Learn about financial planning' }
            ]
          },
          {
            title: 'Completed',
            cards: [
              { title: 'Morning run completed', description: '30-minute cardio session finished' },
              { title: 'Project milestone achieved', description: 'Successfully completed major deliverable' }
            ]
          }
        ]
      }
    },
    {
      id: 'bug-tracking',
      title: 'Bug Tracking',
      description: 'Track and manage software bugs from discovery to resolution',
      category: 'Development',
      uses: '1.7k',
      rating: 4.5,
      isNew: false,
      icon: Bug,
      color: 'bg-red-500',
      structure: {
        title: 'Bug Tracking',
        lists: [
          {
            title: 'Reported',
            cards: [
              { title: 'Login page crashes on mobile', description: 'Users cannot access the app on mobile devices' },
              { title: 'Search results not displaying', description: 'Search functionality returns empty results' },
              { title: 'Email notifications not sent', description: 'System fails to send automated emails' },
              { title: 'File upload limit too low', description: 'Users cannot upload files larger than 5MB' }
            ]
          },
          {
            title: 'Investigating',
            cards: [
              { title: 'Database connection timeout', description: 'Intermittent database connectivity issues' },
              { title: 'API response delay', description: 'Slow response times from backend services' },
              { title: 'Memory leak in dashboard', description: 'Application memory usage grows over time' }
            ]
          },
          {
            title: 'In Progress',
            cards: [
              { title: 'Fix mobile login crash', description: 'Implement mobile-specific authentication flow' },
              { title: 'Optimize search algorithm', description: 'Improve search query performance and accuracy' },
              { title: 'Debug email service integration', description: 'Fix SMTP configuration and error handling' }
            ]
          },
          {
            title: 'Testing',
            cards: [
              { title: 'Test mobile login fix', description: 'Verify login works on all mobile devices' },
              { title: 'Validate search improvements', description: 'Ensure search returns accurate results' },
              { title: 'Check email delivery', description: 'Confirm all notification emails are sent properly' }
            ]
          },
          {
            title: 'Resolved',
            cards: [
              { title: 'Fixed user profile loading', description: 'Profile images now load correctly' },
              { title: 'Resolved payment processing error', description: 'Transactions now complete successfully' }
            ]
          }
        ]
      }
    }
  ];

  const handleUseTemplate = async (template: any) => {
    try {
      setLoadingTemplate(template.id);
      console.log('Starting template creation for:', template.title);

      // Create board first
      console.log('Creating board...');
      const boardResult = await dispatch(createBoard({
        title: template.structure.title,
        description: `Board created from ${template.title} template`
      })).unwrap();

      if (!boardResult || !boardResult.id) {
        throw new Error('Failed to create board - no board ID returned');
      }

      const boardId = boardResult.id;
      console.log('Board created successfully with ID:', boardId);

      let listsCreated = 0;
      let cardsCreated = 0;

      // Create lists and cards for each list
      for (const [listIndex, listData] of template.structure.lists.entries()) {
        try {
          console.log(`Creating list ${listIndex + 1}/${template.structure.lists.length}: ${listData.title}`);
          const listResult = await dispatch(createList({
            boardId,
            title: listData.title
          })).unwrap();

          // Server returns { list: { ... } }, so extract the list object
          const listDataFromServer = listResult.list || listResult;

          if (!listDataFromServer || !listDataFromServer.id) {
            console.error(`Failed to create list: ${listData.title} - no list data or ID returned`);
            console.error('List result:', listResult);
            console.error('Extracted list data:', listDataFromServer);
            continue;
          }

          const listId = listDataFromServer.id;
          listsCreated++;
          console.log(`List created: ${listData.title} (ID: ${listId})`);

          // Create cards for this list
          for (const [cardIndex, cardData] of listData.cards.entries()) {
            try {
              console.log(`Creating card ${cardIndex + 1}/${listData.cards.length} in ${listData.title}: ${cardData.title}`);
              await dispatch(createCard({
                listId,
                title: cardData.title,
                description: cardData.description
              })).unwrap();
              cardsCreated++;
              console.log(`Card created: ${cardData.title}`);
            } catch (cardError) {
              console.error(`Failed to create card "${cardData.title}":`, cardError);
              // Continue with other cards
            }
          }
        } catch (listError) {
          console.error(`Failed to create list "${listData.title}":`, listError);
          // Continue with other lists
        }
      }

      console.log(`Template creation completed: ${listsCreated} lists, ${cardsCreated} cards`);

      if (listsCreated === 0) {
        throw new Error('Failed to create any lists for the template');
      }

      // Navigate to the newly created board
      console.log('Navigating to board:', boardId);
      navigate(`/board/${boardId}`);

    } catch (error: any) {
      console.error('Error creating board from template:', error);

      // Show user-friendly error message
      const errorMessage = error?.message || 'Failed to create board from template';
      alert(`Error: ${errorMessage}\n\nPlease try again or create a board manually.`);

      // If board was created but lists/cards failed, still try to navigate
      if (error.boardId) {
        console.log('Attempting to navigate to partially created board:', error.boardId);
        navigate(`/board/${error.boardId}`);
      }
    } finally {
      setLoadingTemplate(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-1 md:pt-2">
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
            {boardTemplates.map((template) =>
              <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer group pt-6">
                <CardHeader>
                    <CardTitle className="text-sm font-medium mb-2 group-hover:text-primary transition-colors">
                      {template.title}
                    </CardTitle>
                    <CardDescription className="text-xs mb-3">
                      {template.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default TemplatesPage;

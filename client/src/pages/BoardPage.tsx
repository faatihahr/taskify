import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Button } from '../components/ui/button';
import { Plus, ChevronLeft, Image as ImageIcon, CheckSquare } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBoardById, reorderCards, updateCardPosition, moveList, updateTaskCoverImage } from '../store/boardsSlice';
import CreateListModal from '../components/lists/CreateListModal';
import CreateCardModal from '../components/cards/CreateCardModal';
import TaskDetailModal from '../components/cards/TaskDetailModal';
import { useNavigate } from 'react-router-dom';

// Color palette for lists with dark mode variants
const listColors = [
  'bg-blue-100 border-blue-300 dark:bg-blue-900/50 dark:border-blue-700',
  'bg-green-100 border-green-300 dark:bg-green-900/50 dark:border-green-700',
  'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/50 dark:border-yellow-700',
  'bg-purple-100 border-purple-300 dark:bg-purple-900/50 dark:border-purple-700',
  'bg-pink-100 border-pink-300 dark:bg-pink-900/50 dark:border-pink-700',
  'bg-indigo-100 border-indigo-300 dark:bg-indigo-900/50 dark:border-indigo-700',
  'bg-red-100 border-red-300 dark:bg-red-900/50 dark:border-red-700',
  'bg-orange-100 border-orange-300 dark:bg-orange-900/50 dark:border-orange-700',
];

// Utility function to validate and format image URLs
const validateImageUrl = (imageUrl: string): string => {
  if (!imageUrl) return '';
  
  if (imageUrl.startsWith('blob:')) {
    // Blob URLs are temporary and may expire
    // We'll try to use them but they might fail
    return imageUrl;
  } else if (imageUrl.startsWith('/uploads')) {
    // Server uploaded images need full URL
    return `http://localhost:3000${imageUrl}`;
  } else if (imageUrl.startsWith('http')) {
    // Full URLs should be used as-is
    return imageUrl;
  } else if (imageUrl.startsWith('data:')) {
    // Base64 images should be used as-is
    return imageUrl;
  } else {
    // Fallback for any other format
    return imageUrl;
  }
};

const TaskCard: React.FC<{ task: any; index: number; onClick: () => void }> = ({ task, index, onClick }) => {
  console.log('TaskCard rendered:', { taskId: task.id, taskTitle: task.title, index });
  const [imageError, setImageError] = useState(false);
  
  // Calculate checklist completion
  const getChecklistCompletion = () => {
    if (!task.checklists || task.checklists.length === 0) return null;
    
    let totalItems = 0;
    let completedItems = 0;
    
    task.checklists.forEach((checklist: any) => {
      if (checklist.items && checklist.items.length > 0) {
        totalItems += checklist.items.length;
        completedItems += checklist.items.filter((item: any) => item.completed).length;
      }
    });
    
    if (totalItems === 0) return null;
    
    const percentage = Math.round((completedItems / totalItems) * 100);
    return {
      percentage,
      isComplete: percentage === 100,
      totalItems,
      completedItems
    };
  };
  
  const checklistCompletion = getChecklistCompletion();
  
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided: any, snapshot: any) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-card rounded-lg border border-border cursor-pointer hover:shadow-md overflow-hidden ${
            snapshot.isDragging ? 'shadow-xl' : ''
          }`}
        >
          {/* Cover Image */}
          {task.coverImage && !imageError ? (
            <div className="w-full h-24 overflow-hidden">
              <img
                src={validateImageUrl(task.coverImage)}
                alt={task.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image load error:', e);
                  console.error('Image src:', task.coverImage);
                  setImageError(true);
                }}
              />
            </div>
          ) : task.coverImage && imageError ? (
            <div className="w-full h-24 bg-muted flex items-center justify-center text-muted-foreground text-xs border-b">
              <ImageIcon className="w-4 h-4 mr-1" />
              Image unavailable
            </div>
          ) : null}

          <div className="p-3 sm:p-4">
            <h4 className="text-xs sm:text-sm font-semibold text-card-foreground line-clamp-2">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 sm:mt-2 line-clamp-2 sm:line-clamp-3">
                {task.description}
              </p>
            )}

            {/* Priority indicator */}
            <div className="flex items-center justify-between mt-2 sm:mt-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full"></div>
                
                {/* Label Badges */}
                {task.labels && task.labels.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {task.labels.slice(0, 3).map((label: any) => (
                      <div
                        key={label.id}
                        className="px-1.5 py-0.5 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: label.color }}
                        title={label.name}
                      >
                        {label.name.length > 8 ? label.name.substring(0, 8) + '...' : label.name}
                      </div>
                    ))}
                    {task.labels.length > 3 && (
                      <div className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">
                        +{task.labels.length - 3}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Checklist Badge */}
                {checklistCompletion && (
                  <div 
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      checklistCompletion.isComplete 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                    title={`${checklistCompletion.completedItems}/${checklistCompletion.totalItems} items completed`}
                  >
                    <CheckSquare className="h-3 w-3" />
                    {checklistCompletion.percentage}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentBoard, currentBoardLoading, error } = useAppSelector((state) => state.boards);
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [taskUpdateCounter, setTaskUpdateCounter] = useState(0);

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoardById(boardId));
    }
  }, [boardId, dispatch]);

  const handleCreateList = () => {
    setShowCreateListModal(true);
  };

  const handleAddTask = (listId: string) => {
    setSelectedListId(listId);
    setShowCreateCardModal(true);
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setShowTaskDetailModal(true);
  };

  const handleCoverImageUpdate = async (taskId: string, newCoverImage: string) => {
    console.log('handleCoverImageUpdate in BoardPage:', { taskId, newCoverImage });

    try {
      // Dispatch action to update task cover image in Redux store
      await dispatch(updateTaskCoverImage({ taskId, coverImage: newCoverImage })).unwrap();
      console.log('Task cover image updated successfully in Redux store');

      // Update selectedTask for immediate UI update
      if (selectedTask && selectedTask.id === taskId) {
        const updatedTask = { ...selectedTask, coverImage: newCoverImage };
        setSelectedTask(updatedTask);
        console.log('selectedTask updated:', updatedTask);
      }
    } catch (error) {
      console.error('Failed to update task cover image:', error);
    }
  };

  const handleCommentAdded = (taskId: string) => {
    console.log('handleCommentAdded called for taskId:', taskId);

    // Find the updated task from Redux store and update selectedTask
    if (currentBoard) {
      for (const list of currentBoard.lists) {
        const card = list.cards.find(card => card.id === taskId);
        if (card) {
          console.log('Updated task found in Redux store:', card);
          console.log('Card comments in handleCommentAdded:', card.comments);
          // Create a new object to ensure React detects the change
          setSelectedTask({ ...card });
          // Force re-render by updating counter
          setTaskUpdateCounter(prev => prev + 1);
          break;
        }
      }
    }
  };

  const handleBackToDashboard = () => {
    navigate('/boards');
  };

  const handleDragEnd = async (result: DropResult) => {
    console.log('=== DRAG END TRIGGERED ===');
    const { destination, source, draggableId, type } = result;

    console.log('Drag end data:', { 
      destination, 
      source, 
      draggableId, 
      type,
      sourceIndex: source.index,
      destIndex: destination?.index,
      direction: destination?.index !== undefined 
        ? destination.index > source.index ? 'RIGHT' 
        : destination.index < source.index ? 'LEFT' 
        : 'SAME'
        : 'NO_DESTINATION'
    });

    // Log additional info for debugging
    console.log('Source droppable:', source.droppableId);
    console.log('Destination droppable:', destination?.droppableId);
    console.log('Is same droppable:', destination?.droppableId === source.droppableId);

    if (!destination) {
      console.log('No destination - drag cancelled');
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      console.log('No movement detected - same position');
      return;
    } else {
      console.log('Movement detected - different position');
    }

    // Handle list reordering
    if (type === 'COLUMN') {
      console.log('=== HANDLING LIST REORDER ===');
      console.log('Move list data:', { listId: draggableId, position: destination.index });
      
      try {
        const result = await dispatch(moveList({
          listId: draggableId,
          position: destination.index
        })).unwrap();
        console.log('Move list successful:', result);
        
        // Refetch to ensure state is updated
        if (boardId) {
          dispatch(fetchBoardById(boardId));
        }
      } catch (error) {
        console.error('Failed to move list:', error);
        // Refetch board data on error
        if (boardId) {
          dispatch(fetchBoardById(boardId));
        }
      }
      return;
    }

    // Handle card movement
    console.log('=== HANDLING CARD MOVEMENT ===');
    console.log('Card movement data:', {
      sourceListId: source.droppableId,
      destListId: destination.droppableId,
      sourceIndex: source.index,
      destIndex: destination.index,
      cardId: draggableId
    });

    dispatch(reorderCards({
      sourceListId: source.droppableId,
      destListId: destination.droppableId,
      sourceIndex: source.index,
      destIndex: destination.index,
    }));

    try {
      console.log('=== CARD MOVEMENT DEBUG ===');
      console.log('Source:', { listId: source.droppableId, index: source.index });
      console.log('Destination:', { listId: destination.droppableId, index: destination.index });
      console.log('Card ID:', draggableId);
      
      await dispatch(updateCardPosition({
        cardId: draggableId,
        listId: destination.droppableId,
        position: destination.index,
      })).unwrap();
      console.log('Card position updated successfully');
      
      // Don't refetch immediately - let the optimistic update handle UI
      // Only refetch if there's an error or after a delay
      setTimeout(() => {
        if (boardId) {
          dispatch(fetchBoardById(boardId));
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to update card position:', error);
      // Refetch on error to restore correct state
      if (boardId) {
        dispatch(fetchBoardById(boardId));
      }
    }
  };

  if (currentBoardLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">Error loading board</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Board not found</h2>
          <p className="text-muted-foreground">The board you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background dark:from-background dark:via-muted/10 dark:to-background">
      {/* Board Header */}
      <div className="bg-card/80 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3 sm:py-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 p-2 sm:p-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent truncate">
                {currentBoard.title}
              </h1>
              {currentBoard.description && (
                <p className="text-muted-foreground text-xs sm:text-sm mt-1 line-clamp-1 sm:line-clamp-none">
                  {currentBoard.description}
                </p>
              )}
            </div>
          </div>
          <Button
            onClick={handleCreateList}
            className="px-3 py-2 sm:px-4 shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Add List</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Board Content */}
      <div className="p-3 sm:p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable
            droppableId="lists"
            direction="horizontal"
            type="COLUMN"
          >
            {(provided: any, snapshot: any) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`flex gap-2 sm:gap-4 min-h-[calc(100vh-150px)] sm:min-h-[calc(100vh-200px)] transition-colors duration-200 ${
                  snapshot.isDraggingOver ? 'bg-primary/5' : ''
                }`}
              >
                {currentBoard.lists.map((list: any, index: number) => (
                  <Draggable key={list.id} draggableId={list.id} index={index}>
                    {(provided: any, snapshot: any) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`w-64 sm:w-72 ${listColors[index % listColors.length]} rounded-lg flex-shrink-0 border-2 shadow-md transition-shadow ${
                          snapshot.isDragging ? 'shadow-2xl' : ''
                        }`}
                        style={{
                          ...provided.draggableProps.style,
                        }}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="px-3 sm:px-4 py-2 sm:py-3 border-b border-border/30 cursor-move"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                              {list.title}
                            </h3>
                            <span className="text-xs sm:text-sm font-bold text-foreground bg-background/60 px-2 py-1 rounded-full shadow-sm flex-shrink-0">
                              {list.cards?.length || 0}
                            </span>
                          </div>
                        </div>
                        <div className="p-2 sm:p-3">
                          <Droppable droppableId={list.id} type="CARD">
                            {(provided: any) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-1 sm:space-y-2 min-h-[200px] sm:min-h-[300px]"
                              >
                                {list.cards.map((task: any, taskIndex: number) => (
                                  <TaskCard
                                    key={task.id}
                                    task={task}
                                    index={taskIndex}
                                    onClick={() => handleTaskClick(task)}
                                  />
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddTask(list.id)}
                            className="w-full justify-start mt-1 sm:mt-2 text-xs sm:text-sm py-1 sm:py-2"
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Add task
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Modals */}
      {showCreateListModal && (
        <CreateListModal
          boardId={boardId!}
          isOpen={showCreateListModal}
          onClose={() => setShowCreateListModal(false)}
        />
      )}

      {showCreateCardModal && selectedListId && (
        <CreateCardModal
          listId={selectedListId}
          isOpen={showCreateCardModal}
          onClose={() => {
            setShowCreateCardModal(false);
            setSelectedListId(null);
          }}
        />
      )}

      {showTaskDetailModal && selectedTask && (
        <TaskDetailModal
          key={`task-${selectedTask.id}-${taskUpdateCounter}`}
          task={selectedTask}
          isOpen={showTaskDetailModal}
          onCoverImageUpdate={handleCoverImageUpdate}
          onCommentAdded={handleCommentAdded}
          onClose={() => {
            setShowTaskDetailModal(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

export default BoardPage;

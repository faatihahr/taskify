import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Button } from '../components/ui/button';
import { Plus, ChevronLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBoardById, reorderCards, updateCardPosition, moveList } from '../store/boardsSlice';
import CreateListModal from '../components/lists/CreateListModal';
import CreateCardModal from '../components/cards/CreateCardModal';
import { useNavigate } from 'react-router-dom';

// Color palette for lists
const listColors = [
  'bg-blue-100 border-blue-300',
  'bg-green-100 border-green-300', 
  'bg-yellow-100 border-yellow-300',
  'bg-purple-100 border-purple-300',
  'bg-pink-100 border-pink-300',
  'bg-indigo-100 border-indigo-300',
  'bg-red-100 border-red-300',
  'bg-orange-100 border-orange-300',
];

const TaskCard: React.FC<{ task: any; index: number }> = ({ task, index }) => {
  console.log('TaskCard rendered:', { taskId: task.id, taskTitle: task.title, index });
  
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided: any, snapshot: any) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white p-4 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-all ${
            snapshot.isDragging ? 'shadow-xl rotate-1' : 'hover:-translate-y-1'
          }`}
        >
          <h4 className="text-sm font-semibold text-gray-800">{task.title}</h4>
          {task.description && (
            <p className="text-xs text-gray-600 mt-2 line-clamp-2">{task.description}</p>
          )}
          
          {/* Priority indicator */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-500">Task</span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <div className="w-1 h-3 bg-gray-300 rounded-full"></div>
              <div className="w-1 h-3 bg-gray-300 rounded-full"></div>
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
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

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
      await dispatch(updateCardPosition({
        cardId: draggableId,
        listId: destination.droppableId,
        position: destination.index,
      })).unwrap();
      console.log('Card position updated successfully');
      
      // Refetch to ensure state is persisted
      if (boardId) {
        dispatch(fetchBoardById(boardId));
      }
    } catch (error) {
      console.error('Failed to update card position:', error);
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
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error loading board</h2>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Board Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-purple-200 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="flex items-center gap-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {currentBoard.title}
              </h1>
              {currentBoard.description && (
                <p className="text-gray-600 text-sm mt-1">{currentBoard.description}</p>
              )}
            </div>
          </div>
          <Button 
            onClick={handleCreateList}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 shadow-md hover:shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add List
          </Button>
        </div>
      </div>

      {/* Board Content */}
      <div className="p-6 overflow-x-auto">
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
                className={`flex gap-4 min-h-[calc(100vh-200px)] transition-colors duration-200 ${
                  snapshot.isDraggingOver ? 'bg-blue-50/50' : ''
                }`}
                style={{
                  minWidth: `${currentBoard.lists.length * 320 + 100}px`, // Dynamic width based on list count
                }}
              >
                {currentBoard.lists.map((list: any, index: number) => (
                  <Draggable key={list.id} draggableId={list.id} index={index}>
                    {(provided: any, snapshot: any) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`w-72 ${listColors[index % listColors.length]} rounded-lg flex-shrink-0 border-2 shadow-md transition-transform ${
                          snapshot.isDragging ? 'transform rotate-2 shadow-xl' : ''
                        }`}
                        style={{
                          ...provided.draggableProps.style,
                        }}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="px-4 py-3 border-b border-white/30 cursor-move"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800">{list.title}</h3>
                            <span className="text-sm font-bold text-gray-800 bg-white/60 px-2 py-1 rounded-full shadow-sm">
                              {list.cards?.length || 0}
                            </span>
                          </div>
                        </div>
                        <div className="p-3">
                          <Droppable droppableId={list.id} type="CARD">
                            {(provided: any) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-2 min-h-[200px]"
                              >
                                {list.cards.map((task: any, taskIndex: number) => (
                                  <TaskCard key={task.id} task={task} index={taskIndex} />
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddTask(list.id)}
                            className="w-full justify-start text-gray-600 hover:text-gray-800 hover:bg-white/50 mt-2"
                          >
                            <Plus className="h-4 w-4 mr-2" />
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
    </div>
  );
};

export default BoardPage;

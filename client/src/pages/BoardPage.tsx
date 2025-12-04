import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, MoreHorizontal } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchBoardById, reorderCards } from '../store/boardsSlice';

const TaskCard: React.FC<{ task: any; index: number }> = ({ task, index }) => (
  <Draggable draggableId={task.id} index={index}>
    {(provided: any, snapshot: any) => (
      <Card
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
        className={`p-3 mb-2 cursor-grab active:cursor-grabbing ${
          snapshot.isDragging ? 'shadow-lg rotate-2' : 'shadow-sm'
        }`}
      >
        <h4 className="font-medium text-sm">{task.title}</h4>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
        )}
      </Card>
    )}
  </Draggable>
);

const ListColumn: React.FC<{ list: any }> = ({ list }) => (
  <div className="flex-1 min-w-0 mr-4">
    <Card className="p-4 h-fit">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-sm">{list.title}</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {list.cards?.length || 0}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>
      
      <Droppable droppableId={list.id}>
        {(provided: any, snapshot: any) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[200px] ${
              snapshot.isDraggingOver ? 'bg-muted/50' : ''
            }`}
          >
            {list.cards?.map((task: any, index: number) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
        )}
      </Droppable>
    </Card>
  </div>
);

const BoardPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const dispatch = useAppDispatch();
  const { currentBoard, currentBoardLoading, error } = useAppSelector((state) => state.boards);

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoardById(boardId));
    }

    // Cleanup on unmount
    return () => {
      // dispatch(clearCurrentBoard());
    };
  }, [dispatch, boardId]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Optimistic update
    dispatch(reorderCards({
      sourceListId: source.droppableId,
      destListId: destination.droppableId,
      sourceIndex: source.index,
      destIndex: destination.index,
    }));

    // TODO: Call API to update backend
    console.log('Dragged item:', draggableId);
    console.log('From:', source.droppableId, source.index);
    console.log('To:', destination.droppableId, destination.index);
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
    <div className="min-h-screen bg-background">
      <div className="p-6">
        {/* Board Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{currentBoard.title}</h1>
            {currentBoard.description && (
              <p className="text-muted-foreground">{currentBoard.description}</p>
            )}
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add List
          </Button>
        </div>

        {/* Board Content */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex overflow-x-auto pb-4">
            {currentBoard.lists?.map((list) => (
              <ListColumn
                key={list.id}
                list={list}
              />
            ))}
            
            {/* Add new list button */}
            <div className="flex-1 min-w-0 mr-4">
              <Card className="p-4 h-fit border-dashed border-2 border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors">
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add another list
                </Button>
              </Card>
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default BoardPage;

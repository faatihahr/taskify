import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { CheckSquare, Plus, X, Trash2, Edit } from 'lucide-react';
import { Button } from '../ui/button';
import { 
  createChecklist, 
  createChecklistItem, 
  updateChecklistItem, 
  deleteChecklist, 
  deleteChecklistItem 
} from '../../store/boardsSlice';
import type { AppDispatch } from '../../store';

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  position: number;
}

interface Checklist {
  id: string;
  title: string;
  position: number;
  items: ChecklistItem[];
}

interface ChecklistProps {
  cardId: string;
  checklists: Checklist[];
}

const ChecklistComponent: React.FC<ChecklistProps> = ({ cardId, checklists }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [showAddChecklist, setShowAddChecklist] = useState(false);
  const [newItemTitles, setNewItemTitles] = useState<{ [key: string]: string }>({});
  const [editMode, setEditMode] = useState(false); // New state for edit mode

  const handleCreateChecklist = async () => {
    console.log('handleCreateChecklist called with title:', newChecklistTitle);
    console.log('cardId:', cardId);
    
    if (newChecklistTitle.trim()) {
      try {
        console.log('Dispatching createChecklist...');
        await dispatch(createChecklist({ cardId, title: newChecklistTitle.trim() })).unwrap();
        console.log('Checklist created successfully');
        setNewChecklistTitle('');
        setShowAddChecklist(false);
      } catch (error) {
        console.error('Failed to create checklist:', error);
      }
    } else {
      console.log('Title is empty, not creating checklist');
    }
  };

  const handleCreateChecklistItem = async (checklistId: string) => {
    const title = newItemTitles[checklistId];
    if (title?.trim()) {
      try {
        await dispatch(createChecklistItem({ checklistId, title: title.trim() })).unwrap();
        setNewItemTitles(prev => ({ ...prev, [checklistId]: '' }));
      } catch (error) {
        console.error('Failed to create checklist item:', error);
      }
    }
  };

  const handleToggleItem = async (itemId: string, completed: boolean) => {
    try {
      await dispatch(updateChecklistItem({ itemId, completed })).unwrap();
    } catch (error) {
      console.error('Failed to update checklist item:', error);
    }
  };

  const handleDeleteChecklist = async (checklistId: string) => {
    try {
      await dispatch(deleteChecklist({ checklistId })).unwrap();
    } catch (error) {
      console.error('Failed to delete checklist:', error);
    }
  };

  const handleDeleteChecklistItem = async (itemId: string) => {
    try {
      await dispatch(deleteChecklistItem({ itemId })).unwrap();
    } catch (error) {
      console.error('Failed to delete checklist item:', error);
    }
  };

  const getChecklistProgress = (items: ChecklistItem[]) => {
    if (items.length === 0) return 0;
    const completed = items.filter(item => item.completed).length;
    return Math.round((completed / items.length) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Existing Checklists */}
      {checklists.map((checklist) => {
        const progress = getChecklistProgress(checklist.items);
        
        return (
          <div key={checklist.id} className="bg-gray-50 rounded-lg p-4">
            {/* Checklist Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-gray-600" />
                <h3 className="font-medium text-gray-800">{checklist.title}</h3>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                  {progress}%
                </span>
                {/* DEBUG: Show items count */}
                <span className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded-full">
                  Items: {checklist.items?.length || 0}
                </span>
                {/* Edit button - toggle edit mode */}
                <button
                  onClick={() => {
                    console.log('Edit checklist clicked for:', checklist.id);
                    console.log('Items count:', checklist.items?.length || 0);
                    console.log('Current edit mode:', editMode);
                    setEditMode(!editMode); // Toggle edit mode
                  }}
                  className={`text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded transition-colors duration-200 ${editMode ? 'bg-blue-100 text-blue-600' : ''}`}
                  title={editMode ? "Done editing" : "Add checklist items"}
                >
                  <Edit className="h-3 w-3" />
                </button>
                {/* Original conditional button - commented out for debugging */}
                {/* {checklist.items.length === 0 && (
                  <button
                    onClick={() => {
                      console.log('Edit checklist clicked for:', checklist.id);
                      // Focus on the input field for adding items
                      const inputElement = document.querySelector(`#add-item-${checklist.id}`) as HTMLInputElement;
                      if (inputElement) {
                        inputElement.focus();
                      }
                    }}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded transition-colors duration-200"
                    title="Add checklist items"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                )} */}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteChecklist(checklist.id)}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            {/* Progress Bar */}
            {checklist.items.length > 0 && (
              <div className="mb-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Checklist Items */}
            <div className="space-y-2 mb-3">
              {checklist.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={(e) => handleToggleItem(item.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span
                    className={`flex-1 text-sm ${
                      item.completed
                        ? 'text-gray-500 line-through'
                        : 'text-gray-700'
                    }`}
                  >
                    {item.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteChecklistItem(item.id)}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add Item Input - only show in edit mode */}
            {editMode && (
              <div className="flex gap-2">
                <input
                  id={`add-item-${checklist.id}`}
                  type="text"
                  value={newItemTitles[checklist.id] || ''}
                  onChange={(e) =>
                    setNewItemTitles(prev => ({
                      ...prev,
                      [checklist.id]: e.target.value
                    }))
                  }
                  placeholder="Add an item..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateChecklistItem(checklist.id);
                    }
                  }}
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={() => handleCreateChecklistItem(checklist.id)}
                  disabled={!newItemTitles[checklist.id]?.trim()}
                  className="px-3 py-2"
                >
                  Add
                </Button>
              </div>
            )}
          </div>
        );
      })}

      {/* Add New Checklist - only show in edit mode */}
      {editMode && (
        <>
          {!showAddChecklist ? (
            <button
              type="button"
              onClick={() => {
                console.log('Add checklist button clicked');
                setShowAddChecklist(true);
              }}
              className="w-full justify-start text-gray-600 hover:text-gray-800 hover:bg-gray-100 border border-gray-300 border-dashed px-3 py-2 rounded-md flex items-center cursor-pointer transition-all duration-200 pointer-events-auto hover:border-solid focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              style={{ pointerEvents: 'auto', zIndex: 10 }}
              onMouseEnter={(e) => {
                console.log('Mouse entered button');
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                console.log('Mouse left button');
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
              Add checklist
            </button>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-300">
              <input
                type="text"
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                placeholder="Checklist title..."
                className="w-full px-3 py-2 mb-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateChecklist();
                  }
                }}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateChecklist}
                  disabled={!newChecklistTitle.trim()}
                  className="px-4 py-2"
                >
                  Add
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowAddChecklist(false);
                    setNewChecklistTitle('');
                  }}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChecklistComponent;

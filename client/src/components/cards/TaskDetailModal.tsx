import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../store/hooks';
import { updateTaskDescription, createComment, createChecklist } from '../../store/boardsSlice';
import type { AppDispatch } from '../../store';
import { Button } from '../ui/button';
import { 
  X, 
  Plus, 
  Calendar, 
  Users, 
  Tag, 
  CheckSquare, 
  Volume2, 
  Image as ImageIcon, 
  MoreVertical,
  Edit,
  ChevronDown,
  Paperclip,
  Upload,
  Search
} from 'lucide-react';
import ChecklistComponent from '../checklist/Checklist';

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

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
  onCoverImageUpdate: (taskId: string, newCoverImage: string) => void;
  onCommentAdded: (taskId: string) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, task, onCoverImageUpdate, onCommentAdded }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentBoard } = useAppSelector((state) => state.boards);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(task?.description || '');
  const [showActivityDetails, setShowActivityDetails] = useState(false);
  const [comment, setComment] = useState('');
  const [isCoverImageModalOpen, setIsCoverImageModalOpen] = useState(false);
  const [currentCoverImage, setCurrentCoverImage] = useState(task?.coverImage || '');
  const [coverImageError, setCoverImageError] = useState(false);
  const checklistRef = useRef<HTMLDivElement>(null);
  const [showHeaderAddChecklist, setShowHeaderAddChecklist] = useState(false);
  const [headerChecklistTitle, setHeaderChecklistTitle] = useState('');

  // Get comments directly from Redux store
  const comments = useMemo(() => {
    if (!currentBoard || !task?.id) return [];
    for (const list of currentBoard.lists) {
      const card = list.cards.find(card => card.id === task.id);
      if (card) {
        return card.comments || [];
      }
    }
    return [];
  }, [currentBoard, task?.id]);

  // Get checklists directly from Redux store
  const checklists = useMemo(() => {
    if (!currentBoard || !task?.id) return [];
    for (const list of currentBoard.lists) {
      const card = list.cards.find(card => card.id === task.id);
      if (card) {
        return card.checklists || [];
      }
    }
    return [];
  }, [currentBoard, task?.id]);

  useEffect(() => {
    console.log('TaskDetailModal - task.coverImage updated:', task?.coverImage);
    setCurrentCoverImage(task?.coverImage || '');
    setCoverImageError(false); // Reset error state when cover image changes
    
    // Test if the image URL is valid
    if (task?.coverImage) {
      const img = new Image();
      img.onload = () => setCoverImageError(false);
      img.onerror = () => setCoverImageError(true);
      img.src = validateImageUrl(task.coverImage);
    }
  }, [task?.coverImage]);

  useEffect(() => {
    setDescription(task?.description || '');
  }, [task?.description]);

  const handleSaveDescription = async () => {
    try {
      await dispatch(updateTaskDescription({ taskId: task.id, description }));
      setIsEditingDescription(false);
    } catch (error: unknown) {
      console.error('Failed to save description:', error);
    }
  };

  const handleAddComment = async () => {
    if (comment.trim()) {
      try {
        await dispatch(createComment({ cardId: task.id, content: comment }));
        setComment('');
        // Update selectedTask in parent component to reflect new comment
        // Wait a bit for Redux store to be updated before calling onCommentAdded
        setTimeout(() => onCommentAdded(task.id), 200);
      } catch (error: unknown) {
        console.error('Failed to add comment:', error);
      }
    }
  };

  const handleCoverImageUpdate = (newCoverImage: string) => {
    setCurrentCoverImage(newCoverImage);
    onCoverImageUpdate(task.id, newCoverImage);
    console.log('Updating cover image:', newCoverImage);
  };

  const scrollToChecklist = () => {
    console.log('Header Checklist button clicked!');
    console.log('checklistRef.current:', checklistRef.current);
    if (checklistRef.current) {
      console.log('Scrolling to checklist section...');
      checklistRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.log('checklistRef.current is null');
    }
  };

  const handleHeaderAddChecklist = async () => {
    if (headerChecklistTitle.trim()) {
      try {
        console.log('Creating checklist from header:', headerChecklistTitle);
        await dispatch(createChecklist({ cardId: task.id, title: headerChecklistTitle.trim() })).unwrap();
        console.log('Checklist created successfully from header');
        setHeaderChecklistTitle('');
        setShowHeaderAddChecklist(false);
        // Scroll to checklist section after creation
        setTimeout(() => {
          scrollToChecklist();
        }, 100);
      } catch (error) {
        console.error('Failed to create checklist from header:', error);
      }
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex overflow-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-6 relative overflow-hidden">
            {currentCoverImage && !coverImageError ? (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30"
                style={{ 
                  backgroundImage: `url(${validateImageUrl(currentCoverImage)})` 
                }}
              ></div>
            ) : null}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 cursor-pointer">
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsCoverImageModalOpen(true)}
                className="text-white hover:bg-white/20 cursor-pointer"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 cursor-pointer">
                <MoreVertical className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-white hover:bg-white/20 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              {/* Status Dropdown */}
              <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-1.5 hover:bg-white/30 cursor-pointer transition-colors">
                <span className="text-sm font-medium">{task.status || 'To Do'}</span>
                <ChevronDown className="h-3 w-3" />
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
              {task.status === 'Done' && (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              )}
              {task.title}
            </h1>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border border-white/30 cursor-pointer">
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border border-white/30 cursor-pointer">
                <Tag className="h-3 w-3 mr-1" />
                Labels
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border border-white/30 cursor-pointer">
                <Calendar className="h-3 w-3 mr-1" />
                Dates
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowHeaderAddChecklist(true)}
                className="text-white hover:bg-white/20 border border-white/30 cursor-pointer transition-all duration-200 hover:scale-105"
                style={{ pointerEvents: 'auto', zIndex: 20, position: 'relative' }}
              >
                <CheckSquare className="h-3 w-3 mr-1" />
                Checklist
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 border border-white/30 cursor-pointer">
                <Users className="h-3 w-3 mr-1" />
                Members
              </Button>
            </div>
          </div>

          {/* Header Checklist Input Modal */}
          {showHeaderAddChecklist && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Checklist</h3>
                <input
                  type="text"
                  value={headerChecklistTitle}
                  onChange={(e) => setHeaderChecklistTitle(e.target.value)}
                  placeholder="Checklist title..."
                  className="w-full px-3 py-2 mb-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleHeaderAddChecklist();
                    }
                  }}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowHeaderAddChecklist(false);
                      setHeaderChecklistTitle('');
                    }}
                    className="px-4 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleHeaderAddChecklist}
                    disabled={!headerChecklistTitle.trim()}
                    className="px-4 py-2"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Description Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">Description</h2>
                {!isEditingDescription && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsEditingDescription(true)}
                    className="text-gray-600 hover:text-gray-800 cursor-pointer"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
              
              {isEditingDescription ? (
                <div className="space-y-2">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[120px] p-3 border rounded-md resize-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    placeholder="Add a more detailed description..."
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleSaveDescription}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditingDescription(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-700 space-y-2">
                  {description ? (
                    <div className="whitespace-pre-wrap">{description}</div>
                  ) : (
                    <div className="text-gray-500 italic">No description provided. Click Edit to add one.</div>
                  )}
                </div>
              )}
            </div>

            {/* Checklist Section */}
            <div ref={checklistRef} className="mb-8 relative" style={{ zIndex: 1 }}>
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Checklist</h2>
              <ChecklistComponent cardId={task.id} checklists={checklists} />
            </div>

            {/* Workflow Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Workflow</h2>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <p className="text-gray-700">User can register</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <p className="text-gray-700">User can login</p>
                </div>
              </div>
            </div>

            {/* Flow Register Section */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Flow Register</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">Registration flow details would go here...</p>
              </div>
            </div>

            {/* Attachments Section */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Attachments</h2>
                <div className="space-y-2">
                  {task.attachments.map((attachment: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                      <Paperclip className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{attachment.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l border-gray-200 bg-gray-50 flex flex-col">
          {/* Comments and Activity Section */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Comments and activity</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowActivityDetails(!showActivityDetails)}
                className="text-blue-600 hover:text-blue-700 text-xs cursor-pointer"
              >
                {showActivityDetails ? 'Hide details' : 'Show details'}
              </Button>
            </div>

            {/* Comment Input */}
            <div className="space-y-2">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full min-h-[80px] p-3 border rounded-md resize-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              />
              <Button 
                onClick={handleAddComment}
                disabled={!comment.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Send Comment
              </Button>
            </div>

            {/* Comments List */}
            {comments && comments.length > 0 && (
              <div className="mt-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Comments</h4>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                  {comments.map((comment: any) => (
                    <div key={comment.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {comment.user?.name || 'Unknown User'}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="flex-1 overflow-y-auto p-4">
            {showActivityDetails && (
              <div className="space-y-3">
                <div className="text-sm">
                  <div className="font-medium text-gray-800">Activity History</div>
                  <div className="mt-2 space-y-2">
                    <div className="p-2 bg-white rounded border">
                      <p className="text-xs text-gray-600">Task created</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                    <div className="p-2 bg-white rounded border">
                      <p className="text-xs text-gray-600">Status changed to Done</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cover Image Modal */}
      <CoverImageModal
        isOpen={isCoverImageModalOpen}
        onClose={() => setIsCoverImageModalOpen(false)}
        onCoverImageUpdate={handleCoverImageUpdate}
      />
    </div>
  );
};

// Cover Image Modal Component
const CoverImageModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCoverImageUpdate: (imageUrl: string) => void;
}> = ({ isOpen, onClose, onCoverImageUpdate }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'unsplash'>('upload');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [unsplashImages] = useState([
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1418075286574-14cf4f60b91b?w=800&h=400&fit=crop',
  ]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Convert image to base64 for persistence
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadFromDevice = () => {
    fileInputRef.current?.click();
  };

  const handleSaveCover = () => {
    if (selectedImage) {
      onCoverImageUpdate(selectedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Change Cover</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'upload'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Upload className="h-4 w-4 inline mr-2" />
            From Device
          </button>
          <button
            onClick={() => setActiveTab('unsplash')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'unsplash'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Search className="h-4 w-4 inline mr-2" />
            From Unsplash
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'upload' ? (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUploadFromDevice}
                  className="mb-4"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Image
                </Button>
                <p className="text-sm text-gray-500">
                  JPEG, PNG, GIF, WebP (max 5MB)
                </p>
              </div>

              {selectedImage && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Preview</h3>
                  <img
                    src={selectedImage}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {unsplashImages.map((image, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedImage(image)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === image
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Unsplash ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  </div>
                ))}
              </div>

              {selectedImage && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Preview</h3>
                  <img
                    src={selectedImage}
                    alt="Cover preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 flex justify-between flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCover}
            disabled={!selectedImage}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save Cover
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;

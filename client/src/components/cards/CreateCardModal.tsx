import React, { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { X, Plus, Calendar, Users, Tag, Paperclip } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { createCard } from '../../store/boardsSlice';
import { uploadAttachment, addLinkAttachment } from '../../services/attachmentService';

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
}

const CreateCardModal: React.FC<CreateCardModalProps> = ({ isOpen, onClose, listId }) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    console.log('Creating card:', { title, description, dueDate, listId, attachments: attachments.length });
    setIsLoading(true);
    try {
      const result = await dispatch(createCard({ 
        title, 
        description: description || undefined,
        dueDate: dueDate || undefined,
        listId 
      }));
      
      if (createCard.fulfilled.match(result)) {
        console.log('Card created successfully:', result.payload);
        const createdCard = result.payload;
        
        // Upload file attachments
        if (attachments.length > 0) {
          try {
            for (const file of attachments) {
              await uploadAttachment(createdCard.id, file);
            }
            console.log('All attachments uploaded successfully');
          } catch (attachmentError) {
            console.error('Failed to upload attachments:', attachmentError);
          }
        }
        
        // Add link attachment if provided
        if (linkName.trim() && linkUrl.trim()) {
          try {
            await addLinkAttachment(createdCard.id, linkName, linkUrl);
            console.log('Link attachment added successfully');
          } catch (linkError) {
            console.error('Failed to add link attachment:', linkError);
          }
        }
        
        onClose();
        setTitle('');
        setDescription('');
        setDueDate('');
        setAttachments([]);
        setLinkUrl('');
        setLinkName('');
        setShowAdvanced(false);
      } else {
        console.error('Create card failed:', result.error);
      }
    } catch (error) {
      console.error('Failed to create card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddLink = () => {
    if (linkUrl.trim() && linkName.trim()) {
      // For now, we'll handle links after card creation
      console.log('Link to add:', { name: linkName, url: linkUrl });
      setLinkUrl('');
      setLinkName('');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setTitle('');
      setDescription('');
      setDueDate('');
      setShowAdvanced(false);
      setAttachments([]);
      setLinkUrl('');
      setLinkName('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold">
            Create New Task
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title Section */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Task Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                disabled={isLoading}
                required
                className="resize-none"
                autoFocus
              />
            </div>
            
            {/* Description Section */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a more detailed description..."
                className="w-full min-h-[100px] p-3 border rounded-md resize-none text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-1">
                {/* Due Date */}
                <div className="relative">
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={isLoading}
                    className="w-0 h-0 p-0 opacity-0 absolute"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => (document.getElementById('dueDate') as HTMLInputElement)?.showPicker?.()}
                    disabled={isLoading}
                    className={`h-7 px-2 text-xs ${dueDate ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {dueDate ? 'Due Date Set' : 'Due Date'}
                  </Button>
                </div>

                <div className="h-4 w-px bg-gray-300"></div>

                {/* Members */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  className="h-7 px-2 text-xs text-gray-600 hover:bg-gray-200"
                >
                  <Users className="h-3 w-3 mr-1" />
                  Members
                </Button>

                <div className="h-4 w-px bg-gray-300"></div>

                {/* Labels */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  className="h-7 px-2 text-xs text-gray-600 hover:bg-gray-200"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  Labels
                </Button>

                <div className="h-4 w-px bg-gray-300"></div>

                {/* Attachments */}
                <div className="relative">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => fileInputRef.current?.click()}
                    className={`h-7 px-2 text-xs ${attachments.length > 0 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    <Paperclip className="h-3 w-3 mr-1" />
                    Attachment {attachments.length > 0 && `(${attachments.length})`}
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Advanced Options</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700"
                >
                  {showAdvanced ? 'Hide' : 'Show'}
                </Button>
              </div>

              {showAdvanced && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  {/* Attachments Section */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-600">Attachments</Label>
                    
                    {/* File Attachments */}
                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex items-center gap-2">
                              <Paperclip className="h-3 w-3 text-gray-500" />
                              <span className="text-xs truncate max-w-[200px]">{file.name}</span>
                              <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)}KB)</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFile(index)}
                              className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Link Attachment */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Link name..."
                        value={linkName}
                        onChange={(e) => setLinkName(e.target.value)}
                        className="text-xs"
                        disabled={isLoading}
                      />
                      <Input
                        placeholder="https://..."
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="text-xs flex-1"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddLink}
                        disabled={!linkName.trim() || !linkUrl.trim() || isLoading}
                        className="text-xs"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-600">Priority</Label>
                    <select className="w-full p-2 border rounded text-sm">
                      <option>No Priority</option>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-gray-600">Estimated Hours</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 2.5"
                      className="text-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !title.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCardModal;

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { X, Plus } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { createList } from '../../store/boardsSlice';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

const CreateListModal: React.FC<CreateListModalProps> = ({ isOpen, onClose, boardId }) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    console.log('Creating list with:', { title, boardId });
    setIsLoading(true);
    try {
      const result = await dispatch(createList({ title, boardId }));
      console.log('Create list result:', result);
      
      if (createList.fulfilled.match(result)) {
        console.log('List created successfully:', result.payload);
        onClose();
        setTitle('');
      } else {
        console.error('Create list failed:', result.error);
        // Optional: Show error message to user
      }
    } catch (error) {
      console.error('Failed to create list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setTitle('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New List
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">List Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter list title"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-3 pt-4">
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
                disabled={!title.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? 'Creating...' : 'Create List'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateListModal;

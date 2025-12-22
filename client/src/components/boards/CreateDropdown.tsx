import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Layout, ChevronRight } from 'lucide-react';

interface CreateDropdownProps {
  onCreateBoard: () => void;
  onStartWithTemplate: () => void;
}

const CreateDropdown: React.FC<CreateDropdownProps> = ({
  onCreateBoard,
  onStartWithTemplate
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateBoard = () => {
    setIsOpen(false);
    onCreateBoard();
  };

  const handleStartWithTemplate = () => {
    setIsOpen(false);
    onStartWithTemplate();
  };

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        variant="default"
      >
        <Plus className="h-4 w-4" />
        Create
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <Card className="absolute top-full mt-2 left-0 z-20 w-80 shadow-lg border">
            <CardContent className="p-2">
              <div className="space-y-1">
                {/* Create Board Option */}
                <button
                  onClick={handleCreateBoard}
                  className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-3 group"
                >
                  <div className="p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Create board</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      A board is made up of cards ordered on lists. Use it to manage projects, track information, or organize anything.
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>

                {/* Start with Template Option */}
                <button
                  onClick={handleStartWithTemplate}
                  className="w-full text-left p-3 rounded-lg hover:bg-accent transition-colors flex items-center gap-3 group"
                >
                  <div className="p-2 rounded-md bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                    <Layout className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Start with a template</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Get started faster with a board template.
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default CreateDropdown;

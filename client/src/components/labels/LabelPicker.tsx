import React, { useState } from 'react';
import { X, Tag } from 'lucide-react';
import { Button } from '../ui/button';

interface Label {
  id: string;
  name: string;
  color: string;
}

interface LabelPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLabelsChange: (labels: Label[]) => void;
  currentLabels: Label[];
}

// Predefined color labels for task priority levels
const predefinedLabels: Label[] = [
  // Priority Levels
  { id: 'urgent', name: 'Urgent', color: '#ef4444' }, // red
  { id: 'high', name: 'High Priority', color: '#f97316' }, // orange  
  { id: 'medium', name: 'Medium Priority', color: '#eab308' }, // yellow
  { id: 'low', name: 'Low Priority', color: '#22c55e' }, // green
  
  // Status Categories
  { id: 'bug', name: 'Bug', color: '#dc2626' }, // red
  { id: 'feature', name: 'Feature', color: '#7c3aed' }, // purple
  { id: 'enhancement', name: 'Enhancement', color: '#0891b2' }, // cyan
  
  // Task Types
  { id: 'backend', name: 'Backend', color: '#0ea5e9' }, // sky
  { id: 'frontend', name: 'Frontend', color: '#ec4899' }, // pink
  { id: 'design', name: 'Design', color: '#f43f5e' }, // rose
  { id: 'documentation', name: 'Documentation', color: '#64748b' }, // slate
  
  // Progress
  { id: 'in-progress', name: 'In Progress', color: '#3b82f6' }, // blue
  { id: 'review', name: 'Review', color: '#a855f7' }, // violet
  { id: 'testing', name: 'Testing', color: '#14b8a6' }, // teal
];

const LabelPicker: React.FC<LabelPickerProps> = ({ 
  isOpen, 
  onClose, 
  onLabelsChange, 
  currentLabels 
}) => {
  const [selectedLabels, setSelectedLabels] = useState<Label[]>(
    currentLabels || []
  );

  const handleLabelToggle = (label: Label) => {
    setSelectedLabels(prev => {
      const isSelected = prev.some(l => l.id === label.id);
      if (isSelected) {
        return prev.filter(l => l.id !== label.id);
      } else {
        return [...prev, label];
      }
    });
  };

  const handleSave = () => {
    onLabelsChange(selectedLabels);
    onClose();
  };

  const handleCancel = () => {
    setSelectedLabels(currentLabels || []);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Labels</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Selected Labels Preview */}
          {selectedLabels.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Selected Labels</h3>
              <div className="flex flex-wrap gap-2">
                {selectedLabels.map(label => (
                  <div
                    key={label.id}
                    className="px-3 py-1 rounded-full text-white text-sm font-medium flex items-center gap-1"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name}
                    <button
                      onClick={() => handleLabelToggle(label)}
                      className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Label Categories */}
          <div className="space-y-6">
            {/* Priority Labels */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Priority Levels</h3>
              <div className="grid grid-cols-2 gap-2">
                {predefinedLabels
                  .filter(label => ['urgent', 'high', 'medium', 'low'].includes(label.id))
                  .map(label => (
                    <LabelItem
                      key={label.id}
                      label={label}
                      isSelected={selectedLabels.some(l => l.id === label.id)}
                      onToggle={() => handleLabelToggle(label)}
                    />
                  ))}
              </div>
            </div>

            {/* Status Labels */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Status Categories</h3>
              <div className="grid grid-cols-2 gap-2">
                {predefinedLabels
                  .filter(label => ['bug', 'feature', 'enhancement'].includes(label.id))
                  .map(label => (
                    <LabelItem
                      key={label.id}
                      label={label}
                      isSelected={selectedLabels.some(l => l.id === label.id)}
                      onToggle={() => handleLabelToggle(label)}
                    />
                  ))}
              </div>
            </div>

            {/* Task Type Labels */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Task Types</h3>
              <div className="grid grid-cols-2 gap-2">
                {predefinedLabels
                  .filter(label => ['backend', 'frontend', 'design', 'documentation'].includes(label.id))
                  .map(label => (
                    <LabelItem
                      key={label.id}
                      label={label}
                      isSelected={selectedLabels.some(l => l.id === label.id)}
                      onToggle={() => handleLabelToggle(label)}
                    />
                  ))}
              </div>
            </div>

            {/* Progress Labels */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Progress Status</h3>
              <div className="grid grid-cols-2 gap-2">
                {predefinedLabels
                  .filter(label => ['in-progress', 'review', 'testing'].includes(label.id))
                  .map(label => (
                    <LabelItem
                      key={label.id}
                      label={label}
                      isSelected={selectedLabels.some(l => l.id === label.id)}
                      onToggle={() => handleLabelToggle(label)}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Labels
          </Button>
        </div>
      </div>
    </div>
  );
};

// Individual Label Item Component
const LabelItem: React.FC<{
  label: Label;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ label, isSelected, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`
        px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
        flex items-center gap-2 border-2
        ${isSelected
          ? 'border-gray-400 dark:border-gray-500 shadow-sm'
          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
        }
      `}
      style={{
        backgroundColor: isSelected ? label.color : 'transparent',
        color: isSelected ? 'white' : label.color
      }}
    >
      <div
        className="w-3 h-3 rounded-full border-2"
        style={{
          backgroundColor: label.color,
          borderColor: isSelected ? 'white' : label.color
        }}
      />
      {label.name}
    </button>
  );
};

export default LabelPicker;

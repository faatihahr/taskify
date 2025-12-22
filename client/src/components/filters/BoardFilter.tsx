import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Filter, Calendar, Tag, Clock, CheckCircle, ChevronDown, X } from 'lucide-react';

export type FilterType = 'dueDate' | 'labels' | 'activity' | 'status' | null;
export type DueDateFilter = 'nearest' | 'farthest' | null;
export type StatusFilter = 'completed' | 'notCompleted' | null;

interface BoardFilterProps {
  onFilterChange: (filters: {
    type: FilterType;
    dueDate: DueDateFilter;
    labels: string[];
    activity: 'recent' | 'oldest' | null;
    status: StatusFilter;
  }) => void;
  availableLabels: Array<{ id: string; name: string; color: string }>;
}

const BoardFilter: React.FC<BoardFilterProps> = ({ onFilterChange, availableLabels }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [activityFilter, setActivityFilter] = useState<'recent' | 'oldest' | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(null);

  const handleFilterTypeSelect = (type: FilterType) => {
    setActiveFilter(type);
  };

  const handleDueDateFilter = (filter: DueDateFilter) => {
    setDueDateFilter(filter);
    applyFilters({
      type: 'dueDate',
      dueDate: filter,
      labels: selectedLabels,
      activity: activityFilter,
      status: statusFilter
    });
  };

  const handleLabelToggle = (labelId: string) => {
    const newLabels = selectedLabels.includes(labelId)
      ? selectedLabels.filter(id => id !== labelId)
      : [...selectedLabels, labelId];
    
    setSelectedLabels(newLabels);
    applyFilters({
      type: newLabels.length > 0 ? 'labels' : null,
      dueDate: dueDateFilter,
      labels: newLabels,
      activity: activityFilter,
      status: statusFilter
    });
  };

  const handleActivityFilter = (filter: 'recent' | 'oldest') => {
    setActivityFilter(filter);
    applyFilters({
      type: 'activity',
      dueDate: dueDateFilter,
      labels: selectedLabels,
      activity: filter,
      status: statusFilter
    });
  };

  const handleStatusFilter = (filter: StatusFilter) => {
    setStatusFilter(filter);
    applyFilters({
      type: 'status',
      dueDate: dueDateFilter,
      labels: selectedLabels,
      activity: activityFilter,
      status: filter
    });
  };

  const applyFilters = (filters: {
    type: FilterType;
    dueDate: DueDateFilter;
    labels: string[];
    activity: 'recent' | 'oldest' | null;
    status: StatusFilter;
  }) => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const clearAllFilters = () => {
    setDueDateFilter(null);
    setSelectedLabels([]);
    setActivityFilter(null);
    setStatusFilter(null);
    setActiveFilter(null);
    onFilterChange({
      type: null,
      dueDate: null,
      labels: [],
      activity: null,
      status: null
    });
    setIsOpen(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (dueDateFilter) count++;
    if (selectedLabels.length > 0) count++;
    if (activityFilter) count++;
    if (statusFilter) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="relative">
      {/* Filter Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 ${activeFilterCount > 0 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'text-gray-600 hover:bg-gray-100'}`}
      >
        <Filter className="h-4 w-4" />
        <span className="hidden sm:inline">Filter</span>
        {activeFilterCount > 0 && (
          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Filter Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filter Tasks</h3>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Clear All
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filter Options */}
          <div className="p-4 space-y-4">
            {/* Due Date Filter */}
            <div>
              <button
                onClick={() => handleFilterTypeSelect(activeFilter === 'dueDate' ? null : 'dueDate')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <Calendar className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">Due Date</div>
                  {dueDateFilter && (
                    <div className="text-sm text-gray-500">
                      {dueDateFilter === 'nearest' ? 'Terdekat' : 'Terlama'}
                    </div>
                  )}
                </div>
                {activeFilter === 'dueDate' && <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              {activeFilter === 'dueDate' && (
                <div className="ml-7 mt-2 space-y-1">
                  <button
                    onClick={() => handleDueDateFilter('nearest')}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      dueDateFilter === 'nearest' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    Terdekat
                  </button>
                  <button
                    onClick={() => handleDueDateFilter('farthest')}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      dueDateFilter === 'farthest' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    Terlama
                  </button>
                </div>
              )}
            </div>

            {/* Labels Filter */}
            <div>
              <button
                onClick={() => handleFilterTypeSelect(activeFilter === 'labels' ? null : 'labels')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <Tag className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">Labels</div>
                  {selectedLabels.length > 0 && (
                    <div className="text-sm text-gray-500">
                      {selectedLabels.length} label(s) selected
                    </div>
                  )}
                </div>
                {activeFilter === 'labels' && <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              {activeFilter === 'labels' && (
                <div className="ml-7 mt-2 space-y-1 max-h-32 overflow-y-auto">
                  {availableLabels.length === 0 ? (
                    <div className="text-sm text-gray-500 px-3 py-2">No labels available</div>
                  ) : (
                    availableLabels.map((label) => (
                      <button
                        key={label.id}
                        onClick={() => handleLabelToggle(label.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm ${
                          selectedLabels.includes(label.id)
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        {label.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Recent Activity Filter */}
            <div>
              <button
                onClick={() => handleFilterTypeSelect(activeFilter === 'activity' ? null : 'activity')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <Clock className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">Recent Activity</div>
                  {activityFilter && (
                    <div className="text-sm text-gray-500">
                      {activityFilter === 'recent' ? 'Most Recent' : 'Oldest'}
                    </div>
                  )}
                </div>
                {activeFilter === 'activity' && <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              {activeFilter === 'activity' && (
                <div className="ml-7 mt-2 space-y-1">
                  <button
                    onClick={() => handleActivityFilter('recent')}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      activityFilter === 'recent' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    Most Recent
                  </button>
                  <button
                    onClick={() => handleActivityFilter('oldest')}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      activityFilter === 'oldest' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    Oldest
                  </button>
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div>
              <button
                onClick={() => handleFilterTypeSelect(activeFilter === 'status' ? null : 'status')}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <CheckCircle className="h-4 w-4 text-gray-500" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">Status</div>
                  {statusFilter && (
                    <div className="text-sm text-gray-500">
                      {statusFilter === 'completed' ? 'Completed' : 'Not Completed'}
                    </div>
                  )}
                </div>
                {activeFilter === 'status' && <ChevronDown className="h-4 w-4 text-gray-400" />}
              </button>

              {activeFilter === 'status' && (
                <div className="ml-7 mt-2 space-y-1">
                  <button
                    onClick={() => handleStatusFilter('completed')}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      statusFilter === 'completed' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    Mark as Completed
                  </button>
                  <button
                    onClick={() => handleStatusFilter('notCompleted')}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      statusFilter === 'notCompleted' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    Not Marked as Completed
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardFilter;

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Filter,
  X,
  ChevronDown,
  Search,
  Users,
  Tag,
  Calendar,
  Activity,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type {
  FilterOptions,
  DueDateFilterType,
  ActivityFilterType,
} from '../../utils/filterUtils';

interface TaskFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  availableMembers: Array<{ id: string; name: string }>;
  availableLabels: Array<{ id: string; name: string; color: string }>;
}

type ExpandedSection = 'search' | 'members' | 'labels' | 'dueDate' | 'activity' | null;

const TaskFilter: React.FC<TaskFilterProps> = ({
  onFilterChange,
  availableMembers,
  availableLabels,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);

  // Filter states
  const [searchText, setSearchText] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilterType>(null);
  const [activityFilter, setActivityFilter] = useState<ActivityFilterType>(null);

  // Track button position when dropdown opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchText.trim()) count++;
    if (selectedMembers.length > 0) count++;
    if (selectedLabels.length > 0) count++;
    if (dueDateFilter) count++;
    if (activityFilter) count++;
    return count;
  }, [searchText, selectedMembers, selectedLabels, dueDateFilter, activityFilter]);

  // Trigger filter change
  const applyFilters = (
    search: string = searchText,
    members: string[] = selectedMembers,
    labels: string[] = selectedLabels,
    dueDate: DueDateFilterType = dueDateFilter,
    activity: ActivityFilterType = activityFilter
  ) => {
    onFilterChange({
      search,
      members,
      labels,
      dueDateFilter: dueDate,
      activityFilter: activity,
    });
  };

  // Search handler
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    setSearchText(newSearch);
    applyFilters(newSearch);
  };

  // Member toggle handler
  const handleMemberToggle = (memberId: string) => {
    const newMembers = selectedMembers.includes(memberId)
      ? selectedMembers.filter(id => id !== memberId)
      : [...selectedMembers, memberId];
    setSelectedMembers(newMembers);
    applyFilters(searchText, newMembers);
  };

  // Label toggle handler
  const handleLabelToggle = (labelId: string) => {
    const newLabels = selectedLabels.includes(labelId)
      ? selectedLabels.filter(id => id !== labelId)
      : [...selectedLabels, labelId];
    setSelectedLabels(newLabels);
    applyFilters(searchText, selectedMembers, newLabels);
  };

  // Due date filter handler
  const handleDueDateFilter = (filter: DueDateFilterType) => {
    const newFilter = dueDateFilter === filter ? null : filter;
    setDueDateFilter(newFilter);
    applyFilters(searchText, selectedMembers, selectedLabels, newFilter);
  };

  // Activity filter handler
  const handleActivityFilter = (filter: ActivityFilterType) => {
    const newFilter = activityFilter === filter ? null : filter;
    setActivityFilter(newFilter);
    applyFilters(searchText, selectedMembers, selectedLabels, dueDateFilter, newFilter);
  };

  // Clear all filters
  const handleClearAll = () => {
    setSearchText('');
    setSelectedMembers([]);
    setSelectedLabels([]);
    setDueDateFilter(null);
    setActivityFilter(null);
    setExpandedSection(null);
    onFilterChange({
      search: '',
      members: [],
      labels: [],
      dueDateFilter: null,
      activityFilter: null,
    });
  };

  const dueDateOptions = [
    { label: 'Overdue', value: 'overdue' as const, icon: AlertCircle },
    { label: 'Due Today', value: 'today' as const, icon: Calendar },
    { label: 'Due Tomorrow', value: 'tomorrow' as const, icon: Calendar },
    { label: 'Due This Week', value: 'this-week' as const, icon: Calendar },
    { label: 'Due Next Week', value: 'next-week' as const, icon: Calendar },
    { label: 'Due This Month', value: 'this-month' as const, icon: Calendar },
    { label: 'Due Next Month', value: 'next-month' as const, icon: Calendar },
  ];

  const activityOptions = [
    { label: 'Recently (Last 3 Days)', value: 'recently' as const },
    { label: 'Last Week', value: 'last-week' as const },
    { label: 'Last Two Weeks', value: 'last-two-weeks' as const },
  ];

  const toggleSection = (section: ExpandedSection) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="relative">
      {/* Filter Button */}
      <Button
        ref={buttonRef}
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 transition-colors ${
          activeFilterCount > 0
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/70'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
        }`}
      >
        <Filter className="h-4 w-4" />
        <span className="hidden sm:inline text-sm font-medium">Filter</span>
        {activeFilterCount > 0 && (
          <span className="bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-0.5 dark:bg-blue-500">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {/* Filter Dropdown Panel - Using Portal for proper positioning */}
      {isOpen && buttonRect && createPortal(
        <>
          {/* Backdrop to close on click outside */}
          <div 
            className="fixed inset-0 z-[9998]"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div 
            className="fixed w-96 max-h-[600px] overflow-y-auto bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-[9999]"
            style={{
              top: `${buttonRect.bottom + 8}px`,
              right: `${window.innerWidth - buttonRect.right}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter Tasks
            </h3>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-2"
                >
                  Clear All
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filter Content */}
          <div className="p-4 space-y-3">
            {/* Search Filter */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Search className="h-4 w-4" />
                Search Keywords
              </label>
              <Input
                type="text"
                placeholder="Search by title or description..."
                value={searchText}
                onChange={handleSearchChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>

            {/* Members Filter */}
            <div className="space-y-2">
              <button
                onClick={() => toggleSection('members')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                  <Users className="h-4 w-4" />
                  Assigned To
                  {selectedMembers.length > 0 && (
                    <span className="ml-auto text-xs font-bold text-blue-600 dark:text-blue-400">
                      {selectedMembers.length}
                    </span>
                  )}
                </label>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                    expandedSection === 'members' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedSection === 'members' && (
                <div className="ml-4 space-y-2 max-h-40 overflow-y-auto">
                  {availableMembers.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
                      No members available
                    </div>
                  ) : (
                    availableMembers.map(member => (
                      <label
                        key={member.id}
                        className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(member.id)}
                          onChange={() => handleMemberToggle(member.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {member.name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Labels Filter */}
            <div className="space-y-2">
              <button
                onClick={() => toggleSection('labels')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                  <Tag className="h-4 w-4" />
                  Labels
                  {selectedLabels.length > 0 && (
                    <span className="ml-auto text-xs font-bold text-blue-600 dark:text-blue-400">
                      {selectedLabels.length}
                    </span>
                  )}
                </label>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                    expandedSection === 'labels' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedSection === 'labels' && (
                <div className="ml-4 space-y-2 max-h-40 overflow-y-auto">
                  {availableLabels.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400 py-2">
                      No labels available
                    </div>
                  ) : (
                    availableLabels.map(label => (
                      <label
                        key={label.id}
                        className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedLabels.includes(label.id)}
                          onChange={() => handleLabelToggle(label.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                        />
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: label.color }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {label.name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Due Date Filter */}
            <div className="space-y-2">
              <button
                onClick={() => toggleSection('dueDate')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                  <Calendar className="h-4 w-4" />
                  Due Date
                  {dueDateFilter && (
                    <span className="ml-auto text-xs font-bold text-blue-600 dark:text-blue-400">
                      1
                    </span>
                  )}
                </label>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                    expandedSection === 'dueDate' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedSection === 'dueDate' && (
                <div className="ml-4 space-y-2">
                  {dueDateOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleDueDateFilter(option.value)}
                      className={`w-full flex items-center gap-2 p-2 rounded text-sm transition-colors ${
                        dueDateFilter === option.value
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Activity Filter */}
            <div className="space-y-2">
              <button
                onClick={() => toggleSection('activity')}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer flex-1">
                  <Activity className="h-4 w-4" />
                  Activity
                  {activityFilter && (
                    <span className="ml-auto text-xs font-bold text-blue-600 dark:text-blue-400">
                      1
                    </span>
                  )}
                </label>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                    expandedSection === 'activity' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedSection === 'activity' && (
                <div className="ml-4 space-y-2">
                  {activityOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => handleActivityFilter(option.value)}
                      className={`w-full flex items-center gap-2 p-2 rounded text-sm transition-colors text-left ${
                        activityFilter === option.value
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default TaskFilter;

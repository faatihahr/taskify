/**
 * Helper function to get start of day (midnight)
 */
const getStartOfDay = (date: Date = new Date()): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Helper function to get end of day (23:59:59)
 */
const getEndOfDay = (date: Date = new Date()): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Helper function to get start of week (Sunday)
 */
const getStartOfWeek = (date: Date = new Date()): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return getStartOfDay(new Date(d.setDate(diff)));
};

/**
 * Helper function to get end of week (Saturday)
 */
const getEndOfWeek = (date: Date = new Date()): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + 6;
  return getEndOfDay(new Date(d.setDate(diff)));
};

/**
 * Helper function to subtract days from a date
 */
const subtractDays = (date: Date, days: number): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() - days);
  return d;
};

/**
 * Helper function to subtract weeks from a date
 */
const subtractWeeks = (date: Date, weeks: number): Date => {
  return subtractDays(date, weeks * 7);
};

export interface FilterOptions {
  search: string;
  members: string[]; // User IDs
  labels: string[]; // Label IDs
  dueDateFilter: DueDateFilterType;
  activityFilter: ActivityFilterType;
}

export type DueDateFilterType = 'overdue' | 'today' | 'tomorrow' | 'this-week' | 'next-week' | 'this-month' | 'next-month' | null;
export type ActivityFilterType = 'last-week' | 'last-two-weeks' | 'recently' | null;

interface Card {
  id: string;
  title: string;
  description?: string;
  dueDate?: string | Date;
  labels?: Array<{ id: string; name: string; color: string }>;
  creator?: { id: string; name: string };
  createdAt?: string | Date;
  updatedAt?: string | Date;
  activities?: Array<{ createdAt: string | Date; userId: string }>;
}

/**
 * Check if task matches search keywords
 */
export const matchesSearch = (card: Card, searchText: string): boolean => {
  if (!searchText.trim()) return true;
  
  const search = searchText.toLowerCase();
  
  // Search in title
  if (card.title.toLowerCase().includes(search)) return true;
  
  // Search in description
  if (card.description?.toLowerCase().includes(search)) return true;
  
  return false;
};

/**
 * Check if task is assigned to any of the selected members
 */
export const matchesMembers = (card: Card, selectedMembers: string[]): boolean => {
  if (selectedMembers.length === 0) return true;
  
  // Assuming card has a creator or assignees
  // If no assignee info, check if creator is in selected members
  if (card.creator && selectedMembers.includes(card.creator.id)) {
    return true;
  }
  
  return false;
};

/**
 * Check if task has any of the selected labels
 */
export const matchesLabels = (card: Card, selectedLabels: string[]): boolean => {
  if (selectedLabels.length === 0) return true;
  
  if (!card.labels || card.labels.length === 0) return false;
  
  return card.labels.some(label => selectedLabels.includes(label.id));
};

/**
 * Check if task due date matches the filter
 */
export const matchesDueDate = (card: Card, dueDateFilter: DueDateFilterType): boolean => {
  if (!dueDateFilter) return true;
  
  const dueDate = card.dueDate ? new Date(card.dueDate) : null;
  if (!dueDate) {
    // If no due date is set, only show if filter is looking for no due date
    return false;
  }
  
  const today = getStartOfDay();
  const tomorrow = getStartOfDay(new Date(new Date().setDate(new Date().getDate() + 1)));
  const weekStart = getStartOfWeek();
  const weekEnd = getEndOfWeek();
  const nextWeekStart = getStartOfWeek(new Date(new Date().setDate(new Date().getDate() + 7)));
  const nextWeekEnd = getEndOfWeek(new Date(new Date().setDate(new Date().getDate() + 7)));
  const nextMonthStart = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
  const nextMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0);
  
  const dueDateNormalized = getStartOfDay(dueDate);
  
  switch (dueDateFilter) {
    case 'overdue':
      return dueDateNormalized < today;
    
    case 'today':
      return dueDateNormalized.getTime() === today.getTime();
    
    case 'tomorrow':
      return dueDateNormalized.getTime() === tomorrow.getTime();
    
    case 'this-week':
      return dueDateNormalized >= weekStart && dueDateNormalized <= weekEnd && dueDateNormalized >= today;
    
    case 'next-week':
      return dueDateNormalized >= nextWeekStart && dueDateNormalized <= nextWeekEnd;
    
    case 'this-month':
      return dueDateNormalized.getMonth() === new Date().getMonth() && 
             dueDateNormalized.getFullYear() === new Date().getFullYear() &&
             dueDateNormalized >= today;
    
    case 'next-month':
      return dueDateNormalized >= nextMonthStart && dueDateNormalized <= nextMonthEnd;
    
    default:
      return true;
  }
};

/**
 * Check if task matches activity filter
 */
export const matchesActivity = (card: Card, activityFilter: ActivityFilterType): boolean => {
  if (!activityFilter) return true;
  
  const updateDate = card.updatedAt ? new Date(card.updatedAt) : null;
  if (!updateDate) return false;
  
  const now = new Date();
  const oneWeekAgo = subtractWeeks(now, 1);
  const twoWeeksAgo = subtractWeeks(now, 2);
  const threeDaysAgo = subtractDays(now, 3);
  
  switch (activityFilter) {
    case 'last-week':
      return updateDate >= oneWeekAgo;
    
    case 'last-two-weeks':
      return updateDate >= twoWeeksAgo;
    
    case 'recently':
      return updateDate >= threeDaysAgo;
    
    default:
      return true;
  }
};

/**
 * Apply all filters to cards
 */
export const filterCards = (
  cards: Card[],
  filters: FilterOptions
): Card[] => {
  return cards.filter(card => {
    return (
      matchesSearch(card, filters.search) &&
      matchesMembers(card, filters.members) &&
      matchesLabels(card, filters.labels) &&
      matchesDueDate(card, filters.dueDateFilter) &&
      matchesActivity(card, filters.activityFilter)
    );
  });
};

/**
 * Get all unique members from cards
 */
export const getAllMembers = (cards: Card[]): Array<{ id: string; name: string }> => {
  const membersMap = new Map<string, { id: string; name: string }>();
  
  cards.forEach(card => {
    if (card.creator) {
      membersMap.set(card.creator.id, { id: card.creator.id, name: card.creator.name });
    }
  });
  
  return Array.from(membersMap.values());
};

/**
 * Get all unique labels from cards
 */
export const getAllLabels = (
  cards: Card[]
): Array<{ id: string; name: string; color: string }> => {
  const labelsMap = new Map<string, { id: string; name: string; color: string }>();
  
  cards.forEach(card => {
    card.labels?.forEach(label => {
      if (!labelsMap.has(label.id)) {
        labelsMap.set(label.id, { id: label.id, name: label.name, color: label.color });
      }
    });
  });
  
  return Array.from(labelsMap.values());
};

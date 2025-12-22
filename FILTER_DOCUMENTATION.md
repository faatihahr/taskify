# Task Filter Documentation

## Overview

Fitur filter komprehensif telah ditambahkan ke halaman Board untuk memungkinkan pengguna memfilter tasks berdasarkan berbagai kriteria. Filter ini membantu pengguna menemukan tasks spesifik dengan cepat dari daftar yang panjang.

## Features

### 1. **Search by Keywords** 🔍
Cari tasks berdasarkan kata kunci di title atau description.
- **Input**: Text search
- **Scope**: Searches in task title and description
- **Real-time**: Filter diterapkan secara real-time saat mengetik
- **Case-insensitive**: Pencarian tidak memperhatikan huruf besar/kecil

### 2. **Filter by Members** 👥
Filter tasks yang di-assign kepada anggota tim tertentu.
- **Input**: Checkbox selection (multiple members bisa dipilih)
- **Available Members**: Diambil dari semua creator tasks di board
- **Multiple Selection**: Bisa memilih lebih dari satu member sekaligus
- **Display**: Shows count of selected members

### 3. **Filter by Labels** 🏷️
Filter tasks berdasarkan label (tag) yang diberikan.
- **Input**: Checkbox selection (multiple labels bisa dipilih)
- **Label Info**: Menampilkan nama label dengan color dot indicator
- **Multiple Selection**: Bisa memilih lebih dari satu label
- **Display**: Shows count of selected labels
- **Color Coded**: Setiap label ditampilkan dengan warna aslinya

### 4. **Filter by Due Date** 📅
Filter tasks berdasarkan due date (tanggal deadline).

#### Due Date Options:
- **Overdue** ⚠️: Tasks yang sudah melewati deadline
- **Due Today** 📌: Tasks dengan deadline hari ini
- **Due Tomorrow** ➡️: Tasks dengan deadline besok
- **Due This Week** 📆: Tasks dengan deadline minggu ini (setelah hari ini)
- **Due Next Week** ⏭️: Tasks dengan deadline minggu depan
- **Due This Month** 📊: Tasks dengan deadline bulan ini (setelah hari ini)
- **Due Next Month** 📈: Tasks dengan deadline bulan depan

**Note**: Hanya satu due date filter yang bisa dipilih sekaligus (single selection)

### 5. **Filter by Activity** 🕐
Filter tasks berdasarkan waktu terakhir kali di-update/diubah.

#### Activity Options:
- **Recently (Last 3 Days)** 🔥: Tasks yang di-update dalam 3 hari terakhir
- **Last Week** 📅: Tasks yang di-updated dalam 1 minggu terakhir
- **Last Two Weeks** 📆: Tasks yang di-updated dalam 2 minggu terakhir

**Note**: Hanya satu activity filter yang bisa dipilih sekaligus (single selection)

## UI Components

### TaskFilter Component
Location: `src/components/filters/TaskFilter.tsx`

**Props:**
```typescript
interface TaskFilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  availableMembers: Array<{ id: string; name: string }>;
  availableLabels: Array<{ id: string; name: string; color: string }>;
}
```

**Features:**
- Expandable sections untuk setiap filter type
- Active filter counter badge
- Clear All button untuk reset semua filters
- Responsive design (works on mobile & desktop)
- Dark mode support

### Filter Button
- Menampilkan icon filter dan text "Filter"
- Shows badge dengan jumlah active filters (jika ada)
- Toggle dropdown dengan chevron icon animasi

### Filter Panel
- Dropdown panel dengan sticky header
- Max height dengan scroll untuk list yang panjang
- Header dengan title, Clear All button, dan close button
- Multiple expandable sections untuk setiap filter type

## Utility Functions

Location: `src/utils/filterUtils.ts`

### Types
```typescript
export type FilterOptions = {
  search: string;
  members: string[];
  labels: string[];
  dueDateFilter: DueDateFilterType | null;
  activityFilter: ActivityFilterType | null;
};

export type DueDateFilterType = 
  | 'overdue' | 'today' | 'tomorrow' 
  | 'this-week' | 'next-week' 
  | 'this-month' | 'next-month' | null;

export type ActivityFilterType = 
  | 'last-week' | 'last-two-weeks' | 'recently' | null;
```

### Functions

#### `filterCards(cards: Card[], filters: FilterOptions): Card[]`
Menerapkan semua filters ke array of cards dan mengembalikan filtered results.

**Logic**: Cards harus match SEMUA active filters (AND operation)

#### `matchesSearch(card: Card, searchText: string): boolean`
Check apakah card title atau description cocok dengan search keywords.

#### `matchesMembers(card: Card, selectedMembers: string[]): boolean`
Check apakah card creator ada di dalam selected members list.

#### `matchesLabels(card: Card, selectedLabels: string[]): boolean`
Check apakah card memiliki minimal satu dari selected labels.

#### `matchesDueDate(card: Card, dueDateFilter: DueDateFilterType): boolean`
Check apakah card due date match dengan selected due date filter.

#### `matchesActivity(card: Card, activityFilter: ActivityFilterType): boolean`
Check apakah card last update date match dengan selected activity filter.

#### `getAllMembers(cards: Card[]): Array<{ id: string; name: string }>`
Extract unique members dari semua cards.

#### `getAllLabels(cards: Card[]): Array<{ id: string; name: string; color: string }>`
Extract unique labels dari semua cards dengan color information.

## Integration with BoardPage

Location: `src/pages/BoardPage.tsx`

### Changes Made:
1. **Imports**: Added TaskFilter component dan filter utilities
2. **State**: Added `filters` state untuk track active filters
3. **Computed Values**:
   - `allCards`: Flat array dari semua cards di board
   - `availableMembers`: Unique members dari allCards
   - `availableLabels`: Unique labels dari allCards
   - `filteredListsData`: Lists dengan filtered cards
4. **Event Handlers**:
   - `handleFilterChange()`: Update filters state saat user mengubah filter
5. **UI Changes**:
   - Menambahkan TaskFilter component di board header
   - Mengganti `currentBoard.lists` dengan `filteredListsData` saat render

### Filter Flow:
1. User mengubah filter di TaskFilter component
2. `handleFilterChange()` dipanggil dengan new filters
3. State `filters` di-update
4. `filteredListsData` computed value di-recalculate (melalui useMemo)
5. UI di-update untuk menampilkan hanya filtered tasks

## Date Helper Functions

Location: `src/utils/filterUtils.ts`

Menggunakan native JavaScript Date API (tanpa external library):

- `getStartOfDay(date)`: Set time ke 00:00:00
- `getEndOfDay(date)`: Set time ke 23:59:59
- `getStartOfWeek(date)`: Get Sunday of the week
- `getEndOfWeek(date)`: Get Saturday of the week
- `subtractDays(date, days)`: Subtract days dari date
- `subtractWeeks(date, weeks)`: Subtract weeks dari date

## Styling & Theming

### Color Scheme:
- **Active State**: Blue background (#3b82f6) with blue text
- **Hover State**: Light gray background (#f3f4f6)
- **Dark Mode**: Supported dengan Tailwind's dark: prefix
- **Badge**: Blue (#1e40af) dengan white text

### Responsive Design:
- Mobile-first approach
- Dropdown panel width: 384px (w-96)
- Max height: 600px dengan overflow scroll
- Responsive padding dan font sizes

### Icons Used:
- **Filter**: lucide-react Filter icon
- **Search**: lucide-react Search icon
- **Members**: lucide-react Users icon
- **Labels**: lucide-react Tag icon
- **Due Date**: lucide-react Calendar icon
- **Activity**: lucide-react Activity icon
- **Chevron**: lucide-react ChevronDown (dengan rotation saat expanded)

## Usage Example

```tsx
// BoardPage.tsx
const [filters, setFilters] = useState<FilterOptions>({
  search: '',
  members: [],
  labels: [],
  dueDateFilter: null,
  activityFilter: null,
});

const availableMembers = useMemo(() => getAllMembers(allCards), [allCards]);
const availableLabels = useMemo(() => getAllLabels(allCards), [allCards]);

const filteredListsData = useMemo(() => {
  if (!currentBoard) return [];
  
  return currentBoard.lists.map(list => ({
    ...list,
    cards: filterCards(list.cards, filters),
  }));
}, [currentBoard, filters]);

// In JSX:
<TaskFilter
  onFilterChange={handleFilterChange}
  availableMembers={availableMembers}
  availableLabels={availableLabels}
/>

// Render filtered lists:
{filteredListsData.map((list) => (
  // render list with filtered cards
))}
```

## Performance Considerations

1. **Memoization**: 
   - `useMemo` untuk `allCards`, `availableMembers`, `availableLabels`, `filteredListsData`
   - Prevents unnecessary recalculations

2. **Filter Efficiency**:
   - Filters applied dengan single pass melalui cards array
   - Short-circuit evaluation untuk early exit

3. **Responsive Updates**:
   - Real-time filtering saat user mengetik search atau mengubah filter
   - No API calls diperlukan (client-side filtering)

## Browser Support

- Modern browsers dengan ES6+ support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

1. **Filter Persistence**: Save active filters ke localStorage
2. **Saved Filters**: Allow users untuk save dan reuse filter combinations
3. **Advanced Search**: Syntax-based search (e.g., "label:bug assigned:john")
4. **Filter History**: Quick access ke recently used filters
5. **Filter Analytics**: Show count of matching tasks per filter option
6. **Assignee Filter**: Filter by multiple assignees (not just creator)
7. **Status Filter**: Filter by completion status (completed/pending)
8. **Custom Date Range**: Allow users untuk select custom date ranges
9. **Filter Export**: Export filtered task list as CSV/PDF

## Troubleshooting

### Filter not working?
1. Check if FilterOptions interface matches expected props
2. Verify filterCards() is called with correct card data
3. Ensure availableMembers/Labels are populated correctly

### Performance issues?
1. Check if useMemo dependencies are correct
2. Verify filter functions aren't called too frequently
3. Consider pagination for large task lists

### Styling issues?
1. Verify Tailwind CSS classes are correctly spelled
2. Check if dark mode is properly configured
3. Ensure shrink-0 class is available in Tailwind version

## File Structure

```
client/
├── src/
│   ├── components/
│   │   └── filters/
│   │       └── TaskFilter.tsx          (Filter UI Component)
│   ├── pages/
│   │   └── BoardPage.tsx               (Integrated with filter)
│   └── utils/
│       └── filterUtils.ts              (Filter logic & helpers)
└── FILTER_DOCUMENTATION.md             (This file)
```

## API Integration Notes

- Filtering dilakukan client-side (tidak memerlukan API call)
- Data diambil dari Redux store (currentBoard state)
- Tidak ada backend changes diperlukan

## Testing Recommendations

1. **Unit Tests**: Test individual filter functions
2. **Integration Tests**: Test filter state updates
3. **E2E Tests**: Test complete filter workflows
4. **Performance Tests**: Test dengan large dataset (1000+ tasks)

---

**Version**: 1.0  
**Last Updated**: December 22, 2025  
**Author**: GitHub Copilot

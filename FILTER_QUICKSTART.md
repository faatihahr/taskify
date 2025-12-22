# Filter Feature - Quick Reference Guide

## 📍 Location in App
**Page**: Board Details (`/boards/:id`)  
**Component**: In the header, right side next to "Add List" button

## 🎯 What It Does
Filters tasks pada board berdasarkan:
- Search keywords
- Assigned members  
- Labels/Tags
- Due dates
- Activity/Last updated

## 🖱️ How to Use

### Opening Filter
1. Go to any board detail page
2. Click "Filter" button di header

### Searching by Keywords
1. Click Filter button
2. Type in "Search Keywords" input field
3. Results update automatically as you type

### Filtering by Members
1. Expand "Assigned To" section
2. Check members yang ingin di-filter
3. Bisa select multiple members
4. Tasks ditampilkan hanya jika assigned ke salah satu member

### Filtering by Labels
1. Expand "Labels" section
2. Check labels yang ingin di-filter
3. Bisa select multiple labels
4. Tasks ditampilkan hanya jika punya salah satu label

### Filtering by Due Date
1. Expand "Due Date" section
2. Click salah satu pilihan:
   - **Overdue**: Tasks dengan deadline yang sudah berlalu
   - **Due Today**: Deadline hari ini
   - **Due Tomorrow**: Deadline besok
   - **Due This Week**: Deadline minggu ini (setelah hari ini)
   - **Due Next Week**: Deadline minggu depan
   - **Due This Month**: Deadline bulan ini (setelah hari ini)
   - **Due Next Month**: Deadline bulan depan

### Filtering by Activity
1. Expand "Activity" section
2. Click salah satu pilihan:
   - **Recently**: Updated dalam 3 hari terakhir
   - **Last Week**: Updated dalam seminggu terakhir
   - **Last Two Weeks**: Updated dalam 2 minggu terakhir

### Combining Filters
- Bisa combine semua filter sekaligus
- Semakin banyak filter = hasil semakin spesifik
- Semua filter harus terpenuhi (AND operation)

### Clearing Filters
- **Clear Individual**: Click filter option sekali lagi untuk deselect
- **Clear All**: Click "Clear All" button di filter panel header

## 📊 Filter Combinations

### Example 1: Find Overdue Bugs
1. Search: Leave empty
2. Labels: Select "Bug"
3. Due Date: Select "Overdue"
4. Result: Show all bug labels yang overdue

### Example 2: Tasks Assigned to John (Recently Updated)
1. Members: Select "John"
2. Activity: Select "Recently"
3. Result: Show John's tasks updated dalam 3 hari terakhir

### Example 3: Search "Database" with Specific Labels
1. Search: "Database"
2. Labels: Select "Backend" + "Database"
3. Result: Show tasks dengan "Database" dalam title/desc yang punya label Backend atau Database

## 🎨 UI Elements

| Element | Description |
|---------|-------------|
| Filter Button | Main button dengan icon + badge |
| Badge | Shows number of active filters |
| Filter Panel | Dropdown dengan all filter options |
| Section Header | Click untuk expand/collapse each filter type |
| Checkbox | Select/deselect individual filters |
| Color Dot | Shows label color |
| Clear All | Reset semua filters |
| Close (X) | Close filter panel |

## 💡 Tips & Tricks

1. **Quick View**: Click chevron (>) untuk expand section yang ingin digunakan
2. **Multiple Selection**: Bisa select multiple members/labels untuk "OR" search
3. **Reset Fast**: "Clear All" button clears everything sekaligus
4. **Real-time**: Filters apply instantly (no submit button needed)
5. **Responsive**: Works on mobile, tablet, dan desktop
6. **Dark Mode**: Auto-adjusts to your theme preference

## 🔍 Filter Logic

```
VISIBLE TASKS = 
  (Tasks matching Search Keywords) 
  AND (Assigned to Selected Members) 
  AND (Have Selected Labels) 
  AND (Match Due Date Filter) 
  AND (Match Activity Filter)
```

**Note**: Filters are combined with AND logic, not OR. Task must match ALL selected filters.

## ⚡ Performance

- Filtering is instant (no API calls)
- Works smoothly even dengan banyak tasks
- No page refresh needed
- Filters reset when you leave the board

## 🐛 Troubleshooting

### Filter button not showing?
- Make sure you're on a board detail page
- Check if page loaded completely
- Try refreshing the page

### Some members/labels not appearing?
- Filter only shows members yang ada tasks
- Filter only shows labels yang ada di tasks
- Create/assign labels to tasks untuk melihatnya di filter

### Filters not working?
- Check if all filters are properly selected
- Try clearing all filters dan reapply
- Check browser console for errors

## 📱 Mobile Experience

- Filter button: Full width on mobile
- Filter panel: Slides up as modal
- Sections: Expand/collapse properly on touch
- All features work same sebagai desktop

## 🌙 Dark Mode

- Filter panel automatically adjusts to dark theme
- Colors remain visible di dark mode
- Icon dan text contrast maintained

## 🔄 What Happens When You Filter?

1. You click/type something
2. Filter state updates
3. App calculates which tasks match
4. List re-renders showing only matching tasks
5. Empty lists yang tidak ada matching tasks disembunyikan
6. You see instant results

## 💾 Important Notes

- **Filters are temporary**: Refresh page akan reset filters
- **No data is modified**: Filtering only changes what you see
- **All tasks still exist**: Filters just hide them
- **Works offline**: Filtering happens di browser (no internet needed)

## 🎓 Learning Resources

For developers wanting to understand implementation:
- `FILTER_DOCUMENTATION.md` - Comprehensive technical docs
- `src/components/filters/TaskFilter.tsx` - UI component code
- `src/utils/filterUtils.ts` - Filter logic implementation
- `src/pages/BoardPage.tsx` - Integration example

---

**Last Updated**: December 22, 2025  
**Version**: 1.0

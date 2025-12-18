import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import api from '../lib/api'

interface Card {
  id: string
  title: string
  description?: string
  position: number
  coverImage?: string
  dueDate?: string
  completed: boolean
  createdAt: string
  updatedAt: string
  listId: string
  creatorId: string
  creator: {
    id: string
    name: string
  }
  labels: any[]
  comments: any[]
  checklists: any[]
  _count: {
    comments: number
    attachments: number
    checklists: number
  }
}

interface List {
  id: string
  title: string
  position: number
  createdAt: string
  updatedAt: string
  boardId: string
  cards: Card[]
}

interface Board {
  id: string
  title: string
  description?: string
  background?: string
  createdAt: string
  updatedAt: string
  ownerId: string
  owner: {
    id: string
    name: string
    email: string
  }
  members: {
    id: string
    role: string
    user: {
      id: string
      name: string
      email: string
    }
  }[]
  lists: List[]
  activities: any[]
  _count: {
    lists: number
    members: number
  }
}

interface BoardsState {
  boards: Board[]
  currentBoard: Board | null
  loading: boolean
  currentBoardLoading: boolean
  error: string | null
}

const initialState: BoardsState = {
  boards: [],
  currentBoard: null,
  loading: false,
  currentBoardLoading: false,
  error: null,
}

// Async thunks for API calls
export const fetchUserBoards = createAsyncThunk(
  'boards/fetchUserBoards',
  async () => {
    const response = await api.get('/api/boards')
    return response.data.boards
  }
)

export const fetchBoardById = createAsyncThunk(
  'boards/fetchBoardById',
  async (boardId: string) => {
    const response = await api.get(`/api/boards/${boardId}`)
    return response.data.board
  }
)

export const createBoard = createAsyncThunk(
  'boards/createBoard',
  async (boardData: { title: string; description?: string; background?: string }) => {
    const response = await api.post('/api/boards', boardData)
    return response.data.board
  }
)

export const createList = createAsyncThunk(
  'boards/createList',
  async ({ boardId, title }: { boardId: string; title: string }) => {
    const response = await api.post(`/api/boards/${boardId}/lists`, { title })
    return response.data.list
  }
)

export const createCard = createAsyncThunk(
  'boards/createCard',
  async ({ listId, title, description, dueDate }: { listId: string; title: string; description?: string; dueDate?: string }) => {
    const response = await api.post(`/api/cards`, { title, description, dueDate, listId })
    return response.data.card
  }
)

export const moveList = createAsyncThunk(
  'boards/moveList',
  async ({ listId, position }: { listId: string; position: number }) => {
    console.log('moveList API call:', { listId, position, endpoint: `/api/lists/${listId}/move` });
    const response = await api.put(`/api/lists/${listId}/move`, { position })
    console.log('moveList API response:', response.data);
    return response.data.list
  }
)

export const updateCardPosition = createAsyncThunk(
  'boards/updateCardPosition',
  async ({ cardId, listId, position }: { cardId: string; listId: string; position: number }) => {
    const response = await api.put(`/api/cards/${cardId}`, { listId, position })
    return response.data
  }
)

export const updateTaskCoverImage = createAsyncThunk(
  'boards/updateTaskCoverImage',
  async ({ taskId, coverImage }: { taskId: string; coverImage: string }) => {
    const response = await api.put(`/api/cards/${taskId}`, { coverImage })
    console.log('API response for updateTaskCoverImage:', response.data);
    console.log('Response structure:', JSON.stringify(response.data, null, 2));
    
    // The backend returns the updated card directly, not wrapped in response.data.card
    if (response.data) {
      return response.data;
    } else {
      throw new Error('No data returned from API');
    }
  }
)

export const updateTaskDescription = createAsyncThunk(
  'boards/updateTaskDescription',
  async ({ taskId, description }: { taskId: string; description: string }) => {
    const response = await api.put(`/api/cards/${taskId}`, { description })
    console.log('API response for updateTaskDescription:', response.data);
    
    if (response.data) {
      return response.data;
    } else {
      throw new Error('No data returned from API');
    }
  }
)

export const createComment = createAsyncThunk(
  'boards/createComment',
  async ({ cardId, content }: { cardId: string; content: string }) => {
    const response = await api.post(`/api/cards/${cardId}/comments`, { content })
    console.log('API response for createComment:', response.data);
    
    if (response.data.comment) {
      return response.data.comment;
    } else {
      throw new Error('No comment data returned from API');
    }
  }
)

export const createChecklist = createAsyncThunk(
  'boards/createChecklist',
  async ({ cardId, title }: { cardId: string; title: string }) => {
    const response = await api.post(`/api/cards/${cardId}/checklists`, { title })
    console.log('API response for createChecklist:', response.data);
    
    if (response.data.checklist) {
      return response.data.checklist;
    } else {
      throw new Error('No checklist data returned from API');
    }
  }
)

export const createChecklistItem = createAsyncThunk(
  'boards/createChecklistItem',
  async ({ checklistId, title }: { checklistId: string; title: string }) => {
    const response = await api.post(`/api/cards/checklists/${checklistId}/items`, { title })
    console.log('API response for createChecklistItem:', response.data);
    
    if (response.data.item) {
      return response.data.item;
    } else {
      throw new Error('No checklist item data returned from API');
    }
  }
)

export const updateChecklistItem = createAsyncThunk(
  'boards/updateChecklistItem',
  async ({ itemId, completed }: { itemId: string; completed: boolean }) => {
    const response = await api.put(`/api/cards/checklists/items/${itemId}`, { completed })
    console.log('API response for updateChecklistItem:', response.data);
    
    if (response.data.item) {
      return response.data.item;
    } else {
      throw new Error('No checklist item data returned from API');
    }
  }
)

export const deleteChecklist = createAsyncThunk(
  'boards/deleteChecklist',
  async ({ checklistId }: { checklistId: string }) => {
    await api.delete(`/api/cards/checklists/${checklistId}`)
    return checklistId;
  }
)

export const deleteChecklistItem = createAsyncThunk(
  'boards/deleteChecklistItem',
  async ({ itemId }: { itemId: string }) => {
    await api.delete(`/api/cards/checklists/items/${itemId}`)
    return itemId;
  }
)

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentBoard: (state) => {
      state.currentBoard = null
    },
    // Optimistic update for drag and drop
    reorderCards: (state, action: PayloadAction<{
      sourceListId: string
      destListId: string
      sourceIndex: number
      destIndex: number
    }>) => {
      if (!state.currentBoard) return

      const { sourceListId, destListId, sourceIndex, destIndex } = action.payload
      const sourceList = state.currentBoard.lists.find(list => list.id === sourceListId)
      const destList = state.currentBoard.lists.find(list => list.id === destListId)

      if (!sourceList || !destList) return

      const [movedCard] = sourceList.cards.splice(sourceIndex, 1)
      
      // Update card's listId if moving between lists
      if (sourceListId !== destListId) {
        movedCard.listId = destListId
      }
      
      destList.cards.splice(destIndex, 0, movedCard)

      // Update positions
      sourceList.cards.forEach((card, index) => {
        card.position = index
      })
      destList.cards.forEach((card, index) => {
        card.position = index
      })
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch boards
      .addCase(fetchUserBoards.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserBoards.fulfilled, (state, action: PayloadAction<Board[]>) => {
        state.loading = false
        state.boards = action.payload
      })
      .addCase(fetchUserBoards.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch boards'
      })
      // Fetch board by ID
      .addCase(fetchBoardById.pending, (state) => {
        state.currentBoardLoading = true
        state.error = null
      })
      .addCase(fetchBoardById.fulfilled, (state, action: PayloadAction<Board>) => {
        state.currentBoardLoading = false
        state.currentBoard = action.payload
      })
      .addCase(fetchBoardById.rejected, (state, action) => {
        state.currentBoardLoading = false
        state.error = action.error.message || 'Failed to fetch board'
      })
      // Create board
      .addCase(createBoard.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createBoard.fulfilled, (state, action: PayloadAction<Board>) => {
        state.loading = false
        state.boards.unshift(action.payload)
      })
      .addCase(createBoard.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create board'
      })
      // Create list
      .addCase(createList.fulfilled, (state, action) => {
        if (state.currentBoard) {
          state.currentBoard.lists.push(action.payload)
        }
      })
      .addCase(createList.rejected, (state, action) => {
        console.error('Create list failed:', action.error.message);
        // Optional: Set error state to show to user
        state.error = action.error.message || 'Failed to create list';
      })
      // Move list
      .addCase(moveList.fulfilled, (state, action) => {
        console.log('moveList.fulfilled triggered:', action.payload);
        if (state.currentBoard) {
          const movedList = action.payload;
          const listIndex = state.currentBoard.lists.findIndex(list => list.id === movedList.id);
          
          console.log('List movement in Redux:', { movedList, listIndex, currentLists: state.currentBoard.lists.length });
          
          if (listIndex !== -1) {
            // Remove from old position
            state.currentBoard.lists.splice(listIndex, 1);
            // Insert at new position
            state.currentBoard.lists.splice(movedList.position, 0, movedList);
            
            // Update positions of all lists
            state.currentBoard.lists.forEach((list, index) => {
              list.position = index;
            });
            
            console.log('Lists after movement:', state.currentBoard.lists.map(l => ({ id: l.id, title: l.title, position: l.position })));
          }
        }
      })
      .addCase(moveList.rejected, (state, action) => {
        console.error('Move list failed:', action.error.message);
        state.error = action.error.message || 'Failed to move list';
      })
      // Create card
      .addCase(createCard.fulfilled, (state, action) => {
        if (state.currentBoard) {
          const list = state.currentBoard.lists.find(list => list.id === action.payload.listId)
          if (list) {
            list.cards.push(action.payload)
          }
        }
      })
      .addCase(createCard.rejected, (state, action) => {
        console.error('Create card failed:', action.error.message);
        state.error = action.error.message || 'Failed to create card';
      })
      // Update card position
      .addCase(updateCardPosition.pending, () => {
        // Could add loading state here if needed
      })
      .addCase(updateCardPosition.fulfilled, (state, action) => {
        // Update the card in the current board with the response from backend
        if (state.currentBoard) {
          const updatedCard = action.payload;
          
          // Find and update the card in its new position
          for (const list of state.currentBoard.lists) {
            const cardIndex = list.cards.findIndex(card => card.id === updatedCard.id);
            if (cardIndex !== -1) {
              // Remove from old list
              list.cards.splice(cardIndex, 1);
              break;
            }
          }
          
          // Add to new list
          const targetList = state.currentBoard.lists.find(list => list.id === updatedCard.listId);
          if (targetList) {
            targetList.cards.splice(updatedCard.position, 0, updatedCard);
            
            // Reorder all cards in the target list to ensure correct positions
            targetList.cards.forEach((card, index) => {
              card.position = index;
            });
          }
        }
      })
      .addCase(updateCardPosition.rejected, (_, action) => {
        // Handle error - could show error notification
        console.error('Failed to update card position:', action.error.message);
      })
      // Update task cover image
      .addCase(updateTaskCoverImage.fulfilled, (state, action) => {
        console.log('updateTaskCoverImage.fulfilled payload:', action.payload);
        
        if (state.currentBoard && action.payload) {
          const updatedCard = action.payload;
          
          // Find and update the card in the current board
          for (const list of state.currentBoard.lists) {
            const cardIndex = list.cards.findIndex(card => card.id === updatedCard.id);
            if (cardIndex !== -1) {
              list.cards[cardIndex] = updatedCard;
              console.log('Card updated in Redux store:', updatedCard);
              break;
            }
          }
        } else {
          console.error('updateTaskCoverImage: No payload or currentBoard');
        }
      })
      .addCase(updateTaskCoverImage.rejected, (_, action) => {
        console.error('Failed to update task cover image:', action.error.message);
      })
      // Update task description
      .addCase(updateTaskDescription.fulfilled, (state, action) => {
        console.log('updateTaskDescription.fulfilled payload:', action.payload);
        
        if (state.currentBoard && action.payload) {
          const updatedCard = action.payload;
          
          // Find and update the card in the current board
          for (const list of state.currentBoard.lists) {
            const cardIndex = list.cards.findIndex(card => card.id === updatedCard.id);
            if (cardIndex !== -1) {
              list.cards[cardIndex] = updatedCard;
              console.log('Card description updated in Redux store:', updatedCard);
              break;
            }
          }
        } else {
          console.error('updateTaskDescription: No payload or currentBoard');
        }
      })
      .addCase(updateTaskDescription.rejected, (_, action) => {
        console.error('Failed to update task description:', action.error.message);
      })
      // Create comment
      .addCase(createComment.fulfilled, (state, action) => {
        console.log('createComment.fulfilled payload:', action.payload);
        
        if (state.currentBoard && action.payload) {
          const newComment = action.payload;
          
          // Find the card and add the comment to its comments array
          for (const list of state.currentBoard.lists) {
            const cardIndex = list.cards.findIndex(card => card.id === newComment.cardId);
            if (cardIndex !== -1) {
              // Initialize comments array if it doesn't exist
              if (!list.cards[cardIndex].comments) {
                list.cards[cardIndex].comments = [];
              }
        list.cards[cardIndex].comments.push(newComment);
        console.log('Comment added to card in Redux store:', newComment);
        console.log('Card comments after update:', list.cards[cardIndex].comments);
              break;
            }
          }
        } else {
          console.error('createComment: No payload or currentBoard');
        }
      })
      .addCase(createComment.rejected, (_, action) => {
        console.error('Failed to create comment:', action.error.message);
      })
      // Create checklist
      .addCase(createChecklist.fulfilled, (state, action) => {
        console.log('createChecklist.fulfilled payload:', action.payload);
        
        if (state.currentBoard && action.payload) {
          const newChecklist = action.payload;
          
          // Find the card and add the checklist to its checklists array
          for (const list of state.currentBoard.lists) {
            const cardIndex = list.cards.findIndex(card => card.id === newChecklist.cardId);
            if (cardIndex !== -1) {
              // Initialize checklists array if it doesn't exist
              if (!list.cards[cardIndex].checklists) {
                list.cards[cardIndex].checklists = [];
              }
              list.cards[cardIndex].checklists.push(newChecklist);
              console.log('Checklist added to card in Redux store:', newChecklist);
              break;
            }
          }
        } else {
          console.error('createChecklist: No payload or currentBoard');
        }
      })
      .addCase(createChecklist.rejected, (_, action) => {
        console.error('Failed to create checklist:', action.error.message);
      })
      // Create checklist item
      .addCase(createChecklistItem.fulfilled, (state, action) => {
        console.log('createChecklistItem.fulfilled payload:', action.payload);
        
        if (state.currentBoard && action.payload) {
          const newItem = action.payload;
          
          // Find the checklist and add the item to its items array
          for (const list of state.currentBoard.lists) {
            for (const card of list.cards) {
              const checklistIndex = card.checklists?.findIndex((checklist: any) => checklist.id === newItem.checklistId);
              if (checklistIndex !== -1) {
                // Initialize items array if it doesn't exist
                if (!card.checklists[checklistIndex].items) {
                  card.checklists[checklistIndex].items = [];
                }
                card.checklists[checklistIndex].items.push(newItem);
                console.log('Checklist item added to checklist in Redux store:', newItem);
                return;
              }
            }
          }
        } else {
          console.error('createChecklistItem: No payload or currentBoard');
        }
      })
      .addCase(createChecklistItem.rejected, (_, action) => {
        console.error('Failed to create checklist item:', action.error.message);
      })
      // Update checklist item
      .addCase(updateChecklistItem.fulfilled, (state, action) => {
        console.log('updateChecklistItem.fulfilled payload:', action.payload);
        
        if (state.currentBoard && action.payload) {
          const updatedItem = action.payload;
          
          // Find and update the checklist item in the current board
          for (const list of state.currentBoard.lists) {
            for (const card of list.cards) {
              for (const checklist of card.checklists || []) {
                const itemIndex = checklist.items?.findIndex((item: any) => item.id === updatedItem.id);
                if (itemIndex !== -1) {
                  checklist.items[itemIndex] = updatedItem;
                  console.log('Checklist item updated in Redux store:', updatedItem);
                  return;
                }
              }
            }
          }
        } else {
          console.error('updateChecklistItem: No payload or currentBoard');
        }
      })
      .addCase(updateChecklistItem.rejected, (_, action) => {
        console.error('Failed to update checklist item:', action.error.message);
      })
      // Delete checklist
      .addCase(deleteChecklist.fulfilled, (state, action) => {
        console.log('deleteChecklist.fulfilled payload:', action.payload);
        
        if (state.currentBoard && action.payload) {
          const deletedChecklistId = action.payload;
          
          // Find and remove the checklist from the current board
          for (const list of state.currentBoard.lists) {
            for (const card of list.cards) {
              const checklistIndex = card.checklists?.findIndex((checklist: any) => checklist.id === deletedChecklistId);
              if (checklistIndex !== -1) {
                card.checklists.splice(checklistIndex, 1);
                console.log('Checklist deleted from Redux store:', deletedChecklistId);
                return;
              }
            }
          }
        } else {
          console.error('deleteChecklist: No payload or currentBoard');
        }
      })
      .addCase(deleteChecklist.rejected, (_, action) => {
        console.error('Failed to delete checklist:', action.error.message);
      })
      // Delete checklist item
      .addCase(deleteChecklistItem.fulfilled, (state, action) => {
        console.log('deleteChecklistItem.fulfilled payload:', action.payload);
        
        if (state.currentBoard && action.payload) {
          const deletedItemId = action.payload;
          
          // Find and remove the checklist item from the current board
          for (const list of state.currentBoard.lists) {
            for (const card of list.cards) {
              for (const checklist of card.checklists || []) {
                const itemIndex = checklist.items?.findIndex((item: any) => item.id === deletedItemId);
                if (itemIndex !== -1) {
                  checklist.items.splice(itemIndex, 1);
                  console.log('Checklist item deleted from Redux store:', deletedItemId);
                  return;
                }
              }
            }
          }
        } else {
          console.error('deleteChecklistItem: No payload or currentBoard');
        }
      })
      .addCase(deleteChecklistItem.rejected, (_, action) => {
        console.error('Failed to delete checklist item:', action.error.message);
      })
  },
})

export const { clearError, clearCurrentBoard, reorderCards } = boardsSlice.actions
export default boardsSlice.reducer

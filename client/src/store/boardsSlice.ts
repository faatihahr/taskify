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
    const response = await api.put(`/api/lists/${listId}`, { position })
    return response.data.list
  }
)

export const updateCardPosition = createAsyncThunk(
  'boards/updateCardPosition',
  async ({ cardId, listId, position }: { cardId: string; listId: string; position: number }) => {
    const response = await api.put(`/api/cards/${cardId}`, { listId, position })
    return response.data.card
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
        if (state.currentBoard) {
          const movedList = action.payload;
          const listIndex = state.currentBoard.lists.findIndex(list => list.id === movedList.id);
          
          if (listIndex !== -1) {
            // Remove from old position
            state.currentBoard.lists.splice(listIndex, 1);
            // Insert at new position
            state.currentBoard.lists.splice(movedList.position, 0, movedList);
            
            // Update positions of all lists
            state.currentBoard.lists.forEach((list, index) => {
              list.position = index;
            });
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
  },
})

export const { clearError, clearCurrentBoard, reorderCards } = boardsSlice.actions
export default boardsSlice.reducer

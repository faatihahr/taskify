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
  async ({ listId, title, description }: { listId: string; title: string; description?: string }) => {
    const response = await api.post(`/api/lists/${listId}/cards`, { title, description })
    return response.data.card
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
      // Create card
      .addCase(createCard.fulfilled, (state, action) => {
        if (state.currentBoard) {
          const list = state.currentBoard.lists.find(list => list.id === action.payload.listId)
          if (list) {
            list.cards.push(action.payload)
          }
        }
      })
      // Update card position
      .addCase(updateCardPosition.fulfilled, () => {
        // The optimistic update should have already handled this
        // This is just to ensure consistency if the backend response differs
      })
  },
})

export const { clearError, clearCurrentBoard, reorderCards } = boardsSlice.actions
export default boardsSlice.reducer

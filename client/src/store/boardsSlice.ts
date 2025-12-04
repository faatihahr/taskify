import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import api from '../lib/api'

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
  _count: {
    lists: number
    members: number
  }
}

interface BoardsState {
  boards: Board[]
  loading: boolean
  error: string | null
}

const initialState: BoardsState = {
  boards: [],
  loading: false,
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

export const createBoard = createAsyncThunk(
  'boards/createBoard',
  async (boardData: { title: string; description?: string; background?: string }) => {
    const response = await api.post('/api/boards', boardData)
    return response.data.board
  }
)

const boardsSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
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
  },
})

export const { clearError } = boardsSlice.actions
export default boardsSlice.reducer

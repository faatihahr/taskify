import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import api, { setAuthToken } from '../lib/api'

interface User {
  id: string
  name: string
  email: string
  token?: string
}

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
}

// Async thunks for API calls
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    // Debug: print which baseURL / env the client is using
    try {
      // eslint-disable-next-line no-console
      console.log('auth/login thunk - axios baseURL =', (api as any).defaults?.baseURL)
      // eslint-disable-next-line no-console
      console.log('auth/login thunk - VITE_API_URL =', import.meta.env.VITE_API_URL)
    } catch (e) {
      // ignore
    }

    try {
      const response = await api.post('/api/auth/login', credentials)
      const data = response.data
    // backend returns { message, user_id, name, email, token, ... }
    // normalize to { id, name, email, token }
    const user = {
      id: data.user_id || data.user?.user_id || data.user?.id || data.id,
      name: data.name || data.user?.name || (data.user && data.user.name),
      email: data.email || data.user?.email || (data.user && data.user.email),
      token: data.token || data.user?.token || (data.user && data.user.token),
    }
    // set default header immediately (will also be persisted in extraReducers)
    if (user.token) setAuthToken(user.token)
    return user
    } catch (err: any) {
      // axios error handling
      const msg = err?.response?.data?.message || err?.message || 'Login failed'
      throw new Error(msg)
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }) => {
    const response = await api.post('/api/auth/register', userData)
    const data = response.data
    // backend returns { message, user: { user_id, name, email, token } }
    const src = data.user || data
    const user = {
      id: src.user_id || src.id,
      name: src.name,
      email: src.email,
      token: src.token,
    }
    if (user.token) setAuthToken(user.token)
    return user
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.error = null
      try {
        localStorage.removeItem('taskify_auth')
        // clear api auth header
        try {
          setAuthToken(undefined)
        } catch (e) {}
      } catch (e) {
        // ignore
      }
    },
    clearError: (state) => {
      state.error = null
    },
    restoreSession: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false
        state.user = action.payload
        try {
          // Persist user (including token if present)
          localStorage.setItem('taskify_auth', JSON.stringify(action.payload))
          if (action.payload && action.payload.token) {
            setAuthToken(action.payload.token)
          }
        } catch (e) {
          // ignore quota errors
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Login failed'
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false
        state.user = action.payload
        try {
          localStorage.setItem('taskify_auth', JSON.stringify(action.payload))
          if (action.payload && action.payload.token) {
            setAuthToken(action.payload.token)
          }
        } catch (e) {
          // ignore
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Registration failed'
      })
  },
})

export const { logout, clearError, restoreSession } = authSlice.actions
export default authSlice.reducer

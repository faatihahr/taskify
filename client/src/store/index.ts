import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import { restoreSession } from './authSlice'
import api, { setAuthToken } from '../lib/api'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Try to restore session from localStorage
try {
  const raw = localStorage.getItem('taskify_auth')
  if (raw) {
    const user = JSON.parse(raw)
    // set api default header if token exists
    if (user && user.token) {
      setAuthToken(user.token)
    }
    store.dispatch(restoreSession(user))
  }
} catch (e) {
  // ignore
}

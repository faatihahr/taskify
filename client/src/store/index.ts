import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import boardsReducer from './boardsSlice'
import invitationReducer from './invitationSlice'
import { restoreSession } from './authSlice'
import { setAuthToken } from '../lib/api'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    boards: boardsReducer,
    invitation: invitationReducer,
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

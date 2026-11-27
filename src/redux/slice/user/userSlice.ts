import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { rootStateType } from '../../sotre'

// 🔐 Define State Type
interface UserState {
  isAuthorized: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  isMasterAdmin: boolean
  email: string | null
  userId: string | null
  cardholderId: string | null
  walletId: string | null
}

// 🧠 Initial State
const initialState: UserState = {
  isAuthorized: false,
  isAuthenticated: false,
  isAdmin: false,
  isMasterAdmin: false,
  email: null,
  userId: null,
  cardholderId: null,
  walletId: null,
}

// ⚙️ Create Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set Authenticated
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload
    },

    // Set Authorized
    setAuthorized: (state, action: PayloadAction<boolean>) => {
      state.isAuthorized = action.payload
    },

    // Set Admin
    setIsAdmin: (state, action: PayloadAction<boolean>) => {
      state.isAdmin = action.payload
    },

    // Set Master Admin
    setIsMasterAdmin: (state, action: PayloadAction<boolean>) => {
      state.isMasterAdmin = action.payload
    },

    // Set Email
    setIsEmail: (state, action: PayloadAction<string | null>) => {
      state.email = action.payload
    },

    // Set User Session
    setUserSession: (
      state,
      action: PayloadAction<{
        email?: string | null
        userId?: string | null
        cardholderId?: string | null
        walletId?: string | null
      }>
    ) => {
      if (action.payload.email !== undefined) state.email = action.payload.email
      if (action.payload.userId !== undefined) state.userId = action.payload.userId
      if (action.payload.cardholderId !== undefined) state.cardholderId = action.payload.cardholderId
      if (action.payload.walletId !== undefined) state.walletId = action.payload.walletId
    },

    // Set Wallet Id
    setWalletId: (state, action: PayloadAction<string | null>) => {
      state.walletId = action.payload
    },

    // ❌ Logout
    logout: (state) => {
      state.isAuthorized = false
      state.isAuthenticated = false
      state.isAdmin = false
      state.isMasterAdmin = false
      state.email = null
      state.userId = null
      state.cardholderId = null
      state.walletId = null
    },

    // Reset User States 
    resetUserState: () => initialState
  },
})

// 📤 Export actions
export const {
  setAuthenticated,
  setAuthorized,
  setIsAdmin,
  setIsMasterAdmin,
  setIsEmail,
  setUserSession,
  setWalletId,
  logout,
  resetUserState,
} = userSlice.actions

// 📤 Export reducer
export default userSlice

// 📌 Selectors
export const selectIsAuthenticated = (state: rootStateType) => state.user.isAuthenticated
export const selectIsAuthorized = (state: rootStateType) => state.user.isAuthorized
export const selectIsAdmin = (state: rootStateType) => state.user.isAdmin
export const selectIsMasterAdmin = (state: rootStateType) => state.user.isMasterAdmin
export const selectEmail = (state: rootStateType) => state.user.email
export const selectUserId = (state: rootStateType) => state.user.userId
export const selectCardholderId = (state: rootStateType) => state.user.cardholderId
export const selectWalletId = (state: rootStateType) => state.user.walletId
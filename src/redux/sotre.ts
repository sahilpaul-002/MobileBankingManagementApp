import { configureStore } from '@reduxjs/toolkit'
import { beneficiariesApis } from './features/beneficiaries/beneficiariesApi'
import { cardApis } from './features/card/cardApi'
import { cardholdersApis } from './features/cardholder/cardholdersApi'
import { configApis } from './features/config/configApi'
import { helperApis } from './features/helper/helperApis'
import { kycApis } from './features/kyc/kycApis'
import { transferApis } from './features/transfer/transferApis'
import { twoFaApis } from './features/twoFa/twoFaApis'
import { userApis } from './features/user/userApis'
import { walletApis } from './features/wallet/walletApis'
import appSessionSlice from './slice/appSession/appSessionSlice'
import configSlice from './slice/config/configSlice'
import userSlice from "./slice/user/userSlice"
import utilitySlice from './slice/utility/utilitySlice'

// EXPORT RTK STORE
export const store = configureStore({
    reducer: {
        // Redux Slice Reducer
        appSession: appSessionSlice.reducer,
        config: configSlice.reducer,
        utility: utilitySlice.reducer,
        user: userSlice.reducer,

        // RTK Query reducer
        [configApis.reducerPath]: configApis.reducer, 
        [helperApis.reducerPath]: helperApis.reducer,
        [userApis.reducerPath]: userApis.reducer,
        [twoFaApis.reducerPath]: twoFaApis.reducer,
        [kycApis.reducerPath]: kycApis.reducer,
        [walletApis.reducerPath]: walletApis.reducer,
        [beneficiariesApis.reducerPath]: beneficiariesApis.reducer,
        [transferApis.reducerPath]: transferApis.reducer,
        [cardholdersApis.reducerPath]: cardholdersApis.reducer,
        [cardApis.reducerPath]: cardApis.reducer,
    },

    // 🔥 RTK Query middleware
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(configApis.middleware, helperApis.middleware, userApis.middleware, twoFaApis.middleware, kycApis.middleware, walletApis.middleware, beneficiariesApis.middleware, transferApis.middleware, cardholdersApis.middleware, cardApis.middleware),
})

// EXPORT STORE DISPATCH
export const storeDispatch = store.dispatch

// EXPORT HOOKS TYPES
export type rootStateType = ReturnType<typeof store.getState>
export type appDispatchType = typeof store.dispatch
import { InternalApplicationError } from '@/errorHandling/error';
import { logError } from '@/errorHandling/errorLogger';
import { createAsyncThunk } from '@reduxjs/toolkit';

import { beneficiariesApis } from '../features/beneficiaries/beneficiariesApi';
import { cardApis } from '../features/card/cardApi';
import { cardholdersApis } from '../features/cardholder/cardholdersApi';
import { configApis } from '../features/config/configApi';
import { helperApis } from '../features/helper/helperApis';
import { kycApis } from '../features/kyc/kycApis';
import { transferApis } from '../features/transfer/transferApis';
import { twoFaApis } from '../features/twoFa/twoFaApis';
import { userApis } from '../features/user/userApis';
import { walletApis } from '../features/wallet/walletApis';

import { clearAuthTokens } from '@/utils/expoSecureJwtTokenStorage';
import { clearSessionId } from '@/utils/expoSecureSessionStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { finishLogout, startLogout } from '../slice/appSession/appSessionSlice';
import { resetConfigStates } from '../slice/config/configSlice';
import { resetUserState } from '../slice/user/userSlice';
import {
    clearBanner,
    clearDestroySession,
    resetUtilityStates,
} from '../slice/utility/utilitySlice';

let isLoggingOut = false;

export const logoutUser = createAsyncThunk(
    'user/logoutUser',
    async (_, { dispatch }) => {
        if (isLoggingOut) {
            return;
        }

        isLoggingOut = true;
        dispatch(startLogout());

        try {
            // Attempt server-side session destruction first.
            try {
                await dispatch(
                    helperApis.endpoints.destroySession.initiate(undefined, {
                        forceRefetch: true,
                        subscribe: false,
                    }),
                ).unwrap();
            } 
            catch (error) {
                logError('WARN', {
                    message: 'Failed to destroy server session during logout',
                    error,
                    context: 'LogoutUser.destroySession',
                });
            }

            // Remove expo stored session ID.
            try {
                await clearSessionId();
            } 
            catch (error) {
                logError('ERROR', {
                    message: 'Failed to clear locally stored session ID',
                    error,
                    context: 'LogoutUser.clearSessionId',
                });
            }

            // Clear authentication tokens from Expo SecureStore.
            try {
                await clearAuthTokens();
            } 
            catch (error) {
                logError('ERROR', {
                    message: 'Failed to clear authentication tokens',
                    error,
                    context: 'LogoutUser.clearAuthTokens',
                });
            }

            // Clear user-specific details from AsyncStorage.
            try {
                await AsyncStorage.multiRemove([
                    'userEmail',
                    'userId',
                    'cardholderId',
                    'userWalletId',
                    'dnsBaseUrl',
                ]);
            } 
            catch (error) {
                logError('ERROR', {
                    message: 'Failed to clear user details from AsyncStorage',
                    error,
                    context: 'LogoutUser.clearUserSessionStorage',
                });
            }

            // Clear client application state FIRST before clearing RTK Query caches.
            // Synchronously clears user session (email, userId, etc.) so selectors return null
            // and any mounted query hooks with skip: !userEmail evaluate skip=true.
            dispatch(resetUserState());
            dispatch(resetConfigStates());
            dispatch(resetUtilityStates());
            dispatch(clearDestroySession());
            dispatch(clearBanner());

            // Clear RTK Query caches.
            dispatch(configApis.util.resetApiState());
            dispatch(helperApis.util.resetApiState());
            dispatch(userApis.util.resetApiState());
            dispatch(twoFaApis.util.resetApiState());
            dispatch(kycApis.util.resetApiState());
            dispatch(walletApis.util.resetApiState());
            dispatch(beneficiariesApis.util.resetApiState());
            dispatch(transferApis.util.resetApiState());
            dispatch(cardholdersApis.util.resetApiState());
            dispatch(cardApis.util.resetApiState());

            dispatch(finishLogout());
        } catch (err: unknown) {
            const error = err as {
                config?: { url?: string };
                url?: string;
                message?: string;
            };

            logError('ERROR', {
                message: `LogoutUser failed: ${error.message ?? 'Unknown error'}`,
                error: err,
                context: error.config?.url ?? error.url ?? 'UNKNOWN_URL',
            });

            dispatch(finishLogout());

            throw new InternalApplicationError(
                `LogoutUser failed: ${error.message ?? 'Unknown error'}`,
                'LogoutUser',
                err,
            );
        } finally {
            isLoggingOut = false;
        }
    },
);
import { InternalApplicationError } from '@/errorHandling/error';
import { logError } from '@/errorHandling/errorLogger';
import { createAsyncThunk } from '@reduxjs/toolkit';

import { beneficiariesApis } from '../features/beneficiaries/beneficiariesApi';
import { configApis } from '../features/config/configApi';
import { helperApis } from '../features/helper/helperApis';
import { kycApis } from '../features/kyc/kycApis';
import { transferApis } from '../features/transfer/transferApis';
import { twoFaApis } from '../features/twoFa/twoFaApis';
import { userApis } from '../features/user/userApis';
import { walletApis } from '../features/wallet/walletApis';

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
                    helperApis.endpoints.destroySession.initiate(),
                ).unwrap();
            } catch (error) {
                logError('WARN', {
                    message: 'Failed to destroy server session during logout',
                    error,
                    context: 'LogoutUser.destroySession',
                });
            }

            // Clear RTK Query caches.
            dispatch(configApis.util.resetApiState());
            dispatch(helperApis.util.resetApiState());
            dispatch(userApis.util.resetApiState());
            dispatch(twoFaApis.util.resetApiState());
            dispatch(kycApis.util.resetApiState());
            dispatch(walletApis.util.resetApiState());
            dispatch(beneficiariesApis.util.resetApiState());
            dispatch(transferApis.util.resetApiState());

            // Clear application state.
            dispatch(resetUserState());
            dispatch(resetConfigStates());
            dispatch(resetUtilityStates());
            dispatch(clearDestroySession());
            dispatch(clearBanner());

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
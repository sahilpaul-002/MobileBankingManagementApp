
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_STORAGE_KEY = 'CMA_AUTH_TOKEN';
const REFRESH_TOKEN_STORAGE_KEY = 'CMA_REFRESH_TOKEN';

// AUTH TOKEN

export const getAuthToken = async (): Promise<string | null> => {
    return SecureStore.getItemAsync(AUTH_TOKEN_STORAGE_KEY);
};

export const saveAuthToken = async (authToken: string): Promise<void> => {
    await SecureStore.setItemAsync(AUTH_TOKEN_STORAGE_KEY, authToken);
};

export const clearAuthToken = async (): Promise<void> => {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_STORAGE_KEY);
};

// REFRESH TOKEN

export const getRefreshToken = async (): Promise<string | null> => {
    return SecureStore.getItemAsync(REFRESH_TOKEN_STORAGE_KEY);
};

export const saveRefreshToken = async (refreshToken: string): Promise<void> => {
    await SecureStore.setItemAsync(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
};

export const clearRefreshToken = async (): Promise<void> => {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_STORAGE_KEY);
};

// CLEAR BOTH TOKENS

export const clearAuthTokens = async (): Promise<void> => {
    await Promise.all([
        clearAuthToken(),
        clearRefreshToken()
    ]);
};

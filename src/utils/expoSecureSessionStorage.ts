import * as SecureStore from 'expo-secure-store';

const SESSION_STORAGE_KEY = 'BMA_SESSION_ID';

export const getSessionId = async (): Promise<string | null> => {
    return SecureStore.getItemAsync(SESSION_STORAGE_KEY);
};

export const saveSessionId = async (sessionId: string): Promise<void> => {
    await SecureStore.setItemAsync(SESSION_STORAGE_KEY, sessionId);
};

export const clearSessionId = async (): Promise<void> => {
    await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
};
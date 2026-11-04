import * as SecureStore from 'expo-secure-store'

const SECURE_KEY_NAMES = {
    AES_ENCRYPTION_KEY: 'AES_ENCRYPTION_KEY',
    RSA_ENCRYPTION_PUBLIC_KEY: 'RSA_ENCRYPTION_PUBLIC_KEY',
    RSA_HEADER_ENCRYPTION_PUBLIC_KEY: 'RSA_HEADER_ENCRYPTION_PUBLIC_KEY',
} as const

export const saveEncryptionKey = async (keyName: keyof typeof SECURE_KEY_NAMES, keyValue: string): Promise<void> => {
    await SecureStore.setItemAsync(SECURE_KEY_NAMES[keyName], keyValue)
}

export const getEncryptionKey = async (keyName: keyof typeof SECURE_KEY_NAMES): Promise<string | null> => {
    return SecureStore.getItemAsync(SECURE_KEY_NAMES[keyName])
}

export const removeEncryptionKey = async (keyName: keyof typeof SECURE_KEY_NAMES): Promise<void> => {
    await SecureStore.deleteItemAsync(SECURE_KEY_NAMES[keyName])
}

export const clearEncryptionKeys = async (): Promise<void> => {
    await Promise.all(
        Object.values(SECURE_KEY_NAMES).map(key =>
            SecureStore.deleteItemAsync(key)
        )
    )
}
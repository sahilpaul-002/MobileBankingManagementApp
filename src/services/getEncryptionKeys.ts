import { apiRequest } from '@/configs/axiosConfig';
import { CONFIG_URL } from '@/configs/constants';
import { AppErrorClass } from '@/errorHandling/appError';
import { InternalApplicationError } from '@/errorHandling/error';
import { logError } from '@/errorHandling/errorLogger';
import {
    getEncryptionKey as getSecureEncryptionKey,
    saveEncryptionKey,
} from '@/utils/expoSecureEncryptionKeysStorage';

type EncryptionKeyResponse = {
    data?: {
        data?: {
            key?: string;
        };
    };
};

type EncryptionKeyType = 'aes' | 'rsa' | 'header-rsa';

const KEY_CONFIG = {
    aes: {
        endpoint: `${CONFIG_URL}/getEncryptionKey`,
        secureKeyName: 'AES_ENCRYPTION_KEY',
        errorName: 'GetAesEncryptionKey',
    },
    rsa: {
        endpoint: `${CONFIG_URL}/getPublicKey`,
        secureKeyName: 'RSA_ENCRYPTION_PUBLIC_KEY',
        errorName: 'GetRsaEncryptionKey',
    },
    'header-rsa': {
        endpoint: `${CONFIG_URL}/getHeaderPublicKey`,
        secureKeyName: 'RSA_HEADER_ENCRYPTION_PUBLIC_KEY',
        errorName: 'GetRsaHeaderEncryptionKey',
    },
} as const;

const getEncryptionKey = async (
    type: EncryptionKeyType,
): Promise<string | null> => {
    const config = KEY_CONFIG[type];

    try {
        // 1. Check SecureStore for an existing encryption key.
        const cachedKey = await getSecureEncryptionKey(config.secureKeyName, );

        if (cachedKey) {
            return cachedKey;
        }

        // 2. Fetch the encryption key from the backend.
        const result = (await apiRequest({url: config.endpoint, method: 'GET', })) as EncryptionKeyResponse;

        const key = result?.data?.data?.key;

        if (!key) {
            return null;
        }

        // 3. Store the fetched key in Expo SecureStore.
        await saveEncryptionKey(config.secureKeyName, key);

        // 4. Return the encryption key.
        return key;

    } catch (err: unknown) {
        const error = err as {
            config?: { url?: string };
            url?: string;
            constructor?: { name?: string };
        };

        logError('ERROR', {
            message: 'Encryption key service failed',
            error: err,
            context: error?.config?.url ?? error?.url ?? config.endpoint,
        });

        if (err instanceof AppErrorClass) {
            throw err;
        }

        const className = error?.constructor?.name ?? 'UnknownErrorClass';

        throw new InternalApplicationError(
            `${className}: ${config.errorName} service caused unknown error`,
            'EncryptionKeyService',
            err,
        );
    }
};

export const getAesEncryptionKey = (): Promise<string | null> => getEncryptionKey('aes');

export const getRsaPublicKey = (): Promise<string | null> => getEncryptionKey('rsa');

export const getRsaHeaderPublicKey = (): Promise<string | null> => getEncryptionKey('header-rsa');
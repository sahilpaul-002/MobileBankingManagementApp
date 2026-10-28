import { apiRequest, getAxiosReduxAccess } from '@/configs/axiosConfig';
import { CONFIG_URL } from '@/configs/constants';
import { AppErrorClass } from '@/errorHandling/appError';
import { InternalApplicationError } from '@/errorHandling/error';
import { logError } from '@/errorHandling/errorLogger';
import { setAesEncryptionKeyHex, setRsaEncryptionHeaderPublicKey, setRsaEncryptionPublicKey } from '@/redux/slice/config/configSlice';

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
        stateKey: 'aesEncryptionKeyHex',
        errorName: 'GetAesEncryptionKey',
    },
    rsa: {
        endpoint: `${CONFIG_URL}/getPublicKey`,
        stateKey: 'rsaEncryptionPublicKey',
        errorName: 'GetRsaEncryptionKey',
    },
    'header-rsa': {
        endpoint: `${CONFIG_URL}/getHeaderPublicKey`,
        stateKey: 'rsaEncryptionHeaderPublicKey',
        errorName: 'GetRsaHeaderEncryptionKey',
    },
} as const;

const getEncryptionKey = async (
    type: EncryptionKeyType,
): Promise<string | null> => {
    const config = KEY_CONFIG[type];

    try {
        const { getState, dispatch } = getAxiosReduxAccess();
        const cachedKey = getState().config[config.stateKey];

        if (cachedKey) {
            return cachedKey;
        }

        const result = (await apiRequest({
            url: config.endpoint,
            method: 'GET',
        })) as EncryptionKeyResponse;

        const key = result?.data?.data?.key;

        if (!key) {
            return null;
        }

        switch (type) {
            case 'aes':
                dispatch(setAesEncryptionKeyHex(key));
                break;

            case 'rsa':
                dispatch(setRsaEncryptionPublicKey(key));
                break;

            case 'header-rsa':
                dispatch(setRsaEncryptionHeaderPublicKey(key));
                break;
        }

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

export const getAesEncryptionKey = (): Promise<string | null> =>
    getEncryptionKey('aes');

export const getRsaPublicKey = (): Promise<string | null> =>
    getEncryptionKey('rsa');

export const getRsaHeaderPublicKey = (): Promise<string | null> =>
    getEncryptionKey('header-rsa');
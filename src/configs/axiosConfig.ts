import { AppErrorClass } from '@/errorHandling/appError';
import { ApplicationServiceError, InternalApplicationError } from '@/errorHandling/error';
import { logError } from '@/errorHandling/errorLogger';
import handleErrors from '@/errorHandling/handleErrors';
import { setAesEncryptionKeyHex, setRsaEncryptionHeaderPublicKey, setRsaEncryptionPublicKey } from '@/redux/slice/config/configSlice';
import type { appDispatchType, rootStateType } from '@/redux/sotre';
import { getAesEncryptionKey, getRsaHeaderPublicKey, getRsaPublicKey } from '@/services/getEncryptionKeys';
import { aesDecryption } from '@/utils/aesDecryption';
import { aesEncryption, aesEncryptMultipartFile } from '@/utils/aesEncryption';
import GetDeviceId from '@/utils/GetDeviceId';
import { rsaEncryption } from '@/utils/rsaEncryption';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import * as Crypto from 'expo-crypto';

type AxiosReduxAccess = {
    getState: () => rootStateType;
    dispatch: appDispatchType;
};

let reduxAccess: AxiosReduxAccess | null = null;

export const setAxiosReduxAccess = (access: AxiosReduxAccess): void => {
    reduxAccess = access;
};

export const getAxiosReduxAccess = (): AxiosReduxAccess => {
    if (!reduxAccess) {
        throw new Error('Redux access has not been initialized for Axios');
    }

    return reduxAccess;
};

const ENVIRONMENT = process.env.EXPO_PUBLIC_REACT_NATIVE_ENV;
const NODE_BASE_URL = process.env.EXPO_PUBLIC_NODE_BASE_URL;
const DEV_API_BASE_URL = process.env.EXPO_PUBLIC_DEV_API_BASE_URL;

// Global Dispatch Handling - (To avoid circular store dependencies)
let globalDispatch: any = null;
export const setAxiosDispatch = (dispatch: any) => {
    globalDispatch = dispatch;
};

// Store ivHex value in WeakMap for in request cycle use
const ivStore = new WeakMap<object, string>();

// ==============================
// SETUP INTERCEPTORS ON AXIOS INSTANCE
// ==============================
const setupInterceptors = (instance: AxiosInstance) => {

    // ==========================
    // REQUEST INTERCEPTOR
    // ==========================
    instance.interceptors.request.use(
        async (req) => {
            req.headers = req.headers ?? {};
            req.headers["portal"] = "user";
            req.headers["from-portal"] = "true";
            req.headers["request-id"] = Crypto.randomUUID();
            // const deviceId = await GetDeviceId();
            // req.headers["x-device-id"] = deviceId

            // SKIP ENCRYPTION FOR ENCRYPTION KEY APIs
            if (
                req.url?.includes("/getDnsConfig") ||
                req.url?.includes('/getEncryptionKey') ||
                req.url?.includes('/getPublicKey') ||
                req.url?.includes('/getHeaderPublicKey')
            ) {
                return req;
            }

            // Add encrypted device id
            const { getState, dispatch } = getAxiosReduxAccess();
            let headerPublicKey = getState().config.rsaEncryptionHeaderPublicKey;
            if (!headerPublicKey || req.url?.includes("/login") || req.url?.includes("/signUp")) {
                dispatch(setRsaEncryptionHeaderPublicKey(null));
                headerPublicKey = await getRsaHeaderPublicKey()

                if (!headerPublicKey) {
                    throw new ApplicationServiceError("Request header encryption service cause error - Encryption keys missing");
                }

                dispatch(setRsaEncryptionHeaderPublicKey(headerPublicKey));
            }
            const deviceId = await GetDeviceId();
            const response = await rsaEncryption(
                { value: deviceId },
                headerPublicKey
            );
            if (response?.status !== "SUCCESS") {
                throw new ApplicationServiceError("RsaHeaderEncryption facing unknown error", "RsaHeaderEncryption")
            }
            req.headers["x-device-id"] = response.ciphertextBase64;

            try {
                // GET ENCRYPTION KEYS FROM REDUX
                let aesKey = getState().config.aesEncryptionKeyHex;
                let rsaKey = getState().config.rsaEncryptionPublicKey;

                const shouldRefreshKeys = !aesKey || !rsaKey || req.url?.includes('/login') || req.url?.includes('/signUp');

                if (shouldRefreshKeys) {
                    // Clear old keys before fetching fresh ones.
                    dispatch(setAesEncryptionKeyHex(null));
                    dispatch(setRsaEncryptionPublicKey(null));

                    [aesKey, rsaKey] = await Promise.all([
                        getAesEncryptionKey(),
                        getRsaPublicKey(),
                    ]);

                    if (!aesKey || !rsaKey) {
                        throw new ApplicationServiceError(
                            'Request payload encryption service cause error - Encryption keys missing',
                        );
                    }

                    // Save the fresh keys in Redux.
                    dispatch(setAesEncryptionKeyHex(aesKey));
                    dispatch(setRsaEncryptionPublicKey(rsaKey));
                }

                // GENERATE IV
                const iv = Crypto.getRandomBytes(12);
                const ivHex = Array.from(iv)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');

                // store IV for response decryption in request config using WeakMap
                ivStore.set(req, ivHex);

                // RSA encrypt IV
                const rsaRes = await rsaEncryption({ ivHex }, rsaKey as string);

                // ENCRYPT MULTIPART FORMDATA
                if (req.data instanceof FormData) {
                    const originalFormData = req.data;

                    // New encrypted FormData
                    const encryptedFormData = new FormData();

                    // ---------------------------------------------
                    // COLLECT NORMAL FORM FIELDS
                    // ---------------------------------------------
                    const formFields: Record<string, string> = {};

                    // Keep track of file/blob entries separately
                    const fileEntries: Array<{
                        fieldName: string;
                        file: File | Blob;
                        fileName?: string;
                    }> = [];

                    for (const [fieldName, value] of originalFormData.entries()) {
                        const formValue = value as string | File | Blob;

                        // File / Blob
                        if (formValue instanceof File) {
                            fileEntries.push({
                                fieldName,
                                file: formValue,
                                fileName: formValue.name,
                            });

                            continue;
                        }

                        if (formValue instanceof Blob) {
                            fileEntries.push({
                                fieldName,
                                file: formValue,
                            });

                            continue;
                        }

                        // Normal Form Field
                        formFields[fieldName] = formValue;
                    }

                    // Encrypt json form fields
                    if (Object.keys(formFields).length > 0) {
                        const aesFieldsResult = await aesEncryption(
                            aesKey as string,
                            formFields,
                            ivHex
                        );

                        encryptedFormData.append(
                            "encryptedPayload2",
                            aesFieldsResult.ciphertextHex
                        );
                    }

                    // Rsa encrypted IV
                    encryptedFormData.append(
                        "encryptedPayload1",
                        rsaRes?.ciphertextBase64 ?? ""
                    );

                    // Encrypt all file  / Blob Entries
                    for (const {
                        fieldName,
                        file,
                        fileName,
                    } of fileEntries) {
                        const fileToEncrypt =
                            file instanceof File
                                ? file
                                : new File([file], fileName ?? fieldName, {
                                    type: file.type,
                                });

                        const encryptedFileResult = await aesEncryptMultipartFile(
                            aesKey as string,
                            fileToEncrypt,
                            ivHex
                        );

                        encryptedFormData.append(
                            fieldName,
                            encryptedFileResult.encryptedFile.file,
                            fileName ?? fieldName
                        );
                    }

                    // Replace original FormData
                    req.data = encryptedFormData;

                    // Encrypt query params if present
                    if (req.params) {
                        const aesParamsResult = await aesEncryption(
                            aesKey as string,
                            req.params,
                            ivHex
                        );

                        req.params = {
                            encryptedQueryPayload1: rsaRes?.ciphertextBase64,
                            encryptedQueryPayload2: aesParamsResult.ciphertextHex,
                        };
                    }

                    // DO NOT manually set Content-Type.
                    // Axios/browser will generate the multipart boundary.
                    return req;
                }

                // ENCRYPT BODY & PARAMS (POST/PUT/PATCH)
                if (req.data && req.params) {
                    const aesRes1 = await aesEncryption(aesKey as string, req.data, ivHex);

                    req.data = {
                        encryptedPayload1: rsaRes?.ciphertextBase64,
                        encryptedPayload2: aesRes1?.ciphertextHex,
                    };

                    const aesRes2 = await aesEncryption(aesKey as string, req.params, ivHex);

                    req.params = {
                        encryptedQueryPayload1: rsaRes?.ciphertextBase64,
                        encryptedQueryPayload2: aesRes2?.ciphertextHex,
                    };
                    return req;
                }

                // ENCRYPT BODY (POST/PUT/PATCH)
                if (req.data) {
                    const aesRes = await aesEncryption(aesKey as string, req.data, ivHex);

                    req.data = {
                        encryptedPayload1: rsaRes?.ciphertextBase64,
                        encryptedPayload2: aesRes?.ciphertextHex,
                    };
                    return req;
                }

                // ENCRYPT QUERY PARAMS (GET WITH PARAMS)
                if (req.params) {
                    const aesRes = await aesEncryption(aesKey as string, req.params, ivHex);

                    req.params = {
                        encryptedQueryPayload1: rsaRes?.ciphertextBase64,
                        encryptedQueryPayload2: aesRes?.ciphertextHex,
                    };
                    return req;
                }

                // ENCRYPT QUERY PARAMS FOR EMPTY GET/DELETE REQUESTS
                req.params = {
                    encryptedQueryPayload1: rsaRes?.ciphertextBase64,
                };

                return req;

            }
            catch (err) {
                const error = err as any;
                const url =
                    error?.config?.url ||
                    error?.url ||
                    "UNKNOWN_URL";

                logError("ERROR", {
                    message: "Api axios instance request interceptor error",
                    error: err,
                    context: url,
                });

                const className = error?.constructor?.name || "UnknownErrorClass";
                if (err instanceof AppErrorClass) {
                    return Promise.reject(err);
                }
                throw new InternalApplicationError(`${className}: Request interceptor service caused unknown error`, "AxiosApiRequestInterceptor", err);
            }
        },
        (error) => Promise.reject(error)
    );

    // ==========================
    // RESPONSE INTERCEPTOR
    // ==========================
    instance.interceptors.response.use(
        async (res) => {
            try {
                // DECRYPT RESPONSE (ONLY IF ENCRYPTED)
                const data = res?.data;

                if (data?.data && typeof data.data === 'string') {
                    const aesKey = getAxiosReduxAccess().getState().config.aesEncryptionKeyHex;
                    const ivHex = ivStore.get(res.config);

                    if (aesKey && ivHex) {
                        const decryptRes = await aesDecryption({
                            cipherTextHex: data.data,
                            ivHex,
                            aesEncryptionKeyHex: aesKey,
                        });

                        try {
                            res.data.data = JSON.parse(decryptRes.decryptedText);
                        } catch {
                            throw new Error("Invalid JSON after decryption");
                        }
                    }
                }

                return res;
            }
            catch (err) {
                const error = err as any;
                const url =
                    error?.config?.url ||
                    error?.url ||
                    "UNKNOWN_URL";

                logError("ERROR", {
                    message: "Api axios instance response interceptor error",
                    error: err,
                    context: url,
                });
                const className = error?.constructor?.name || "UnknownErrorClass";
                if (error instanceof AppErrorClass) {
                    return Promise.reject(error);
                }
                throw new InternalApplicationError(`${className}: Response interceptor service caused unknown error`, `AxiosApiResponseInterceptor`, error);
            }
        },
        async (err) => {
            const error = err as any;
            const url =
                error?.config?.url ||
                error?.url ||
                "UNKNOWN_URL";

            logError("ERROR", {
                message: "External api response interceptor error",
                error: err,
                context: url,
            });

            if (globalDispatch) {
                handleErrors(error, globalDispatch);
            }
            return Promise.reject(error);
        }
    );
};

// BASE URL CONFIGURATION
const getApiBaseUrl = async (): Promise<string> => {
    if (ENVIRONMENT === 'DEVELOPMENT') {
        if (!DEV_API_BASE_URL) {
            throw new ApplicationServiceError(
                'Development API base URL is not configured',
            );
        }

        return DEV_API_BASE_URL;
    }

    const dnsBaseUrl = await AsyncStorage.getItem('dnsBaseUrl');
    const baseURL = NODE_BASE_URL || dnsBaseUrl;

    if (!baseURL) {
        throw new ApplicationServiceError(
            'API base URL is not configured',
        );
    }

    return baseURL;
};

let axiosInstance: AxiosInstance | null = null;

// ==============================
// FACTORY FUNCTION FOR AXIOS API CLIENT
// ==============================
export const getAxiosInstance = (): AxiosInstance => {
    if (!axiosInstance) {
        axiosInstance = axios.create({
            withCredentials: true,
        });

        setupInterceptors(axiosInstance);
    }

    return axiosInstance;
};

// ==============================
// UPDATE AXIOS INSTANCE BASE URL
// ==============================
export const setAxiosBaseURL = (baseURL: string) => {
    if (!axiosInstance) return;

    axiosInstance.defaults.baseURL = baseURL;
};

// ==============================
// FACTORY FUNCTION API REQUEST
// ==============================
export const apiRequest = async ({
    url,
    method,
    data,
    params,
    headers,
}: {
    url: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    data?: any;
    params?: any;
    headers?: AxiosRequestConfig["headers"]
}) => {
    const axiosInstance = getAxiosInstance();

    const baseURL = await getApiBaseUrl();

    return axiosInstance.request({
        baseURL: baseURL,
        url,
        method,
        data,
        params,
        ...(headers && { headers }),
    });
};

// ==============================
// CUSTOM BASE QUERY USING AXIOS
// ==============================
export const axiosBaseQuery =
    (axiosInstance: AxiosInstance) =>
        async ({
            url,
            method,
            data,
            params,
            headers
        }: {
            url: string
            method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
            data?: unknown
            params?: unknown
            headers?: AxiosRequestConfig["headers"]
        }) => {
            try {
                const baseURL = await getApiBaseUrl();

                const result = await axiosInstance.request({
                    baseURL: baseURL,
                    url,
                    method,
                    data,
                    params,
                    ...(headers && { headers }),
                });
                return { data: result.data }
            } catch (err) {
                const error = err as any;

                const url =
                    error?.config?.url ||
                    error?.url ||
                    "UNKNOWN_URL";

                logError("ERROR", {
                    message: "Axios base query error",
                    error: err,
                    context: url,
                });
                return {
                    error: {
                        status: error.response?.status || 500,
                        data: error.response?.data || error.message,
                    },
                }
            }
        }

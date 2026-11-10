import { AppErrorClass } from "@/errorHandling/appError";
import { InternalApplicationError } from "@/errorHandling/error";
import { File as ExpoFile, Paths } from "expo-file-system";
import { Buffer, createCipheriv, randomBytes, } from "react-native-quick-crypto";

// ---------------------------------------------------------
// COMMON AES UTILITIES
// ---------------------------------------------------------
function hexToBuffer(hex: string, fieldName: string): Buffer {
    if (!hex || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
        throw new InternalApplicationError(`Invalid ${fieldName} hexadecimal value`, "AesEncryption");
    }

    return Buffer.from(hex, "hex");
}

function validateAesKey(key: Buffer): void {
    if (![16, 24, 32].includes(key.length)) {
        throw new InternalApplicationError("Invalid AES key length. Expected 16, 24 or 32 bytes", "AesEncryption");
    }
}

function validateIv(iv: Buffer): void {
    // 96-bit (12-byte) IV is the recommended GCM configuration.
    if (iv.length !== 12) {
        throw new InternalApplicationError("Invalid AES-GCM IV length. Expected 12 bytes", "AesEncryption");
    }
}

function encryptAesGcm(key: Buffer, iv: Buffer, plaintext: Buffer): Buffer {
    validateAesKey(key);
    validateIv(iv);

    const algorithm = `aes-${key.length * 8}-gcm`;

    const cipher = createCipheriv(algorithm, key, iv, {authTagLength: 16});

    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);

    const authTag = cipher.getAuthTag();

    // Web Crypto AES-GCM returns ciphertext + authentication tag.
    return Buffer.concat([encrypted, authTag]);
}

function handleEncryptionError(error: any, message: string): never {
    if (error instanceof AppErrorClass) {
        throw error;
    }

    throw new InternalApplicationError(message, error);
}

// ---------------------------------------------------------
// ENCRYPT JSON PAYLOAD (QUERY PARAMS / REQUEST PAYLOAD)
// ---------------------------------------------------------
interface EncryptSuccessType {
    status: "SUCCESS";
    ciphertextHex: string;
    ivHex: string;
}

export async function aesEncryption<T extends object>(
    sessionKeyHex: string,
    requestObj: T,
    ivHex: string
): Promise<EncryptSuccessType> {
    try {
        if (!sessionKeyHex?.trim()) {
            throw new InternalApplicationError("AES encryption key is missing", "AesEncryption");
        }

        if (!ivHex?.trim()) {
            throw new InternalApplicationError("AES IV is missing", "AesEncryption");
        }

        const key = hexToBuffer(sessionKeyHex, "AES key");

        const iv = hexToBuffer(ivHex, "AES IV");

        validateAesKey(key);
        validateIv(iv);

        const plaintext = Buffer.from(JSON.stringify(requestObj), "utf8");

        const encrypted = encryptAesGcm(key, iv, plaintext);

        return {status: "SUCCESS", ciphertextHex: encrypted.toString("hex"), ivHex};
    } catch (error: unknown) {
        handleEncryptionError(error, "AES Encryption service caused an unknown error");
    }
}

// ---------------------------------------------------------
// ENCRYPTING MULTIPART FILE
// ---------------------------------------------------------
export interface ReactNativeFileType {
    uri: string;
    name: string;
    mimeType?: string | null;
    size?: number;
}

interface EncryptedMultipartFileType {
    uri: string;
    name: string;
    type: string;
}

interface EncryptMultipartFileSuccessType {
    status: "SUCCESS";
    encryptedFile: EncryptedMultipartFileType;
    ivHex: string;
}

export async function aesEncryptMultipartFile(
    sessionKeyHex: string,
    file: ReactNativeFileType,
    ivHex: string
): Promise<EncryptMultipartFileSuccessType> {
    try {
        if (!sessionKeyHex?.trim()) {
            throw new InternalApplicationError("AES encryption key is missing", "AesEncryptMultipartFile");
        }

        if (!file?.uri) {
            throw new InternalApplicationError("Multipart file is missing or invalid", "AesEncryptMultipartFile");
        }

        if (!ivHex?.trim()) {
            throw new InternalApplicationError("AES IV is missing", "AesEncryptMultipartFile");
        }

        const key = hexToBuffer(sessionKeyHex, "AES key");

        const iv = hexToBuffer(ivHex, "AES IV");

        validateAesKey(key);
        validateIv(iv);

        // Read the original file as binary.
        const originalFile = new ExpoFile(file.uri);

        if (!originalFile.exists) {
            throw new InternalApplicationError("Original multipart file does not exist", "AesEncryptMultipartFile");
        }

        const fileBytes = await originalFile.bytes();

        // Encrypt the binary file using AES-GCM.
        const encryptedPayload = encryptAesGcm(key, iv, Buffer.from(fileBytes));

        // Generate a unique encrypted file name.
        const encryptedFileName = `encrypted-${randomBytes(8).toString("hex")}.bin`;

        // Save encrypted binary data in application cache.
        const encryptedFile = new ExpoFile(Paths.cache, encryptedFileName);

        encryptedFile.create({intermediates: true, overwrite: true});

        await encryptedFile.write(new Uint8Array(encryptedPayload));

        return {
            status: "SUCCESS",
            encryptedFile: {
                uri: encryptedFile.uri,
                name: encryptedFileName,
                type: "application/octet-stream",
            },
            ivHex,
        };
    } catch (error: unknown) {
        handleEncryptionError(error, "AES Multipart File Encryption service caused an unknown error");
    }
}

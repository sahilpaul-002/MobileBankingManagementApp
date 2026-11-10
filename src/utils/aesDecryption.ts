import { AppErrorClass } from "@/errorHandling/appError";
import { InternalApplicationError } from "@/errorHandling/error";
import { Buffer, createDecipheriv } from "react-native-quick-crypto";

interface DecryptSuccess {
    status: "SUCCESS";
    decryptedText: string;
}

interface DecryptError {
    status: "ERROR";
    message: string;
    error?: unknown;
}

export type DecryptResult = DecryptSuccess | DecryptError;

interface DecryptParams {
    cipherTextHex: string;
    ivHex: string;
    aesEncryptionKeyHex: string;
}

// Convert hexadecimal string to Buffer.
function hexToBuffer(hex: string, fieldName: string): Buffer {
    if (!hex || hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) {
        throw new InternalApplicationError(`Invalid ${fieldName} hexadecimal value`, "AesDecryption");
    }

    return Buffer.from(hex, "hex");
}

/**
 * Decrypt AES-GCM encrypted data.
 *
 * Ciphertext format: Encrypted data + 16-byte authentication tag
 */
export async function aesDecryption({cipherTextHex, ivHex, aesEncryptionKeyHex}: DecryptParams): Promise<DecryptSuccess> {
    try {
        if (!aesEncryptionKeyHex?.trim()) {
            throw new InternalApplicationError("AES decryption key is missing", "AesDecryption");
        }

        if (!ivHex?.trim()) {
            throw new InternalApplicationError("AES IV is missing", "AesDecryption");
        }

        if (!cipherTextHex?.trim()) {
            throw new InternalApplicationError("AES ciphertext is missing", "AesDecryption");
        }

        const key = hexToBuffer(aesEncryptionKeyHex, "AES key");

        const iv = hexToBuffer(ivHex, "AES IV");

        const encryptedData = hexToBuffer(cipherTextHex, "AES ciphertext");

        // Validate AES key length.
        if (![16, 24, 32].includes(key.length)) {
            throw new InternalApplicationError("Invalid AES key length. Expected 16, 24 or 32 bytes", "AesDecryption");
        }

        // AES-GCM uses a 12-byte IV.
        if (iv.length !== 12) {
            throw new InternalApplicationError("Invalid AES-GCM IV length. Expected 12 bytes", "AesDecryption");
        }

        // Authentication tag is the final 16 bytes.
        const authTagLength = 16;

        if (encryptedData.length <= authTagLength) {
            throw new InternalApplicationError("Invalid AES ciphertext or missing authentication tag", "AesDecryption");
        }

        const ciphertext = encryptedData.subarray(0, encryptedData.length - authTagLength);

        const authTag = encryptedData.subarray(encryptedData.length - authTagLength);

        const algorithm = `aes-${key.length * 8}-gcm`;

        const decipher = createDecipheriv(algorithm, key, iv, {authTagLength});

        decipher.setAuthTag(authTag);

        const decryptedBuffer = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

        const decryptedText = decryptedBuffer.toString("utf8");

        return {
            status: "SUCCESS",
            decryptedText,
        };

    } catch (error: any) {
        console.error("AES Decryption error:", error);

        if (error instanceof AppErrorClass) {
            throw error;
        }

        throw new InternalApplicationError("AES Decryption function caused an unknown error", error);
    }
}

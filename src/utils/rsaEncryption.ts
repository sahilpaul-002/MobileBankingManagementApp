import { AppErrorClass } from "@/errorHandling/appError";
import { ApplicationServiceError, InternalApplicationError } from "@/errorHandling/error";
import { Buffer, constants, publicEncrypt } from "react-native-quick-crypto";

interface EncryptSuccessType {
    status: "SUCCESS";
    ciphertextBase64: string;
}

interface EncryptErrorType {
    status: "error";
    message: string;
}

type EncryptResultType = EncryptSuccessType | EncryptErrorType;

/**
 * Encrypt a JSON message using RSA-OAEP with SHA-256.
 *
 * @param message - Data to encrypt
 * @param publicKeyPem - RSA public key in PEM format
 */
export async function rsaEncryption(message: Record<string, unknown>, publicKeyPem: string): Promise<EncryptSuccessType> {
    try {
        if (!publicKeyPem?.trim()) {
            throw new ApplicationServiceError("Encryption failed - Invalid public key");
        }

        const payload = JSON.stringify(message);

        const encrypted = publicEncrypt(
            {
                key: publicKeyPem,
                padding: constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: "sha256"
            },
            Buffer.from(payload, "utf8")
        );

        return {status: "SUCCESS", ciphertextBase64: encrypted.toString("base64")};
    } 
    catch (error: any) {
        if (error instanceof AppErrorClass) {
            throw error;
        }

        throw new InternalApplicationError("RSA Encryption service caused an unknown error", error);
    }
}

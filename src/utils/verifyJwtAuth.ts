
import jwt, { type JwtPayload } from "jsonwebtoken";
import verifyJwtRefresh from "./verifyJwtRefresh.js";
import generateJwtAuth from "./generateJwtToken.js";
import logger from "./logger.js";

interface JwtAuthDataType extends JwtPayload {
    accessToken: string;
    userType: string;
}

interface JwtRefreshDataType extends JwtPayload {
    accessToken: string;
    clientId: string;
    businessId: string;
}

type VerifyResponse =
    | {
        status: "SUCCESS";
        jwtAuthData: JwtAuthDataType;
    }
    | {
        status: "NEW_TOKEN";
        message: string;
        jwtAuthToken: string;
    }
    | {
        status: "UNAUTHORIZED" | "SERVICE_ERROR" | "EXPIRED" | "INVALID";
        message?: string;
        error?: unknown;
        expiredAt?: Date;
    };

const verifyJwtAuth = async (
    jwtAuthToken: string,
    jwtRefreshToken: string,
    accessToken: string,
    sessionUserType: string,
    jwtAuthSecretKey: string,
    sessionProgramId: string,
    sessionBusinessId: string
): Promise<VerifyResponse> => {

    try {
        if (!jwtAuthToken || !jwtRefreshToken) {
            return {
                status: "UNAUTHORIZED",
                message: "Missing auth token or refresh token"
            };
        }

        // Verify access token
        try {
            const authData = jwt.verify(
                jwtAuthToken,
                jwtAuthSecretKey
            ) as JwtAuthDataType;

            return {
                status: "SUCCESS",
                jwtAuthData: authData
            };

        } catch (error: any) {

            if (error.name !== "TokenExpiredError") {
                if (error.name === "JsonWebTokenError") {
                    return {
                        status: "INVALID",
                        message: "Invalid authentication token",
                        error
                    };
                }

                throw error;
            }
        }

        // Access token expired - verify refresh token
        const refreshResult = await verifyJwtRefresh(
            jwtRefreshToken,
            jwtAuthSecretKey
        );

        if (refreshResult.status !== "SUCCESS") {
            return {
                status: "UNAUTHORIZED",
                message: ("message" in refreshResult ? refreshResult.message : undefined) ?? "Refresh token verification failed",
                error: "error" in refreshResult ? refreshResult.error : undefined
            };
        }

        const refreshData: JwtRefreshDataType = refreshResult.jwtAuthData;

        // Validate refresh token payload
        if (
            refreshData.accessToken !== accessToken ||
            refreshData.clientId !== sessionProgramId ||
            refreshData.businessId !== sessionBusinessId
        ) {
            return {
                status: "UNAUTHORIZED",
                message: "Invalid refresh token"
            };
        }

        // Generate new access token
        const newAuthToken = await generateJwtAuth(
            {
                accessToken,
                userType: sessionUserType
            },
            "12m",
            jwtAuthSecretKey
        );

        if (!newAuthToken) {
            return {
                status: "SERVICE_ERROR",
                message: "Failed to generate new authentication token"
            };
        }

        return {
            status: "NEW_TOKEN",
            message: "New authentication token generated",
            jwtAuthToken: newAuthToken
        };

    } catch (error: any) {
        logger.error(error, {
            serviceName: "VerifyJwtAuth"
        });

        if (error.name === "TokenExpiredError") {
            return {
                status: "EXPIRED",
                message: "JWT token has expired",
                expiredAt: error.expiredAt,
                error
            };
        }

        if (error.name === "JsonWebTokenError") {
            return {
                status: "INVALID",
                message: "Invalid JWT token",
                error
            };
        }

        return {
            status: "SERVICE_ERROR",
            message: "Authentication verification failed",
            error
        };
    }
};

export default verifyJwtAuth;

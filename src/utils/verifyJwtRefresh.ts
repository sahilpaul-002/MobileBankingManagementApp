
import jwt, { type JwtPayload } from "jsonwebtoken";

interface JwtRefreshDataType extends JwtPayload {
    accessToken: string;
    clientId: string;
    businessId: string;
}

type VerifyJwtRefreshResponse =
    | {
        status: "SUCCESS";
        jwtAuthData: JwtRefreshDataType;
    }
    | {
        status: "EXPIRED";
        message: string;
        expiredAt: Date;
        error: unknown;
    }
    | {
        status: "INVALID";
        message: string;
        error: unknown;
    }
    | {
        status: "SERVICE_ERROR";
        error: unknown;
    }
    | {
        status: "UNAUTHORIZED";
        message: string;
    };

const verifyJwtRefresh = async (
    jwtRefreshToken: string,
    jwtRefreshSecretKey: string
): Promise<VerifyJwtRefreshResponse> => {

    try {
        if (!jwtRefreshToken) {
            return {
                status: "UNAUTHORIZED",
                message: "Missing refresh token"
            };
        }

        if (!jwtRefreshSecretKey) {
            return {
                status: "SERVICE_ERROR",
                error: new Error("JWT secret unavailable")
            };
        }

        const authData = jwt.verify(
            jwtRefreshToken,
            jwtRefreshSecretKey
        ) as JwtRefreshDataType;

        return {
            status: "SUCCESS",
            jwtAuthData: authData
        };

    } catch (error: any) {

        if (error.name === "TokenExpiredError") {
            return {
                status: "EXPIRED",
                message: "Refresh token has expired",
                expiredAt: error.expiredAt,
                error
            };
        }

        if (error.name === "JsonWebTokenError") {
            return {
                status: "INVALID",
                message: "Invalid refresh token",
                error
            };
        }

        return {
            status: "SERVICE_ERROR",
            error
        };
    }
};

export default verifyJwtRefresh;

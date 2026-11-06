import type {Request, Response, NextFunction} from "express";
import type { failedResponseJson } from "../types/responseJson.js";
import destroySession from "../utils/destroySession.js";
import {AppErrorClass, InternalSeverError, ServiceError, UnauthenticatedError} from "../utils/AppErrorClass.js";
import logger from "../utils/logger.js";

const SESSION_INACTIVITY_TIMEOUT = 1000 * 60 * 12;

const EXCLUDED_PATHS: string[] = [
    "/api/v1/helper",
    "/api/v1/config",
    "/api/v1/user/signUp",
    "/api/v1/user/login",
    "/api/v1/twoFa/sendVerifyEmailCode",
    "/api/v1/twoFa/sendResetPasswordCode",
    "/api/v1/twoFa/verifyResetPasswordCode"
];

const isExcludedPath = (req: Request): boolean => {
    return EXCLUDED_PATHS.some(
        path =>
            req.path === path ||
            req.path.startsWith(`${path}/`)
    );
};

const sessionExpiration = async (req: Request, res: Response, next: NextFunction): Promise<Response<failedResponseJson> | void> => {
    try {
        // Skip session expiration validation for excluded routes.
        if (isExcludedPath(req)) {
            return next();
        }

        // No existing session.
        // Allow the request to continue so dynamicSession's Proxy
        // can initialize a session on the first property assignment.
        if (!req.session || !req.sessionID || !req.sessionRedisKey) {
            return next();
        }

        // Validate last activity timestamp.
        if (typeof req.session.lastActivity !== "number" || !Number.isFinite(req.session.lastActivity) || req.session.lastActivity <= 0) {
            const destroyResponse = await destroySession(req);

            if (destroyResponse.status !== "SUCCESS") {
                return next(
                    new InternalSeverError("FAILED TO DESTROY SESSION", destroyResponse.error)
                );
            }

            return next(new UnauthenticatedError("Unauthenticated Access: No Active Session Found"));
        }

        // Calculate session inactivity.
        const now = Date.now();

        const inactiveTime = now - req.session.lastActivity;

        // Destroy expired sessions.
        if (inactiveTime >= SESSION_INACTIVITY_TIMEOUT) {
            const destroyResponse = await destroySession(req);

            if (destroyResponse.status !== "SUCCESS") {
                return next(new InternalSeverError("FAILED TO DESTROY SESSION", destroyResponse.error));
            }

            return next(new UnauthenticatedError("Session expired due to inactivity")
            );
        }

        // Session is active. Refresh last activity.
        req.session.lastActivity = now;

        return next();
    }
    catch (err) {
        const error = err as any & {
            status?: string;
            error?: unknown;
        };

        const errorStatus = error?.status || "UnknownErrorStatus";

        logger.error(error, {serviceName: "SessionExpirationMiddleware"});

        if (error instanceof AppErrorClass) {
            return next(error);
        }

        return next(
            new ServiceError(
                `Session expiration validation facing issue: [${errorStatus}] ${error.message}`,
                error?.error ?? error
            )
        );
    }
};

export default sessionExpiration;

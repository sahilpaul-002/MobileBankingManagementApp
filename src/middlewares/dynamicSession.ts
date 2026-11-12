import crypto from "crypto";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import type { RedisClientType } from "redis";
import type { SessionPortal, sessionItemsTypes } from "../types/sessionTypes.js";
import type { failedResponseJson, successResponseJsonRedisCLient } from "../types/responseJson.js";
import { getRedisClient } from "../configs/redisConfig.js";
import buildSession from "./buildSession.js";
import { BadRequestError, InternalServerError, ServiceError, UnauthenticatedError } from "../utils/AppErrorClass.js";
import logger from "../utils/logger.js";
import sanitizeApiError from "../utils/sanitizeApiError.js";

const SESSION_ID_REGEX = /^[A-Za-z0-9_-]{43}$/;

const isSessionBootstrapRoute = (req: Request): boolean => req.method === "GET" && req.path.endsWith("/getEncryptionKey");
const isHelperRoutes = (req: Request): boolean => req.path.startsWith("/api/v1/helper/")

const dynamicSession = (): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            // Get Redis client
            const redisClientResponse: successResponseJsonRedisCLient | failedResponseJson = getRedisClient();

            if (redisClientResponse.status !== "SUCCESS") {
                throw new InternalServerError("Failed to get Redis client");
                // res.status(500).json({ status: "INTERNAL_SERVER_ERROR", message: "Failed to get Redis client" });
                // return;
            }

            const redisClient: RedisClientType = redisClientResponse.client;

            if (!redisClient.isReady) {
                throw new InternalServerError("Redis client is not ready");
                // res.status(500).json({ status: "INTERNAL_SERVER_ERROR", message: "Redis client is not ready" });
                // return;
            }

            // Validate portal
            const portalHeader = req.headers.portal;

            const portal: SessionPortal | undefined = typeof portalHeader === "string" ? portalHeader.toUpperCase() as SessionPortal : undefined;

            if (!portal || !["BUSINESS", "ADMIN", "USER"].includes(portal)) {
                throw new BadRequestError("Invalid portal header");
                // res.status(400).json({ status: "BAD_REQUEST", message: "Invalid portal header" });
                // return;
            }

            // Get session configuration
            const sessionConfig = buildSession()[portal];

            // Get incoming session ID
            const incomingSessionId = req.headers["x-session-id"];

            let sessionId: string | undefined =
                typeof incomingSessionId === "string" &&
                    incomingSessionId.trim()
                    ? incomingSessionId
                    : undefined;

            let sessionRedisKey: string | undefined;

            let sessionTarget: Partial<sessionItemsTypes> = {};

            // Load an existing session when an ID is supplied
            if (sessionId) {
                // Always validate session ID format, regardless of route.
                if (!SESSION_ID_REGEX.test(sessionId)) {
                    throw new UnauthenticatedError("Invalid session ID");
                    // res.status(401).json({ status: "UNAUTHENTICATED", code: "SESSION_INVALID", message: "Invalid session ID" });
                    // return;
                }

                // Check whether the current route is a bootstrap route.
                const isBootstrapRoute = isSessionBootstrapRoute(req);
                const isHelperRoute = isHelperRoutes(req);

                sessionRedisKey = `${sessionConfig.prefix}:${sessionId}`;

                // Check whether the session exists in Redis.
                const storedSession = await redisClient.get(sessionRedisKey);

                if (!storedSession) {
                    if (!isBootstrapRoute && !isHelperRoute) {
                        throw new UnauthenticatedError("Session expired or not found");
                        // res.status(401).json({ status: "UNAUTHENTICATED", code: "SESSION_EXPIRED", message: "Session expired or not found" });
                        // return;
                    }

                    // Allow bootstrap route to continue with a fresh session.
                    sessionId = undefined;
                    sessionRedisKey = undefined;
                }
                else {
                    try {
                        sessionTarget = JSON.parse(storedSession) as sessionItemsTypes;
                    } catch {
                        await redisClient.del(sessionRedisKey!);

                        if (!isBootstrapRoute) {
                            throw new UnauthenticatedError("Invalid session data");
                            // res.status(401).json({ status: "UNAUTHENTICATED", code: "SESSION_INVALID", message: "Invalid session data" });
                            // return;
                        }

                        sessionId = undefined;
                        sessionRedisKey = undefined;
                        sessionTarget = {};
                    }

                    // Validate the loaded session object.
                    if (sessionId && (!sessionTarget || typeof sessionTarget !== "object")) {
                        await redisClient.del(sessionRedisKey!);

                        if (!isBootstrapRoute) {
                            throw new UnauthenticatedError("Invalid or inactive session");
                            // res.status(401).json({ status: "UNAUTHENTICATED", code: "SESSION_INVALID", message: "Invalid or inactive session" });
                            // return;
                        }

                        sessionId = undefined;
                        sessionRedisKey = undefined;
                        sessionTarget = {};
                    }
                }
            }

            // Track session state
            let sessionDirty = false;

            req.sessionID = sessionId;
            req.sessionRedisKey = sessionRedisKey;
            req.sessionPortal = portal;
            req.sessionDestroyed = false;

            // Create the lazy session Proxy
            const sessionProxy = new Proxy(sessionTarget, {
                set: (target, property, value): boolean => {
                    // Generate a session ID on the first assignment.
                    if (!sessionId) {
                        sessionId = crypto.randomBytes(32).toString("base64url");

                        sessionRedisKey = `${sessionConfig.prefix}:${sessionId}`;

                        req.sessionID = sessionId;
                        req.sessionRedisKey = sessionRedisKey;

                        // Send the new session ID to React Native.
                        res.setHeader("x-session-id", sessionId);
                    }

                    Reflect.set(target, property, value);

                    sessionDirty = true;

                    return true;
                },

                deleteProperty: (target, property): boolean => {
                    const deleted = Reflect.deleteProperty(target, property);

                    if (deleted) {
                        sessionDirty = true;
                    }

                    return deleted;
                }
            });

            req.session = sessionProxy as sessionItemsTypes;

            // Persist session before completing the response
            const originalEnd = res.end.bind(res);

            let responseEnding = false;

            res.end = ((...args: any[]) => {
                if (responseEnding) {
                    return res;
                }

                responseEnding = true;

                void (async () => {
                    try {
                        if (sessionId &&
                            sessionRedisKey &&
                            req.session &&
                            !req.sessionDestroyed &&
                            (sessionDirty || Boolean(req.sessionID))
                        ) {
                            await redisClient.set(
                                sessionRedisKey,
                                JSON.stringify(req.session),
                                {
                                    EX: sessionConfig.ttl
                                }
                            );
                        }

                        originalEnd(...args);
                    } catch (error) {
                        console.error("Failed to save Redis session:", error);

                        if (!res.headersSent) {
                            res.statusCode = 500;

                            res.setHeader("Content-Type", "application/json");

                            originalEnd(JSON.stringify({ status: "INTERNAL_SERVER_ERROR", message: "Failed to persist session" }));

                            return;
                        }

                        originalEnd();
                    }
                })();

                return res;
            }) as typeof res.end;

            return next();
        }
        catch (error: any) {
            logger.error(error, {
                serviceName: "DynamicSessionMiddleware",
                url: req.path,
                method: req.method,
            });

            return next(error);
        }
    };
};

export default dynamicSession;
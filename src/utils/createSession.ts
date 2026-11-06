
import crypto from "node:crypto";
import type { Response } from "express";
import { getRedisClient } from "../configs/redisConfig.js";
import type {SessionPortal, sessionItemsTypes} from "../types/sessionTypes.js";
import buildSession from "../middlewares/buildSession.js";

const createSession = async (portal: SessionPortal, sessionData: sessionItemsTypes, res: Response): Promise<string> => {
    const redisClientResponse = getRedisClient();

    if (redisClientResponse.status !== "SUCCESS") {
        throw new Error("Failed to initialize Redis client");
    }

    const redisClient = redisClientResponse.client;

    if (!redisClient.isReady) {
        throw new Error("Redis client is not ready");
    }

    // Generate a cryptographically secure session ID.
    const sessionId = crypto.randomBytes(32).toString("base64url");

    // Get portal-specific configuration.
    const sessionConfig = buildSession()[portal];

    // Construct Redis key.
    const redisKey = `${sessionConfig.prefix}:${sessionId}`;

    // Initialize session activity.
    const newSession: sessionItemsTypes = {
        ...sessionData,
        initiated: true,
        valid: true,
        lastActivity: Date.now()
    };

    // Save session in Redis with a 12-minute TTL.
    await redisClient.set(
        redisKey,
        JSON.stringify(newSession),
        {
            EX: sessionConfig.ttl
        }
    );

    // Return session ID through response header.
    res.setHeader("x-session-id", sessionId);

    return sessionId;
};

export default createSession;

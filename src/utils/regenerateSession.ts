import crypto from "node:crypto";
import type { Request } from "express";
import { getRedisClient } from "../configs/redisConfig.js";
import type { sessionItemsTypes } from "../types/sessionTypes.js";

const regenerateSession = async (req: Request): Promise<void> => {
    if (!req.session || !req.sessionID || !req.sessionRedisKey) {
        throw new Error("No active session available for regeneration");
    }

    const redisClientResponse = getRedisClient();

    if (redisClientResponse.status !== "SUCCESS") {
        throw new Error("Redis client unavailable");
    }

    const redisClient = redisClientResponse.client;

    // Preserve existing session data.
    const previousSession = { ...req.session };

    // Generate a new session ID.
    const newSessionId = crypto.randomBytes(32).toString("base64url");
    const newSessionRedisKey = `${process.env.SESSION_PREFIX}:${newSessionId}`;

    // Store the new session before deleting the old one.
    await redisClient.set(
        newSessionRedisKey,
        JSON.stringify(previousSession),
        { EX: 60 * 12, NX: true }
    );

    // Delete the old session.
    await redisClient.del(req.sessionRedisKey);

    // Update current request session references.
    req.sessionID = newSessionId;
    req.sessionRedisKey = newSessionRedisKey;
    req.sessionDestroyed = false;

    // Update the response header with the new session ID.
    // Ensure this matches your dynamicSession header strategy.
    req.res?.setHeader("x-session-id", newSessionId);

    // Restore session data.
    req.session = previousSession as sessionItemsTypes;
};

export default regenerateSession;
import type { Request } from "express";
import type {failedResponseJson, successResponseJson} from "../types/responseJson.js";
import { getRedisClient } from "../configs/redisConfig.js";

const destroySession = async (req: Request): Promise<successResponseJson | failedResponseJson> => {
    try {
        if (!req.sessionRedisKey) {
            return {status: "NOT_FOUND", message: "NO ACTIVE SESSION FOUND"};
        }

        const redisClientResponse = getRedisClient();

        if (redisClientResponse.status !== "SUCCESS") {
            return {status: "INTERNAL_SERVER_ERROR", message: "FAILED TO GET REDIS CLIENT"};
        }

        const redisClient = redisClientResponse.client;

        // Delete session from Redis.
        await redisClient.del(req.sessionRedisKey);

        // Prevent dynamicSession from saving the deleted session again.
        req.sessionDestroyed = true;

        // Clear session information from the current request.
        req.session = undefined;
        req.sessionID = undefined;
        req.sessionRedisKey = undefined;
        req.sessionPortal = undefined;

        return {
            status: "SUCCESS",
            message: "SESSION DESTROYED SUCCESSFULLY"
        };

    } catch (error) {
        console.error("Session destroy error:", error);

        return {
            status: "INTERNAL_SERVER_ERROR",
            message: "FAILED TO DESTROY SESSION",
            error
        };
    }
};

export default destroySession;
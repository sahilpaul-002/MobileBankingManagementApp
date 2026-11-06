import type {sessionItemsTypes, SessionPortal} from "./sessionTypes.js";

declare global {
    namespace Express {
        interface Request {
            session: sessionItemsTypes | undefined;
            sessionID: string | undefined;
            sessionRedisKey: string | undefined;
            sessionPortal: SessionPortal | undefined;
            sessionDestroyed: boolean;
        }
    }
}

export { };
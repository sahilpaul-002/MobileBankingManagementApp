
import type { SessionConfigMap } from "../types/sessionTypes.js";

// const SESSION_TTL = 60 * 12;
const SESSION_TTL = 60;

const buildSession = (): SessionConfigMap => ({
    BUSINESS: {
        prefix: "BMA_Business_Session",
        ttl: SESSION_TTL
    },
    ADMIN: {
        prefix: "BMA_Admin_Session",
        ttl: SESSION_TTL
    },
    USER: {
        prefix: "BMA_User_Session",
        ttl: SESSION_TTL
    }
});

export default buildSession;


export type UserType = "ADMIN" | "USER" | "MASTER_ADMIN";

export type SessionPortal = "BUSINESS" | "ADMIN" | "USER";

export interface sessionDataTypes {
    domainName: string;
    dashboardName: string;
    baseUrl: string;
    m2pAllowed: boolean;
    p2pAllowed: boolean;
    adminEmail: string;
    requestXApiKey: string;
    accessToken: string;
}

export interface sessionMetaTypes {
    clientIp: string;
    deviceId: string;
    userAgent?: string;
    createdAt?: number;
}

export interface userConfigurationTypes {
    businessName: string;
    programType: string;
    businessId: string;
    programId: "MBMA010" | "VBMA010";
    agentCode: string;
    subAgentCode: string;
}

export interface headerKeysType {
    publicKey: string;
    privateKey: string;
}

export interface sessionItemsTypes {
    initiated: boolean;
    lastActivity: number;
    valid: boolean;
    publicKey: string;
    privateKey: string;
    encryptionKey: string;
    userEmail: string;
    userConfiguration: userConfigurationTypes;
    userName: string;
    userId?: string;
    passwordHash: string;
    userType: UserType;
    is2faVerified: boolean;
    headerKeys: headerKeysType;
    cardholderId?: string | null;
    walletId?: string;
    sessiondata: sessionDataTypes;
    meta?: sessionMetaTypes;
}

export interface SessionConfig {
    prefix: string;
    ttl: number;
}

export type SessionConfigMap = Record<SessionPortal, SessionConfig>;
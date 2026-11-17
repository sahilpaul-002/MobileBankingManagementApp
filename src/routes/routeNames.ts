export const ROUTE_NAMES = {
  INDEX: "/",
  PRIVACY_POLICY: "/privacy-policy",
  SERVICE_UNAVAILABLE: "/service-unavailable",
  SITEMAP: "/_sitemap",

  // Authentication
  AUTH: "/(auth)",
  SIGN_IN: "/",
  SIGN_UP: "/signUp",
  // SIGN_UP: "/(auth)/signUp",

  SELECT_2FA_METHOD: "/(auth)/select2FaMethod",

  EMAIL_VERIFICATION: {
    SEND_CODE: "/(auth)/email-verification/send-code",
    VERIFY_CODE: "/(auth)/email-verification/verify-code",
  },

  RESET_PASSWORD: {
    SEND_CODE: "/(auth)/reset-password/send-code",
    VERIFY_CODE: "/(auth)/reset-password/verify-code",
  },

  TWO_FA: {
    SEND_CODE: "/(auth)/two-fa/send-code/[twoFatype]",
    VERIFY_CODE: "/(auth)/two-fa/verify-code/[twoFatype]",
  },

  // Dashboard
  DASHBOARD: "/dashboard",

  WALLETS: {
    INDEX: "/dashboard/wallets",
    DEPOSIT: "/dashboard/wallets/deposit",
    STATEMENTS: "/dashboard/wallets/statements",
    CURRENCY_CONVERSION: "/dashboard/wallets/currencyConversion",
  },

  CARDS: {
    INDEX: "/dashboard/cards",
    MANAGE_CARDS: "/dashboard/cards/manageCards",
    MANAGE_CARD_DETAILS: "/dashboard/cards/manageCards/[id]",
  },

  USER: {
    INDEX: "/dashboard/user",
    DETAILS: "/dashboard/user/details",
    VERIFICATION: "/dashboard/user/verification",
  },
} as const;

import type { Request, Response, NextFunction } from "express";
import type { failedResponseJson, successResponseJson } from "../types/responseJson.js";
import verifyJwtAuth from "../utils/verifyJwtAuth.js";
import extractJwtTokenValue from "./extractJwtTokenValue.js";
import {
  AppErrorClass,
  ServiceError,
  UnauthenticatedError,
  UnauthorizedError
} from "./AppErrorClass.js";
import logger from "./logger.js";

const jwtAuthTokenValidation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<failedResponseJson> | void> => {

  // Skip authentication for selected paths
  const excludedPaths = [
    "/sendResetPasswordCode",
    "/verifyResetPasswordCode"
  ];

  if (
    excludedPaths.some(
      path => req.path === path || req.path.startsWith(path + "/")
    )
  ) {
    return next();
  }

  try {
    // Read JWT tokens from request headers
    const jwtAuthToken = req.get("x-auth-token");
    const jwtRefreshToken = req.get("x-refresh-token");

    if (!jwtAuthToken || !jwtRefreshToken) {
      throw new UnauthenticatedError("Missing authentication or refresh token");
    }

    // Get session details
    const sessionAccessToken = req.session?.sessiondata?.accessToken;
    const sessionUserType = req.session?.userType;
    const sessionProgramId = req.session?.userConfiguration?.programId;
    const sessionBusinessId = req.session?.userConfiguration?.businessId;

    if (
      !sessionAccessToken ||
      !sessionUserType ||
      !sessionProgramId ||
      !sessionBusinessId
    ) {
      throw new UnauthenticatedError("Session not authenticated");
    }

    if (!jwtAuthToken || !jwtRefreshToken) {
      throw new UnauthenticatedError("Missing authentication or refresh token");
    }

    // Extract original access token value
    const jwtTokenVerificationResult: successResponseJson =
      await extractJwtTokenValue(sessionAccessToken);

    if (jwtTokenVerificationResult.status !== "SUCCESS") {
      throw new ServiceError("Failed to extract JWT token value");
    }

    const accessToken = (
      jwtTokenVerificationResult.data as {
        jwtTokenValue?: string
      }
    )?.jwtTokenValue;

    if (!accessToken) {
      throw new ServiceError("JWT access token value is missing");
    }

    // Get JWT secret
    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    if (!jwtSecretKey) {
      throw new ServiceError("JWT secret unavailable");
    }

    // Verify authentication and refresh tokens
    const jwtAuthVerifyResponse = await verifyJwtAuth(
      jwtAuthToken,
      jwtRefreshToken,
      accessToken,
      sessionUserType,
      jwtSecretKey,
      sessionProgramId,
      sessionBusinessId
    );

    // Handle refreshed access token
    if (jwtAuthVerifyResponse.status === "NEW_TOKEN") {

      // Send new auth token through response header
      res.setHeader("X-Auth-Token", jwtAuthVerifyResponse.jwtAuthToken);

      return next();
    }

    if (jwtAuthVerifyResponse.status !== "SUCCESS") {
      throw new UnauthorizedError(
        jwtAuthVerifyResponse.message ??
        "Error occurred while verifying authentication token"
      );
    }

    // Validate JWT payload
    const jwtAuthData = jwtAuthVerifyResponse.jwtAuthData;

    if (
      jwtAuthData.accessToken !== accessToken ||
      jwtAuthData.userType !== sessionUserType
    ) {
      throw new UnauthorizedError(
        "Invalid or tampered authentication token"
      );
    }

    return next();

  } catch (err) {
    const error = err as any;
    const errorStatus = error?.status || "UnknownErrorStatus";

    logger.error(error, {
      serviceName: "JwtAuthValidation"
    });

    if (error instanceof AppErrorClass) {
      throw error;
    }

    throw new ServiceError(
      `JwtAuthValidation facing issue: [${errorStatus}] ${error.message}`,
      error?.error ? error.error : error
    );
  }
};

export default jwtAuthTokenValidation;

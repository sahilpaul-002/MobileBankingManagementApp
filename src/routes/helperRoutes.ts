import express from "express";
import type { Router } from "express";
import { checkTimeoutApi, destroySessionController, getSession, healthCheck, insertDDocumentIntoCollection } from "../controllers/helperConteroller.js";
import asyncRequestHandler from "../middlewares/asyncRequestHandler.js";

const router: Router = express.Router();

// Use asyncRequestHandler when try/catch is not used for async request
router.get("/health", healthCheck);
router.get("/get-session", getSession);
router.get("/destroy-session", destroySessionController);
router.get("/check-timeout", asyncRequestHandler(checkTimeoutApi));
router.post("/insertDocument", asyncRequestHandler(insertDDocumentIntoCollection));

export default router;
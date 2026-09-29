import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
    disableMfa,
    enableMfa,
    regenerateBackupCodes,
    setupMfa,
    verifyMfa,
} from "../controllers/mfa.controller.js";

const setupMfaLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 5 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const enableMfaLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 5 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const verifyMfaLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 5 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const disableMfaLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 5 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const regenerateBackupCodesLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 5 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const router = Router();

router.post("/setup", setupMfaLimiter, authenticateToken, setupMfa);
router.post("/enable", enableMfaLimiter, authenticateToken, enableMfa);
router.post("/verify", verifyMfaLimiter, verifyMfa);
router.post("/disable", disableMfaLimiter, authenticateToken, disableMfa);
router.post(
    "/regenerate-backup-codes",
    regenerateBackupCodesLimiter,
    authenticateToken,
    regenerateBackupCodes,
);

export default router;

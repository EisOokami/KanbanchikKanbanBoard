import { rateLimitHandler } from "../middlewares/securityAudit.middleware.js";
import { userOrIpKey } from "../utils/rateLimitKeys.js";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
    generateInvite,
    acceptInvite,
    memberInvite,
} from "../controllers/invites.controller.js";
import { verifyCsrf } from "../middlewares/csrf.middleware.js";

const generateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    handler: rateLimitHandler,
});

const acceptLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    handler: rateLimitHandler,
});

const memberInviteLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    handler: rateLimitHandler,
});

const router = Router();

router.post(
    "/generate/:id",
    generateLimiter,
    authenticateToken,
    verifyCsrf,
    generateInvite,
);
router.post(
    "/accept",
    acceptLimiter,
    authenticateToken,
    verifyCsrf,
    acceptInvite,
);
router.post(
    "/member",
    memberInviteLimiter,
    authenticateToken,
    verifyCsrf,
    memberInvite,
);

export default router;

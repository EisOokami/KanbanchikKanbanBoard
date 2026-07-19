import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../middlewares/auth.middleware";
import {
    generateInvite,
    acceptInvite,
    memberInvite,
} from "../controllers/invites.controller";
import { verifyCsrf } from "../middlewares/csrf.middleware";

const generateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const acceptLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const memberInviteLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
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

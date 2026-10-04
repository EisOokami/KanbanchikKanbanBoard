import { rateLimitHandler } from "../middlewares/securityAudit.middleware.js";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
    deleteAccount,
    me,
    changePassword,
    updateProfile,
    setPassword,
} from "../controllers/users.controller.js";
import { validateData } from "../middlewares/validation.middleware.js";
import {
    changePasswordSchema,
    setPasswordSchema,
    updateProfileSchema,
} from "../validation/validation.js";
import { verifyCsrf } from "../middlewares/csrf.middleware.js";
import { validateEmailMiddleware } from "../middlewares/emailValidation.middleware.js";

const updateProfileLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

const changePasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

const deleteAccountLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

const setPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

const router = Router();

router.get("/me", authenticateToken, me);
router.post(
    "/update-profile",
    updateProfileLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(updateProfileSchema),
    validateEmailMiddleware,
    updateProfile,
);
router.post(
    "/change-password",
    changePasswordLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(changePasswordSchema),
    changePassword,
);
router.delete(
    "/:id",
    deleteAccountLimiter,
    authenticateToken,
    verifyCsrf,
    deleteAccount,
);
router.post(
    "/set-password",
    setPasswordLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(setPasswordSchema),
    setPassword,
);

export default router;

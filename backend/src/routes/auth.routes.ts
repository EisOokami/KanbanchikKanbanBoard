import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
    forgotPassword,
    googleAuthCallback,
    googleAuthExchange,
    googleAuthStart,
    login,
    logout,
    refresh,
    register,
    resetPassword,
} from "../controllers/auth.controller";
import { validateData } from "../middlewares/validation.middleware";
import {
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
} from "../validation/validation";
import { verifyCsrf } from "../middlewares/csrf.middleware";

const registerLimiter = rateLimit({
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

const loginLimiter = rateLimit({
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

const forgotPasswordLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 3,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 30 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const resetPasswordLimiter = rateLimit({
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

const googleAuthExchangeLimiter = rateLimit({
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

router.post(
    "/register",
    registerLimiter,
    validateData(registerSchema),
    register,
);
router.post("/login", loginLimiter, validateData(loginSchema), login);
router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    validateData(forgotPasswordSchema),
    forgotPassword,
);
router.post(
    "/reset-password",
    resetPasswordLimiter,
    validateData(resetPasswordSchema),
    resetPassword,
);
router.post("/refresh", verifyCsrf, refresh);
router.post("/logout", verifyCsrf, logout);
router.get("/google", googleAuthStart);
router.get("/google/callback", googleAuthCallback);
router.post("/google/exchange", googleAuthExchangeLimiter, googleAuthExchange);

export default router;

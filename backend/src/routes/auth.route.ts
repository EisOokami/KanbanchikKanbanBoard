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
    resendLoginEmailCode,
    resendVerificationEmail,
    resetPassword,
    verifyEmail,
    verifyLoginEmailCode,
} from "../controllers/auth.controller.js";
import { validateData } from "../middlewares/validation.middleware.js";
import {
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
    resendEmailCodeSchema,
    resendVerificationSchema,
    resetPasswordSchema,
    verifyEmailCodeSchema,
} from "../validation/validation.js";
import { verifyCsrf } from "../middlewares/csrf.middleware.js";
import { validateEmailMiddleware } from "../middlewares/emailValidation.middleware.js";

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

const verifyLoginEmailCodeLimiter = rateLimit({
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

const resendLoginEmailCodeLimiter = rateLimit({
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

const verifyEmailLimiter = rateLimit({
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

const resendVerificationLimiter = rateLimit({
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
    validateEmailMiddleware,
    register,
);
router.get("/verify-email", verifyEmailLimiter, verifyEmail);
router.post(
    "/resend-verification",
    resendVerificationLimiter,
    validateData(resendVerificationSchema),
    validateEmailMiddleware,
    resendVerificationEmail,
);
router.post(
    "/login",
    loginLimiter,
    validateData(loginSchema),
    validateEmailMiddleware,
    login,
);
router.post(
    "/login/email-code/verify",
    verifyLoginEmailCodeLimiter,
    validateData(verifyEmailCodeSchema),
    verifyLoginEmailCode,
);
router.post(
    "/login/email-code/resend",
    resendLoginEmailCodeLimiter,
    validateData(resendEmailCodeSchema),
    resendLoginEmailCode,
);
router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    validateData(forgotPasswordSchema),
    validateEmailMiddleware,
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

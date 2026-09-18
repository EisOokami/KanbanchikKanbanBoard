import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../middlewares/auth.middleware";
import {
    deleteAccount,
    me,
    changePassword,
    updateProfile,
    setPassword,
} from "../controllers/users.controller";
import { validateData } from "../middlewares/validation.middleware";
import {
    changePasswordSchema,
    setPasswordSchema,
    updateProfileSchema,
} from "../validation/validation";
import { verifyCsrf } from "../middlewares/csrf.middleware";

const updateProfileLimiter = rateLimit({
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

const changePasswordLimiter = rateLimit({
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

const deleteLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 60 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const setPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 60 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const router = Router();

router.get("/me", authenticateToken, me);
router.post(
    "/update-profile",
    updateProfileLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(updateProfileSchema),
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
    deleteLimiter,
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

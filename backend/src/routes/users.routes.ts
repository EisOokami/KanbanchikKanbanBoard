import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authenticateToken } from "../middleware/auth.middleware";
import {
    deleteAccount,
    me,
    changePassword,
    updateProfile,
} from "../controllers/users.controller";
import { validateData } from "../middleware/validation.middleware";
import {
    changePasswordSchema,
    updateProfileSchema,
} from "../validation/validation";

const updateProfileLimiter = rateLimit({
    windowMs: 30 * 60 * 1000,
    limit: 3,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 15 minutes.",
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
        message: "Too many requests. Please try again in 15 minutes.",
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
        message: "Too many requests. Please try again in 15 minutes.",
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
    validateData(updateProfileSchema),
    updateProfile,
);
router.post(
    "/change-password",
    changePasswordLimiter,
    authenticateToken,
    validateData(changePasswordSchema),
    changePassword,
);
router.delete("/:id", deleteLimiter, authenticateToken, deleteAccount);

export default router;

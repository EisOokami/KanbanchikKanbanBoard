import { Router } from "express";
import rateLimit from "express-rate-limit";
import { upload } from "../middleware/uploads.middleware";
import { authenticateToken } from "../middleware/auth.middleware";
import {
    deleteAttachment,
    deleteAvatar,
    getAttachments,
    uploadAvatar,
    uploadMultiple,
    uploadSingle,
} from "../controllers/uploads.controller";

const singleUploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const avatarUploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const multipleUploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const deleteAttachmentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const deleteAvatarLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const router = Router();

router.get("/", authenticateToken, getAttachments);
router.post(
    "/",
    authenticateToken,
    singleUploadLimiter,
    upload.single("file"),
    uploadSingle,
);
router.post(
    "/avatar",
    authenticateToken,
    avatarUploadLimiter,
    upload.single("file"),
    uploadAvatar,
);
router.post(
    "/multiple",
    authenticateToken,
    multipleUploadLimiter,
    upload.array("files"),
    uploadMultiple,
);
router.delete("/avatar", authenticateToken, deleteAvatarLimiter, deleteAvatar);
router.delete(
    "/:id",
    authenticateToken,
    deleteAttachmentLimiter,
    deleteAttachment,
);

export default router;

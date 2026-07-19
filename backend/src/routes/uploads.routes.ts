import { Router } from "express";
import rateLimit from "express-rate-limit";
import { upload } from "../middlewares/uploads.middleware";
import { authenticateToken } from "../middlewares/auth.middleware";
import {
    deleteAttachment,
    deleteAvatar,
    getAttachments,
    uploadAvatar,
    uploadMultiple,
    uploadSingle,
} from "../controllers/uploads.controller";
import {
    filesValidation,
    fileValidation,
} from "../middlewares/fileValidation.middleware";
import { verifyCsrf } from "../middlewares/csrf.middleware";

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
    verifyCsrf,
    singleUploadLimiter,
    upload.single("file"),
    fileValidation,
    uploadSingle,
);
router.post(
    "/avatar",
    authenticateToken,
    verifyCsrf,
    avatarUploadLimiter,
    upload.single("file"),
    fileValidation,
    uploadAvatar,
);
router.post(
    "/multiple",
    authenticateToken,
    verifyCsrf,
    multipleUploadLimiter,
    upload.array("files"),
    filesValidation,
    uploadMultiple,
);
router.delete(
    "/avatar",
    authenticateToken,
    verifyCsrf,
    deleteAvatarLimiter,
    deleteAvatar,
);
router.delete(
    "/:id",
    authenticateToken,
    verifyCsrf,
    deleteAttachmentLimiter,
    deleteAttachment,
);

export default router;

import { rateLimitHandler } from "../middlewares/securityAudit.middleware.js";
import { userOrIpKey } from "../utils/rateLimitKeys.js";
import { Router } from "express";
import rateLimit from "express-rate-limit";
import { upload } from "../middlewares/uploads.middleware.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
    deleteAttachment,
    deleteAvatar,
    getAttachments,
    uploadAvatar,
    uploadMultiple,
    uploadSingle,
} from "../controllers/uploads.controller.js";
import {
    filesValidation,
    fileValidation,
} from "../middlewares/fileValidation.middleware.js";
import { verifyCsrf } from "../middlewares/csrf.middleware.js";

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
    keyGenerator: userOrIpKey,
    handler: rateLimitHandler,
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
    keyGenerator: userOrIpKey,
    handler: rateLimitHandler,
});

const multipleUploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    handler: rateLimitHandler,
});

const deleteAttachmentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    handler: rateLimitHandler,
});

const deleteAvatarLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: userOrIpKey,
    handler: rateLimitHandler,
});

const router = Router();

router.get("/", authenticateToken, getAttachments);
router.post(
    "/",
    singleUploadLimiter,
    authenticateToken,
    verifyCsrf,
    upload.single("file"),
    fileValidation,
    uploadSingle,
);
router.post(
    "/avatar",
    avatarUploadLimiter,
    authenticateToken,
    verifyCsrf,
    upload.single("file"),
    fileValidation,
    uploadAvatar,
);
router.post(
    "/multiple",
    multipleUploadLimiter,
    authenticateToken,
    verifyCsrf,
    upload.array("files"),
    filesValidation,
    uploadMultiple,
);
router.delete(
    "/avatar",
    deleteAvatarLimiter,
    authenticateToken,
    verifyCsrf,
    deleteAvatar,
);
router.delete(
    "/:id",
    deleteAttachmentLimiter,
    authenticateToken,
    verifyCsrf,
    deleteAttachment,
);

export default router;

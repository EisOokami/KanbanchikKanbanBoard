import { rateLimitHandler } from "../middlewares/securityAudit.middleware.js";
import { Router } from "express";
import {
    changeRole,
    confirmOwnershipTransfer,
    createProject,
    deleteMember,
    deleteProject,
    exportProjectData,
    generateProjectSummary,
    getProject,
    getProjects,
    initiateOwnershipTransfer,
    reorderColumns,
    resendOwnershipTransferCode,
    updateProject,
} from "../controllers/projects.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
    changeRoleSchema,
    confirmOwnershipTransferSchema,
    createProjectSchema,
    reorderColumnsSchema,
    resendOwnershipTransferSchema,
    transferOwnershipSchema,
    updateProjectSchema,
} from "../validation/validation.js";
import { validateData } from "../middlewares/validation.middleware.js";
import { verifyCsrf } from "../middlewares/csrf.middleware.js";
import rateLimit from "express-rate-limit";

const createProjectLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

const updateProjectLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

const changeRoleLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

const deleteMemberLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

const updateTaskCommentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

const initiateOwnershipTransferLimiter = rateLimit({
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

const confirmOwnershipTransferLimiter = rateLimit({
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

const resendOwnershipTransferCodeLimiter = rateLimit({
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

const aiSummaryLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 5,
    message: {
        status: "error",
        message: "Too many summary requests. Please try again in a minute.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitHandler,
});

const router = Router();

router.get("/", authenticateToken, getProjects);
router.get("/:slug", authenticateToken, getProject);
router.get("/:id/export", authenticateToken, exportProjectData);
router.post(
    "/",
    createProjectLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(createProjectSchema),
    createProject,
);
router.put(
    "/:slug",
    updateProjectLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(updateProjectSchema),
    updateProject,
);
router.delete("/:slug", authenticateToken, verifyCsrf, deleteProject);
router.post(
    "/change-role/:slug",
    changeRoleLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(changeRoleSchema),
    changeRole,
);
router.delete(
    "/delete-member/:id",
    deleteMemberLimiter,
    authenticateToken,
    verifyCsrf,
    deleteMember,
);
router.patch(
    "/:id/columns/reorder",
    updateTaskCommentLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(reorderColumnsSchema),
    reorderColumns,
);
router.post(
    "/transfer-ownership/:slug/initiate",
    initiateOwnershipTransferLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(transferOwnershipSchema),
    initiateOwnershipTransfer,
);
router.post(
    "/transfer-ownership/:slug/confirm",
    confirmOwnershipTransferLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(confirmOwnershipTransferSchema),
    confirmOwnershipTransfer,
);
router.post(
    "/transfer-ownership/:slug/resend-code",
    resendOwnershipTransferCodeLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(resendOwnershipTransferSchema),
    resendOwnershipTransferCode,
);
router.post(
    "/:id/ai/summary",
    aiSummaryLimiter,
    authenticateToken,
    verifyCsrf,
    generateProjectSummary,
);

export default router;

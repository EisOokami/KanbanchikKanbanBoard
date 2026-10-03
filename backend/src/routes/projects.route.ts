import { Router } from "express";
import {
    changeRole,
    createProject,
    deleteMember,
    deleteProject,
    exportProjectData,
    getProject,
    getProjects,
    transferOwnership,
    updateProject,
} from "../controllers/projects.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
    changeRoleSchema,
    createProjectSchema,
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
});

const transferOwnershipLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
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
router.post(
    "/transfer-ownership/:slug",
    transferOwnershipLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(transferOwnershipSchema),
    transferOwnership,
);
router.delete(
    "/delete-member/:id",
    deleteMemberLimiter,
    authenticateToken,
    verifyCsrf,
    deleteMember,
);

export default router;

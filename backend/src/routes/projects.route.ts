import { Router } from "express";
import {
    changeRole,
    createProject,
    deleteMember,
    deleteProject,
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
    windowMs: 5 * 60 * 1000,
    limit: 20,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 5 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const updateProjectLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 20,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 5 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const changeRoleLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 10,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 5 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const transferOwnershipLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 3,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 5 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const deleteMemberLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 3,
    message: {
        status: 429,
        error: "Too many requests",
        message: "Too many requests. Please try again in 5 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const router = Router();

router.get("/", authenticateToken, getProjects);
router.get("/:slug", authenticateToken, getProject);
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

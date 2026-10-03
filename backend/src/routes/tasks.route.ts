import { Router } from "express";
import {
    createTask,
    deleteTask,
    getTaskById,
    getTaskFilterOptions,
    getTasks,
    moveTask,
    updateTask,
} from "../controllers/tasks.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { validateData } from "../middlewares/validation.middleware.js";
import {
    createTaskSchema,
    moveTaskSchema,
    updateTaskSchema,
} from "../validation/validation.js";
import { verifyCsrf } from "../middlewares/csrf.middleware.js";
import rateLimit from "express-rate-limit";

const createTaskLimiter = rateLimit({
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

const updateTaskLimiter = rateLimit({
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

const moveTaskLimiter = rateLimit({
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

const deleteTaskLimiter = rateLimit({
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

router.get("/", authenticateToken, getTasks);
router.get("/filter-options", authenticateToken, getTaskFilterOptions);
router.get("/:id", authenticateToken, getTaskById);
router.post(
    "/",
    createTaskLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(createTaskSchema),
    createTask,
);
router.put(
    "/:id",
    updateTaskLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(updateTaskSchema),
    updateTask,
);
router.delete(
    "/:id",
    deleteTaskLimiter,
    authenticateToken,
    verifyCsrf,
    deleteTask,
);
router.patch(
    "/:id/move",
    moveTaskLimiter,
    authenticateToken,
    verifyCsrf,
    validateData(moveTaskSchema),
    moveTask,
);

export default router;

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

const router = Router();

router.get("/", authenticateToken, getTasks);
router.get("/filter-options", authenticateToken, getTaskFilterOptions);
router.get("/:id", authenticateToken, getTaskById);
router.post(
    "/",
    authenticateToken,
    verifyCsrf,
    validateData(createTaskSchema),
    createTask,
);
router.put(
    "/:id",
    authenticateToken,
    verifyCsrf,
    validateData(updateTaskSchema),
    updateTask,
);
router.delete("/:id", authenticateToken, verifyCsrf, deleteTask);
router.patch(
    "/:id/move",
    authenticateToken,
    verifyCsrf,
    validateData(moveTaskSchema),
    moveTask,
);

export default router;

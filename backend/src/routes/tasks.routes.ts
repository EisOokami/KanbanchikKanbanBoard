import { Router } from "express";
import {
    createTask,
    deleteTask,
    getTaskById,
    getTaskFilterOptions,
    getTasks,
    updateTask,
} from "../controllers/tasks.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { validateData } from "../middleware/validation.middleware";
import {
    createTaskSchema,
    updateTaskSchema,
    validateIdSchema,
} from "../validation/validation";

const router = Router();

router.get(
    "/",
    authenticateToken,
    getTasks,
);
router.get(
    "/filter-options",
    getTaskFilterOptions,
);
router.get(
    "/:id",
    authenticateToken,
    getTaskById,
);
router.post("/", authenticateToken, validateData(createTaskSchema), createTask);
router.put("/", authenticateToken, validateData(updateTaskSchema), updateTask);
router.delete(
    "/:id",
    authenticateToken,
    validateData(validateIdSchema),
    deleteTask,
);

export default router;

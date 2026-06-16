import { Router } from "express";
import {
    createTask,
    deleteTask,
    getTaskById,
    getTaskFilterOptions,
    getTasks,
    moveTask,
    updateTask,
} from "../controllers/tasks.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { validateData } from "../middleware/validation.middleware";
import {
    createTaskSchema,
    moveTaskSchema,
    updateTaskSchema,
} from "../validation/validation";

const router = Router();

router.get("/", authenticateToken, getTasks);
router.get("/filter-options", authenticateToken, getTaskFilterOptions);
router.get("/:id", authenticateToken, getTaskById);
router.post("/", authenticateToken, validateData(createTaskSchema), createTask);
router.put(
    "/:id",
    authenticateToken,
    validateData(updateTaskSchema),
    updateTask,
);
router.delete("/:id", authenticateToken, deleteTask);
router.patch(
    "/:id/move",
    authenticateToken,
    validateData(moveTaskSchema),
    moveTask,
);

export default router;

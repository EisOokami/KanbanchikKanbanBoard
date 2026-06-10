import { Router } from "express";
import {
    createTask,
    deleteTask,
    getTaskById,
    getTasks,
    updateTask,
} from "../controllers/tasks.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import {
    createTaskSchema,
    updateTaskSchema,
    validateIdSchema,
} from "../validation/validation";
import { validateData } from "../middleware/validation.middleware";

const router = Router();

router.get("/", authenticateToken, getTasks);
router.get(
    "/:id",
    authenticateToken,
    validateData(validateIdSchema),
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

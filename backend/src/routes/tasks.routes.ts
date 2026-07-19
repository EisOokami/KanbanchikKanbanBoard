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
import { authenticateToken } from "../middlewares/auth.middleware";
import { validateData } from "../middlewares/validation.middleware";
import {
    createTaskSchema,
    moveTaskSchema,
    updateTaskSchema,
} from "../validation/validation";
import { verifyCsrf } from "../middlewares/csrf.middleware";

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

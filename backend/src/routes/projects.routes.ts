import { Router } from "express";
import {
    createProject,
    deleteProject,
    getProjectById,
    getProjects,
    updateProject,
} from "../controllers/projects.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import {
    createProjectSchema,
    updateProjectSchema,
    validateIdSchema,
} from "../validation/validation";
import { validateData } from "../middleware/validation.middleware";

const router = Router();

router.get("/", authenticateToken, getProjects);
router.get("/:id", authenticateToken, getProjectById);
router.post(
    "/",
    authenticateToken,
    validateData(createProjectSchema),
    createProject,
);
router.put(
    "/:id",
    authenticateToken,
    validateData(updateProjectSchema),
    updateProject,
);
router.delete("/:id", authenticateToken, deleteProject);

export default router;

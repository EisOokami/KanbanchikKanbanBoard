import { Router } from "express";
import {
    createProject,
    deleteProject,
    getProjectById,
    getProjects,
    updateProject,
} from "../controllers/projects.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { validateData } from "../middleware/validation.middleware";
import {
    createProjectSchema,
    updateProjectSchema,
    validateIdSchema,
} from "../validation/validation";

const router = Router();

router.get("/", authenticateToken, getProjects);
router.get(
    "/:id",
    authenticateToken,
    validateData(validateIdSchema),
    getProjectById,
);
router.post(
    "/",
    authenticateToken,
    validateData(createProjectSchema),
    createProject,
);
router.put(
    "/",
    authenticateToken,
    validateData(updateProjectSchema),
    updateProject,
);
router.delete(
    "/:id",
    authenticateToken,
    validateData(validateIdSchema),
    deleteProject,
);

export default router;

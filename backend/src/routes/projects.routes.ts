import { Router } from "express";
import {
    changeRole,
    createProject,
    deleteProject,
    getProject,
    getProjects,
    updateProject,
} from "../controllers/projects.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import {
    changeRoleSchema,
    createProjectSchema,
    updateProjectSchema,
} from "../validation/validation";
import { validateData } from "../middleware/validation.middleware";

const router = Router();

router.get("/", authenticateToken, getProjects);
router.get("/:slug", authenticateToken, getProject);
router.post(
    "/",
    authenticateToken,
    validateData(createProjectSchema),
    createProject,
);
router.put(
    "/:slug",
    authenticateToken,
    validateData(updateProjectSchema),
    updateProject,
);
router.delete("/:slug", authenticateToken, deleteProject);
router.put(
    "/change-role/:slug",
    authenticateToken,
    validateData(changeRoleSchema),
    changeRole,
);

export default router;

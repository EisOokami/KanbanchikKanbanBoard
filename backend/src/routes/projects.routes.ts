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
} from "../controllers/projects.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import {
    changeRoleSchema,
    createProjectSchema,
    transferOwnershipSchema,
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
router.post(
    "/change-role/:slug",
    authenticateToken,
    validateData(changeRoleSchema),
    changeRole,
);
router.post(
    "/transfer-ownership/:slug",
    authenticateToken,
    validateData(transferOwnershipSchema),
    transferOwnership,
);
router.delete("/delete-member/:id", authenticateToken, deleteMember);

export default router;

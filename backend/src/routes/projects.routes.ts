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
import { authenticateToken } from "../middlewares/auth.middleware";
import {
    changeRoleSchema,
    createProjectSchema,
    transferOwnershipSchema,
    updateProjectSchema,
} from "../validation/validation";
import { validateData } from "../middlewares/validation.middleware";
import { verifyCsrf } from "../middlewares/csrf.middleware";

const router = Router();

router.get("/", authenticateToken, getProjects);
router.get("/:slug", authenticateToken, getProject);
router.post(
    "/",
    authenticateToken,
    verifyCsrf,
    validateData(createProjectSchema),
    createProject,
);
router.put(
    "/:slug",
    authenticateToken,
    verifyCsrf,
    validateData(updateProjectSchema),
    updateProject,
);
router.delete("/:slug", authenticateToken, verifyCsrf, deleteProject);
router.post(
    "/change-role/:slug",
    authenticateToken,
    verifyCsrf,
    validateData(changeRoleSchema),
    changeRole,
);
router.post(
    "/transfer-ownership/:slug",
    authenticateToken,
    verifyCsrf,
    validateData(transferOwnershipSchema),
    transferOwnership,
);
router.delete(
    "/delete-member/:id",
    authenticateToken,
    verifyCsrf,
    deleteMember,
);

export default router;

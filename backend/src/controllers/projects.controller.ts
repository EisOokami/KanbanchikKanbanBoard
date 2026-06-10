import { pool } from "../db/pool";
import type { Request, Response } from "express";
import type { ResultSetHeader } from "mysql2";
import { ZodError } from "zod";
import type {
    Category,
    Column,
    IGetUserRequest,
    Label,
    Project,
    User,
} from "../types/types";
import {
    createProjectSchema,
    updateProjectSchema,
} from "../validation/validation";

export const getProjects = async (req: IGetUserRequest, res: Response) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        const [projects] = await pool.execute<Project[]>(
            `
                SELECT 
                    p.id, 
                    p.owner_id,
                    p.name, 
                    p.icon, 
                    p.color, 
                    p.description, 
                    p.status,
                    p.created_at,
                    p.updated_at,
                    COUNT(DISTINCT pm.user_id) as member_count,
                    COUNT(DISTINCT c.id) as column_count,
                    COUNT(DISTINCT t.id) as task_count
                FROM projects p
                LEFT JOIN project_members pm ON p.id = pm.project_id
                LEFT JOIN columns c ON p.id = c.project_id
                LEFT JOIN tasks t ON c.id = t.column_id
                WHERE p.id IN (
                    SELECT project_id FROM project_members WHERE user_id = ?
                ) OR p.owner_id = ?
                GROUP BY p.id
                ORDER BY p.updated_at DESC
            `,
            [userId, userId],
        );

        res.status(200).json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Database error" });
    }
};

export const getProjectById = async (req: IGetUserRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!id) {
            res.status(400).json({
                status: "error",
                message: "Invalid project ID",
            });

            return;
        }

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        const [projects] = await pool.execute<Project[]>(
            `
                SELECT 
                    p.id, 
                    p.owner_id,
                    p.name, 
                    p.icon, 
                    p.color, 
                    p.description, 
                    p.status,
                    p.created_at,
                    p.updated_at
                FROM projects p
                WHERE p.id = ? AND (p.owner_id = ? OR p.id IN (
                    SELECT project_id FROM project_members WHERE user_id = ?
                ))
            `,
            [id, userId, userId],
        );

        if (!projects.length) {
            res.status(404).json({
                status: "error",
                message: "Project not found",
            });

            return;
        }

        const project = projects[0];

        if (!project) {
            res.status(404).json({
                status: "error",
                message: "Project not found",
            });

            return;
        }

        const [columns] = await pool.execute<Column[]>(
            `
                SELECT id, name, position, wip_limit, created_at, updated_at
                FROM columns
                WHERE project_id = ?
                ORDER BY position ASC
            `,
            [id],
        );

        const [categories] = await pool.execute<Category[]>(
            `
                SELECT id, name, description, color, created_at, updated_at
                FROM categories
                WHERE project_id = ?
                ORDER BY name ASC
            `,
            [id],
        );

        const [labels] = await pool.execute<Label[]>(
            `
                SELECT id, name, color
                FROM labels
                WHERE project_id = ?
                ORDER BY name ASC
            `,
            [id],
        );

        const [members] = await pool.execute<User[]>(
            `
                SELECT 
                    pm.user_id,
                    pm.role,
                    pm.status,
                    pm.joined_at,
                    u.name,
                    u.surname,
                    u.email,
                    u.avatar_url,
                    u.color
                FROM project_members pm
                JOIN users u ON pm.user_id = u.id
                WHERE pm.project_id = ?
                ORDER BY pm.joined_at ASC
            `,
            [id],
        );

        const [ownerData] = await pool.execute<User[]>(
            `
                SELECT id, name, surname, email, avatar_url, color
                FROM users
                WHERE id = ?
            `,
            [project.owner_id],
        );

        res.status(200).json({
            ...project,
            owner: ownerData || null,
            members,
            columns,
            categories,
            labels,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Database error" });
    }
};

export const createProject = async (req: IGetUserRequest, res: Response) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        const validatedData = createProjectSchema.parse(req.body);

        const [result] = await pool.execute<ResultSetHeader>(
            `
                INSERT INTO projects (owner_id, name, icon, color, description, status)
                VALUES (?, ?, ?, ?, ?, 'active')
            `,
            [
                userId,
                validatedData.name,
                validatedData.icon,
                validatedData.color,
                validatedData.description || null,
            ],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to create project",
            });

            return;
        }

        const projectId = result.insertId;

        await pool.execute<ResultSetHeader>(
            `
                INSERT INTO project_members (project_id, user_id, role, status)
                VALUES (?, ?, 'owner', 'active')
            `,
            [projectId, userId],
        );

        const defaultColumns = [
            { name: "To Do", position: 0, wip_limit: 10 },
            { name: "In Progress", position: 1, wip_limit: 10 },
            { name: "In Review", position: 2, wip_limit: 10 },
            { name: "Done", position: 3, wip_limit: null },
        ];

        for (const col of defaultColumns) {
            await pool.execute<ResultSetHeader>(
                `
                    INSERT INTO columns (project_id, name, position, wip_limit)
                    VALUES (?, ?, ?, ?)
                `,
                [projectId, col.name, col.position, col.wip_limit],
            );
        }

        const [newProject] = await pool.execute<Project[]>(
            `
                SELECT 
                    id, 
                    owner_id,
                    name, 
                    icon, 
                    color, 
                    description, 
                    status,
                    created_at,
                    updated_at
                FROM projects
                WHERE id = ?
            `,
            [projectId],
        );

        res.status(201).json({
            status: "success",
            message: "Project created successfully",
            project: newProject,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue: any) => ({
                field: issue.path[0],
                message: issue.message,
            }));

            res.status(400).json({
                status: "error",
                message: "Invalid data",
                details: errorMessages,
            });

            return;
        }

        console.error(error);
        res.status(500).json({ status: "error", message: "Database error" });
    }
};

export const updateProject = async (req: IGetUserRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!id) {
            res.status(400).json({
                status: "error",
                message: "Invalid project ID",
            });

            return;
        }

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        const [projects] = await pool.execute<Project[]>(
            `SELECT owner_id FROM projects WHERE id = ?`,
            [id],
        );

        if (!projects.length) {
            res.status(404).json({
                status: "error",
                message: "Project not found",
            });

            return;
        }

        const project = projects[0];

        if (!project) {
            res.status(404).json({
                status: "error",
                message: "Project not found",
            });

            return;
        }

        if (project.owner_id !== userId) {
            res.status(403).json({
                status: "error",
                message: "Only project owner can update the project",
            });

            return;
        }

        const validatedData = updateProjectSchema.parse(req.body);

        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (validatedData.name) {
            updateFields.push("name = ?");
            updateValues.push(validatedData.name);
        }

        if (validatedData.icon) {
            updateFields.push("icon = ?");
            updateValues.push(validatedData.icon);
        }

        if (validatedData.color) {
            updateFields.push("color = ?");
            updateValues.push(validatedData.color);
        }

        if (validatedData.description) {
            updateFields.push("description = ?");
            updateValues.push(validatedData.description);
        }

        if (validatedData.status) {
            updateFields.push("status = ?");
            updateValues.push(validatedData.status);
        }

        if (!updateFields.length) {
            res.status(400).json({
                status: "error",
                message: "No fields to update",
            });

            return;
        }

        updateValues.push(id);

        const [result] = await pool.execute<ResultSetHeader>(
            `
                UPDATE projects
                SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `,
            updateValues,
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to update project",
            });

            return;
        }

        const [updatedProject] = await pool.execute<Project[]>(
            `
                SELECT 
                    id, 
                    owner_id,
                    name, 
                    icon, 
                    color, 
                    description, 
                    status,
                    created_at,
                    updated_at
                FROM projects
                WHERE id = ?
            `,
            [id],
        );

        res.status(200).json({
            status: "success",
            message: "Project updated successfully",
            project: updatedProject,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue: any) => ({
                field: issue.path[0],
                message: issue.message,
            }));

            res.status(400).json({
                status: "error",
                message: "Invalid data",
                details: errorMessages,
            });

            return;
        }

        console.error(error);
        res.status(500).json({ status: "error", message: "Database error" });
    }
};

export const deleteProject = async (req: IGetUserRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!id) {
            res.status(400).json({
                status: "error",
                message: "Invalid project ID",
            });

            return;
        }

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        const [projects] = await pool.execute<Project[]>(
            `SELECT owner_id FROM projects WHERE id = ?`,
            [id],
        );

        if (projects.length === 0) {
            res.status(404).json({
                status: "error",
                message: "Project not found",
            });

            return;
        }

        const project = projects[0];

        if (!project) {
            res.status(404).json({
                status: "error",
                message: "Project not found",
            });

            return;
        }

        if (project.owner_id !== userId) {
            res.status(403).json({
                status: "error",
                message: "Only project owner can delete the project",
            });

            return;
        }

        const [result] = await pool.execute<ResultSetHeader>(
            `DELETE FROM projects WHERE id = ?`,
            [id],
        );

        if (result.affectedRows === 0) {
            res.status(404).json({
                status: "error",
                message: "Project not found",
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "Project deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Database error" });
    }
};

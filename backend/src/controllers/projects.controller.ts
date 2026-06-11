import { pool } from "../db/pool";
import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { ZodError } from "zod";
import type {
    Category,
    Column,
    Comment,
    IGetUserRequest,
    Label,
    Project,
    Subtask,
    Task,
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
                    p.updated_at
                FROM projects p
                WHERE p.id IN (
                    SELECT project_id FROM project_members WHERE user_id = ?
                ) OR p.owner_id = ?
                ORDER BY p.updated_at DESC
            `,
            [userId, userId],
        );

        const enrichedProjects = await Promise.all(
            projects.map(async (project) => {
                const [owner] = await pool.execute<User[]>(
                    `
                        SELECT id, name, avatar_url
                        FROM users
                        WHERE id = ?
                    `,
                    [project.owner_id],
                );

                const [members] = await pool.execute<User[]>(
                    `
                        SELECT 
                            u.id,
                            u.name,
                            u.surname,
                            u.avatar_url,
                            u.color,
                            pm.role,
                            pm.status,
                            pm.joined_at
                        FROM project_members pm
                        JOIN users u ON pm.user_id = u.id
                        WHERE pm.project_id = ?
                        ORDER BY pm.joined_at ASC
                    `,
                    [project.id],
                );

                const [columns] = await pool.execute<Column[]>(
                    `
                        SELECT 
                            c.id,
                            c.name,
                            c.position,
                            c.wip_limit,
                            c.created_at,
                            c.updated_at
                        FROM columns c
                        WHERE c.project_id = ?
                        ORDER BY c.position ASC
                    `,
                    [project.id],
                );

                const [categories] = await pool.execute<Category[]>(
                    `
                SELECT id, name, color, created_at, updated_at
                FROM categories
                WHERE project_id = ?
                ORDER BY name ASC
            `,
                    [project.id],
                );

                const [labels] = await pool.execute<Label[]>(
                    `
                SELECT id, name, color
                FROM labels
                WHERE project_id = ?
                ORDER BY name ASC
            `,
                    [project.id],
                );

                const [taskStats] = await pool.execute<
                    ({ total: number; done: boolean } & RowDataPacket)[]
                >(
                    `
                        SELECT 
                            COUNT(t.id) as total,
                            SUM(CASE WHEN c.name = 'Done' THEN 1 ELSE 0 END) as done
                        FROM tasks t
                        JOIN columns c ON t.column_id = c.id
                        WHERE c.project_id = ?
                    `,
                    [project.id],
                );

                return {
                    id: project.id,
                    name: project.name,
                    description: project.description,
                    icon: project.icon,
                    color: project.color,
                    status: project.status,
                    created_at: project.created_at,
                    updated_at: project.updated_at,
                    owner:
                        owner.length && owner[0]
                            ? {
                                  name: owner[0].name,
                                  avatar_url: owner[0].avatar_url,
                              }
                            : null,
                    members: members.map((member) => ({
                        id: member.id,
                        name: member.name,
                        surname: member.surname,
                        avatar_url: member.avatar_url,
                        color: member.color,
                        role: member.role,
                        status: member.status,
                        joined_at: member.joined_at,
                    })),
                    categories,
                    labels,
                    columns,
                    tasks_total:
                        taskStats.length && taskStats[0]
                            ? taskStats[0].total
                            : 0,
                    tasks_done:
                        taskStats.length && taskStats[0]
                            ? taskStats[0].done
                            : 0,
                };
            }),
        );

        res.status(200).json(enrichedProjects);
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
                SELECT id, name, color, created_at, updated_at
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
                    u.id,
                    u.name,
                    u.surname,
                    u.avatar_url,
                    u.color,
                    pm.role,
                    pm.status,
                    pm.joined_at
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

        const enrichedColumns = await Promise.all(
            columns.map(async (column) => {
                const [tasks] = await pool.execute<Task[]>(
                    `
                        SELECT
                            t.id,
                            t.column_id,
                            t.creator_id,
                            t.title,
                            t.description,
                            t.position,
                            t.due_date,
                            t.start_date,
                            t.priority,
                            t.show_progress,
                            t.created_at,
                            t.updated_at,
                            c.name as column_name
                        FROM tasks t
                        JOIN columns c ON t.column_id = c.id
                        WHERE t.column_id = ?
                        ORDER BY t.position ASC
                    `,
                    [column.id],
                );

                const enrichedTasks = await Promise.all(
                    tasks.map(async (task) => {
                        const [members] = await pool.execute<User[]>(
                            `
                                SELECT
                                    u.id,
                                    u.name,
                                    u.surname,
                                    u.avatar_url,
                                    u.color
                                FROM task_members ta
                                JOIN users u ON ta.user_id = u.id
                                WHERE ta.task_id = ?
                            `,
                            [task.id],
                        );

                        const [taskLabels] = await pool.execute<Label[]>(
                            `
                                SELECT l.id, l.name, l.color
                                FROM task_labels tl
                                JOIN labels l ON tl.label_id = l.id
                                WHERE tl.task_id = ?
                            `,
                            [task.id],
                        );

                        const [taskCategories] = await pool.execute<Category[]>(
                            `
                                SELECT c.id, c.name, c.color
                                FROM task_categories tc
                                JOIN categories c ON tc.category_id = c.id
                                WHERE tc.task_id = ?
                            `,
                            [task.id],
                        );

                        const [subtasks] = await pool.execute<Subtask[]>(
                            `
                                SELECT id, title, position, is_done, created_at
                                FROM subtasks
                                WHERE task_id = ?
                                ORDER BY position ASC
                            `,
                            [task.id],
                        );

                        const [comments] = await pool.execute<Comment[]>(
                            `
                                SELECT
                                    c.id,
                                    c.body,
                                    c.created_at,
                                    c.updated_at,
                                    u.id as user_id,
                                    u.name,
                                    u.surname,
                                    u.avatar_url,
                                    u.color
                                FROM comments c
                                JOIN users u ON c.user_id = u.id
                                WHERE c.task_id = ?
                                ORDER BY c.created_at ASC
                            `,
                            [task.id],
                        );

                        const [attachments] = await pool.execute<any[]>(
                            `
                                SELECT
                                    a.id,
                                    a.filename,
                                    a.file_url,
                                    a.mime_type,
                                    a.size_bytes,
                                    a.created_at,
                                    u.id as uploader_id,
                                    u.name as uploader_name,
                                    u.surname as uploader_surname,
                                    u.avatar_url as uploader_avatar
                                FROM attachments a
                                JOIN users u ON a.uploader_id = u.id
                                WHERE a.task_id = ?
                                ORDER BY a.created_at DESC
                            `,
                            [task.id],
                        );

                        const subtasksTotal = subtasks.length;
                        const subtasksDone = subtasks.filter(
                            (s) => s.is_done,
                        ).length;

                        return {
                            id: task.id,
                            title: task.title,
                            description: task.description,
                            position: task.position,
                            due_date: task.due_date,
                            start_date: task.start_date,
                            priority: task.priority,
                            show_progress: task.show_progress,
                            created_at: task.created_at,
                            updated_at: task.updated_at,
                            column: {
                                id: task.column_id,
                                name: task.column_name,
                            },
                            members,
                            labels: taskLabels,
                            categories: taskCategories,
                            subtasks,
                            comments: comments.map((comment) => ({
                                id: comment.id,
                                member: {
                                    id: comment.user_id,
                                    name: comment.name,
                                    surname: comment.surname,
                                    avatar_url: comment.avatar_url,
                                    color: comment.color,
                                },
                                body: comment.body,
                                created_at: comment.created_at,
                                updated_at: comment.updated_at,
                            })),
                            attachments,
                            subtasks_total: subtasksTotal,
                            subtasks_done: subtasksDone,
                        };
                    }),
                );

                return {
                    ...column,
                    tasks: enrichedTasks,
                };
            }),
        );

        const [taskStats] = await pool.execute<
            ({ total: number; done: boolean } & RowDataPacket)[]
        >(
            `
                SELECT
                    COUNT(t.id) as total,
                    SUM(CASE WHEN c.name = 'Done' THEN 1 ELSE 0 END) as done
                FROM tasks t
                JOIN columns c ON t.column_id = c.id
                WHERE c.project_id = ?
            `,
            [id],
        );

        res.status(200).json({
            id: project.id,
            name: project.name,
            description: project.description,
            icon: project.icon,
            color: project.color,
            status: project.status,
            created_at: project.created_at,
            updated_at: project.updated_at,
            owner:
                ownerData.length && ownerData[0]
                    ? {
                          name: ownerData[0].name,
                          avatar_url: ownerData[0].avatar_url,
                      }
                    : null,
            members: members.map((member) => ({
                id: member.id,
                name: member.name,
                surname: member.surname,
                avatar_url: member.avatar_url,
                color: member.color,
                role: member.role,
                status: member.status,
                joined_at: member.joined_at,
            })),
            columns: enrichedColumns,
            categories,
            labels,
            tasks_total:
                taskStats.length && taskStats[0] ? taskStats[0].total : 0,
            tasks_done:
                taskStats.length && taskStats[0] ? taskStats[0].done : 0,
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

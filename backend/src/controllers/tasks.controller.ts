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
    Subtask,
    Task,
    User,
} from "../types/types";
import { createTaskSchema, updateTaskSchema } from "../validation/validation";

export const getTasks = async (req: IGetUserRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const { columnId, projectId } = req.query;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        let query = `
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
                u.name as creator_name,
                u.surname as creator_surname,
                u.avatar_url as creator_avatar,
                c.name as column_name,
                p.id as project_id,
                p.name as project_name
            FROM tasks t
            JOIN columns c ON t.column_id = c.id
            JOIN projects p ON c.project_id = p.id
            JOIN users u ON t.creator_id = u.id
            WHERE p.id IN (
                SELECT project_id FROM project_members WHERE user_id = ?
            ) OR p.owner_id = ?
        `;

        const params: any[] = [userId, userId];

        if (columnId) {
            query += ` AND t.column_id = ?`;
            params.push(columnId);
        }

        if (projectId) {
            query += ` AND p.id = ?`;
            params.push(projectId);
        }

        query += ` ORDER BY t.position ASC, t.created_at DESC`;

        const [tasks] = await pool.execute<Task[]>(query, params);

        const enrichedTasks = await Promise.all(
            tasks.map(async (task) => {
                const [assignees] = await pool.execute<User[]>(
                    `
                        SELECT u.id, u.name, u.surname, u.avatar_url, u.color
                        FROM task_assignees ta
                        JOIN users u ON ta.user_id = u.id
                        WHERE ta.task_id = ?
                    `,
                    [task.id],
                );

                const [labels] = await pool.execute<Label[]>(
                    `
                        SELECT l.id, l.name, l.color
                        FROM task_labels tl
                        JOIN labels l ON tl.label_id = l.id
                        WHERE tl.task_id = ?
                    `,
                    [task.id],
                );

                const [categories] = await pool.execute<Category[]>(
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
                        SELECT id, title, position, created_at
                        FROM subtasks
                        WHERE task_id = ?
                        ORDER BY position ASC
                    `,
                    [task.id],
                );

                return {
                    ...task,
                    assignees,
                    labels,
                    categories,
                    subtasks,
                };
            }),
        );

        res.status(200).json(enrichedTasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Database error" });
    }
};

export const getTaskById = async (req: IGetUserRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!id) {
            res.status(400).json({
                status: "error",
                message: "Invalid task ID",
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
                    u.name as creator_name,
                    u.surname as creator_surname,
                    u.avatar_url as creator_avatar,
                    u.email as creator_email,
                    c.name as column_name,
                    p.id as project_id,
                    p.name as project_name
                FROM tasks t
                JOIN columns c ON t.column_id = c.id
                JOIN projects p ON c.project_id = p.id
                JOIN users u ON t.creator_id = u.id
                WHERE t.id = ? AND (
                    p.id IN (
                        SELECT project_id FROM project_members WHERE user_id = ?
                    ) OR p.owner_id = ?
                )
            `,
            [id, userId, userId],
        );

        if (!tasks.length) {
            res.status(404).json({
                status: "error",
                message: "Task not found",
            });

            return;
        }

        const task = tasks[0];

        const [assignees] = await pool.execute<User[]>(
            `
                SELECT u.id, u.name, u.surname, u.avatar_url, u.color, u.email
                FROM task_assignees ta
                JOIN users u ON ta.user_id = u.id
                WHERE ta.task_id = ?
            `,
            [id],
        );

        const [labels] = await pool.execute<Label[]>(
            `
                SELECT l.id, l.name, l.color
                FROM task_labels tl
                JOIN labels l ON tl.label_id = l.id
                WHERE tl.task_id = ?
            `,
            [id],
        );

        const [categories] = await pool.execute<Category[]>(
            `
                SELECT c.id, c.name, c.color, c.description
                FROM task_categories tc
                JOIN categories c ON tc.category_id = c.id
                WHERE tc.task_id = ?
            `,
            [id],
        );

        const [subtasks] = await pool.execute<Subtask[]>(
            `
                SELECT id, title, position, created_at
                FROM subtasks
                WHERE task_id = ?
                ORDER BY position ASC
            `,
            [id],
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
                ORDER BY c.created_at DESC
            `,
            [id],
        );

        res.status(200).json({
            ...task,
            assignees,
            labels,
            categories,
            subtasks,
            comments,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Database error" });
    }
};

export const createTask = async (req: IGetUserRequest, res: Response) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        const validatedData = createTaskSchema.parse(req.body);

        const [columns] = await pool.execute<Column[]>(
            `
                SELECT c.id, p.id as project_id
                FROM columns c
                JOIN projects p ON c.project_id = p.id
                WHERE c.id = ? AND (
                    p.id IN (
                        SELECT project_id FROM project_members WHERE user_id = ?
                    ) OR p.owner_id = ?
                )
            `,
            [validatedData.column_id, userId, userId],
        );

        if (!columns.length) {
            res.status(403).json({
                status: "error",
                message: "Access denied or column not found",
            });

            return;
        }

        const [rows] = await pool.execute<
            ({ max_pos: number } & RowDataPacket)[]
        >(`SELECT MAX(position) as max_pos FROM tasks WHERE column_id = ?`, [
            validatedData.column_id,
        ]);

        const maxPosition = rows[0];

        if (!maxPosition) {
            res.status(404).json({
                status: "error",
                message: "Tasks not found",
            });

            return;
        }

        const position = (maxPosition.max_pos ?? -1) + 1;

        const [result] = await pool.execute<ResultSetHeader>(
            `
                INSERT INTO tasks (
                    column_id,
                    creator_id,
                    title,
                    description,
                    position,
                    due_date,
                    start_date,
                    priority,
                    show_progress
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                validatedData.column_id,
                userId,
                validatedData.title,
                validatedData.description || null,
                position,
                validatedData.due_date || null,
                validatedData.start_date || null,
                validatedData.priority || "medium",
                validatedData.show_progress ? 1 : 0,
            ],
        );

        const taskId = result.insertId;

        if (
            validatedData.category_ids &&
            validatedData.category_ids.length > 0
        ) {
            for (const categoryId of validatedData.category_ids) {
                await pool.execute<ResultSetHeader>(
                    `INSERT INTO task_categories (task_id, category_id) VALUES (?, ?)`,
                    [taskId, categoryId],
                );
            }
        }

        if (
            validatedData.assignee_ids &&
            validatedData.assignee_ids.length > 0
        ) {
            for (const assigneeId of validatedData.assignee_ids) {
                await pool.execute<ResultSetHeader>(
                    `INSERT INTO task_assignees (task_id, user_id) VALUES (?, ?)`,
                    [taskId, assigneeId],
                );
            }
        }

        if (validatedData.label_ids && validatedData.label_ids.length > 0) {
            for (const labelId of validatedData.label_ids) {
                await pool.execute<ResultSetHeader>(
                    `INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)`,
                    [taskId, labelId],
                );
            }
        }

        const [newTasks] = await pool.execute<Task[]>(
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
                    t.updated_at
                FROM tasks t
                WHERE t.id = ?
            `,
            [taskId],
        );

        res.status(201).json({
            status: "success",
            message: "Task created successfully",
            task: newTasks,
        });
    } catch (error: any) {
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

export const updateTask = async (req: IGetUserRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!id) {
            res.status(400).json({
                status: "error",
                message: "Invalid task ID",
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

        const validatedData = updateTaskSchema.parse(req.body);

        const [tasks] = await pool.execute<Task[]>(
            `
                SELECT t.id, c.project_id
                FROM tasks t
                JOIN columns c ON t.column_id = c.id
                JOIN projects p ON c.project_id = p.id
                WHERE t.id = ? AND (
                    p.id IN (
                        SELECT project_id FROM project_members WHERE user_id = ?
                    ) OR p.owner_id = ?
                )
            `,
            [id, userId, userId],
        );

        if (!tasks.length) {
            res.status(404).json({
                status: "error",
                message: "Task not found or access denied",
            });

            return;
        }

        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (validatedData.title) {
            updateFields.push("title = ?");
            updateValues.push(validatedData.title);
        }

        if (validatedData.description) {
            updateFields.push("description = ?");
            updateValues.push(validatedData.description);
        }

        if (validatedData.position) {
            updateFields.push("position = ?");
            updateValues.push(validatedData.position);
        }

        if (validatedData.due_date) {
            updateFields.push("due_date = ?");
            updateValues.push(validatedData.due_date);
        }

        if (validatedData.start_date) {
            updateFields.push("start_date = ?");
            updateValues.push(validatedData.start_date);
        }

        if (validatedData.priority) {
            updateFields.push("priority = ?");
            updateValues.push(validatedData.priority);
        }

        if (validatedData.show_progress) {
            updateFields.push("show_progress = ?");
            updateValues.push(validatedData.show_progress ? 1 : 0);
        }

        if (validatedData.column_id) {
            updateFields.push("column_id = ?");
            updateValues.push(validatedData.column_id);
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
                UPDATE tasks
                SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `,
            updateValues,
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to update task",
            });

            return;
        }

        if (validatedData.category_ids) {
            await pool.execute<ResultSetHeader>(
                `DELETE FROM task_categories WHERE task_id = ?`,
                [id],
            );

            for (const categoryId of validatedData.category_ids) {
                await pool.execute<ResultSetHeader>(
                    `INSERT INTO task_categories (task_id, category_id) VALUES (?, ?)`,
                    [id, categoryId],
                );
            }
        }

        if (validatedData.assignee_ids) {
            await pool.execute<ResultSetHeader>(
                `DELETE FROM task_assignees WHERE task_id = ?`,
                [id],
            );

            for (const assigneeId of validatedData.assignee_ids) {
                await pool.execute<ResultSetHeader>(
                    `INSERT INTO task_assignees (task_id, user_id) VALUES (?, ?)`,
                    [id, assigneeId],
                );
            }
        }

        if (validatedData.label_ids) {
            await pool.execute<ResultSetHeader>(
                `DELETE FROM task_labels WHERE task_id = ?`,
                [id],
            );

            for (const labelId of validatedData.label_ids) {
                await pool.execute<ResultSetHeader>(
                    `INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)`,
                    [id, labelId],
                );
            }
        }

        const [updatedTasks] = await pool.execute<Task[]>(
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
                    t.updated_at
                FROM tasks t
                WHERE t.id = ?
            `,
            [id],
        );

        res.status(200).json({
            status: "success",
            message: "Task updated successfully",
            task: updatedTasks,
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

export const deleteTask = async (req: IGetUserRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!id) {
            res.status(400).json({
                status: "error",
                message: "Invalid task ID",
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

        const [tasks] = await pool.execute<Task[]>(
            `
                SELECT t.id, c.project_id
                FROM tasks t
                JOIN columns c ON t.column_id = c.id
                JOIN projects p ON c.project_id = p.id
                WHERE t.id = ? AND (
                    p.id IN (
                        SELECT project_id FROM project_members WHERE user_id = ?
                    ) OR p.owner_id = ?
                )
            `,
            [id, userId, userId],
        );

        if (!tasks.length) {
            res.status(404).json({
                status: "error",
                message: "Task not found or access denied",
            });

            return;
        }

        const [result] = await pool.execute<ResultSetHeader>(
            `DELETE FROM tasks WHERE id = ?`,
            [id],
        );

        if (result.affectedRows === 0) {
            res.status(404).json({
                status: "error",
                message: "Task not found",
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "Task deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Database error" });
    }
};

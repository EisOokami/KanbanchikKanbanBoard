import { pool } from "../db/pool";
import type { Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { ZodError } from "zod";
import type {
    Attachment,
    Category,
    Column,
    Comment,
    FilterOptions,
    IGetUserRequest,
    Label,
    Project,
    ProjectMember,
    Subtask,
    Task,
    User,
} from "../types/types";
import {
    createTaskSchema,
    moveTaskSchema,
    updateTaskSchema,
    validateIdSchema,
} from "../validation/validation";

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
                c.id as column_id,
                c.name as column_name,
                c.position as column_position,
                c.wip_limit as column_wip_limit,
                p.id as project_id,
                p.name as project_name,
                p.icon as project_icon,
                p.color as project_color,
                p.slug as project_slug
            FROM tasks t
            JOIN columns c ON t.column_id = c.id
            JOIN projects p ON c.project_id = p.id
            JOIN users u ON t.creator_id = u.id
            WHERE (
                p.id IN (
                    SELECT project_id FROM project_members WHERE user_id = ?
                ) OR p.owner_id = ?
            )
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

        const [tasks] = await pool.execute<
            (Task & {
                column_id: number;
                column_name: string;
                column_position: number;
                column_wip_limit: number;
            } & {
                project_id: number;
                project_icon: string;
                project_color: string;
                project_slug: string;
            })[]
        >(query, params);

        const enrichedTasks = await Promise.all(
            tasks.map(async (task) => {
                const [members] = await pool.execute<
                    (Pick<User, "id" | "name" | "surname" | "color" | "email"> &
                        Pick<ProjectMember, "role" | "status" | "joined_at"> &
                        RowDataPacket)[]
                >(
                    `
                        SELECT DISTINCT
                            u.id,
                            u.name,
                            u.surname,
                            u.avatar_url,
                            u.color,
                            u.email,
                            pm.role,
                            pm.status,
                            pm.joined_at
                        FROM task_members tm
                        JOIN users u ON tm.user_id = u.id
                        JOIN tasks t ON tm.task_id = t.id
                        JOIN columns c ON t.column_id = c.id
                        JOIN project_members pm ON c.project_id = pm.project_id AND tm.user_id = pm.user_id
                        JOIN projects p ON c.project_id = p.id
                        WHERE tm.task_id = ?
                        ORDER BY u.name, u.surname;
                    `,
                    [task.id],
                );

                const [labels] = await pool.execute<
                    (Pick<Label, "id" | "name" | "color"> & RowDataPacket)[]
                >(
                    `
                        SELECT l.id, l.name, l.color
                        FROM task_labels tl
                        JOIN labels l ON tl.label_id = l.id
                        WHERE tl.task_id = ?
                    `,
                    [task.id],
                );

                const [categories] = await pool.execute<
                    (Pick<Category, "id" | "name" | "color"> & RowDataPacket)[]
                >(
                    `
                        SELECT c.id, c.name, c.color
                        FROM task_categories tc
                        JOIN categories c ON tc.category_id = c.id
                        WHERE tc.task_id = ?
                    `,
                    [task.id],
                );

                const [subtasks] = await pool.execute<
                    (Pick<
                        Subtask,
                        "id" | "title" | "position" | "is_done" | "created_at"
                    > &
                        RowDataPacket)[]
                >(
                    `
                        SELECT id, title, position, is_done, created_at
                        FROM subtasks
                        WHERE task_id = ?
                        ORDER BY position ASC
                    `,
                    [task.id],
                );

                const [comments] = await pool.execute<
                    (Pick<
                        Comment,
                        "id" | "body" | "created_at" | "updated_at"
                    > & { user_id: string } & Pick<
                            User,
                            "name" | "surname" | "avatar_url" | "color"
                        > &
                        RowDataPacket)[]
                >(
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

                const [attachments] = await pool.execute<
                    (Pick<
                        Attachment,
                        | "id"
                        | "filename"
                        | "file_url"
                        | "mime_type"
                        | "size_bytes"
                        | "created_at"
                    > & {
                        uploader_id: number;
                        uploader_name: string;
                        uploader_surname: string;
                        uploader_avatar: string;
                    } & RowDataPacket)[]
                >(
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
                    (subtask) => subtask.is_done,
                ).length;

                return {
                    id: task.id,
                    created_at: task.created_at,
                    updated_at: task.updated_at,
                    title: task.title,
                    description: task.description,
                    position: task.position,
                    due_date: task.due_date,
                    start_date: task.start_date,
                    priority: task.priority,
                    show_progress: task.show_progress === 1,
                    project: {
                        id: task.project_id,
                        name: task.project_name,
                        icon: task.project_icon,
                        color: task.project_color,
                        slug: task.project_slug,
                    },
                    members,
                    labels,
                    categories,
                    subtasks,
                    attachments: attachments.map((attachment) => ({
                        id: attachment.id,
                        filename: attachment.filename,
                        file_url: attachment.file_url,
                        mime_type: attachment.mime_type,
                        size_bytes: attachment.size_bytes,
                        created_at: attachment.created_at,
                        uploader: {
                            id: attachment.uploader_id,
                            name: attachment.uploader_name,
                            surname: attachment.uploader_surname,
                            avatar_url: attachment.uploader_avatar,
                        },
                    })),
                    column: {
                        id: task.column_id,
                        name: task.column_name,
                        position: task.column_position,
                        wip_limit: task.column_wip_limit,
                    },
                    comments: comments.map((comment) => ({
                        id: comment.id,
                        body: comment.body,
                        created_at: comment.created_at,
                        updated_at: comment.updated_at,
                        member: {
                            id: comment.user_id,
                            name: comment.name,
                            surname: comment.surname,
                            avatar_url: comment.avatar_url,
                            color: comment.color,
                        },
                    })),
                    subtasks_total: subtasksTotal,
                    subtasks_done: subtasksDone,
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

        const [tasks] = await pool.execute<
            (Task & {
                column_id: number;
                column_name: string;
                column_position: number;
                column_wip_limit: number;
            } & {
                project_id: number;
                project_icon: string;
                project_color: string;
                project_slug: string;
            })[]
        >(
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
                    c.id as column_id,
                    c.name as column_name,
                    c.position as column_position,
                    c.wip_limit as column_wip_limit,
                    p.id as project_id,
                    p.name as project_name,
                    p.icon as project_icon,
                    p.color as project_color,
                    p.slug as project_slug
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
                message: "Task not found or access denied",
            });

            return;
        }

        const task = tasks[0];

        if (!task) {
            res.status(404).json({
                status: "error",
                message: "Task not found or access denied",
            });

            return;
        }

        const [members] = await pool.execute<
            (Pick<User, "id" | "name" | "surname" | "color" | "email"> &
                Pick<ProjectMember, "role" | "status" | "joined_at"> &
                RowDataPacket)[]
        >(
            `
                SELECT DISTINCT
                    u.id,
                    u.name,
                    u.surname,
                    u.avatar_url,
                    u.color,
                    u.email,
                    pm.role,
                    pm.status,
                    pm.joined_at
                FROM task_members tm
                JOIN users u ON tm.user_id = u.id
                JOIN tasks t ON tm.task_id = t.id
                JOIN columns c ON t.column_id = c.id
                JOIN project_members pm ON c.project_id = pm.project_id AND tm.user_id = pm.user_id
                JOIN projects p ON c.project_id = p.id
                WHERE tm.task_id = ?
                ORDER BY u.name, u.surname;
            `,
            [id],
        );

        const [labels] = await pool.execute<
            (Pick<Label, "id" | "name" | "color"> & RowDataPacket)[]
        >(
            `
                SELECT l.id, l.name, l.color
                FROM task_labels tl
                JOIN labels l ON tl.label_id = l.id
                WHERE tl.task_id = ?
            `,
            [id],
        );

        const [categories] = await pool.execute<
            (Pick<Category, "id" | "name" | "color"> & RowDataPacket)[]
        >(
            `
                SELECT c.id, c.name, c.color
                FROM task_categories tc
                JOIN categories c ON tc.category_id = c.id
                WHERE tc.task_id = ?
            `,
            [id],
        );

        const [subtasks] = await pool.execute<
            (Pick<
                Subtask,
                "id" | "title" | "position" | "is_done" | "created_at"
            > &
                RowDataPacket)[]
        >(
            `
                SELECT id, title, position, is_done, created_at
                FROM subtasks
                WHERE task_id = ?
                ORDER BY position ASC
            `,
            [id],
        );

        const [comments] = await pool.execute<
            (Pick<Comment, "id" | "body" | "created_at" | "updated_at"> & {
                user_id: string;
            } & Pick<User, "name" | "surname" | "avatar_url" | "color"> &
                RowDataPacket)[]
        >(
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

        const [attachments] = await pool.execute<
            (Pick<
                Attachment,
                | "id"
                | "filename"
                | "file_url"
                | "mime_type"
                | "size_bytes"
                | "created_at"
            > & {
                uploader_id: number;
                uploader_name: string;
                uploader_surname: string;
                uploader_avatar: string;
            } & RowDataPacket)[]
        >(
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
            (subtask) => subtask.is_done,
        ).length;

        res.status(200).json({
            id: task.id,
            created_at: task.created_at,
            updated_at: task.updated_at,
            title: task.title,
            description: task.description,
            position: task.position,
            due_date: task.due_date,
            start_date: task.start_date,
            priority: task.priority,
            show_progress: task.show_progress === 1,
            project: {
                id: task.project_id,
                name: task.project_name,
                icon: task.project_icon,
                color: task.project_color,
                slug: task.project_slug,
            },
            members,
            labels,
            categories,
            subtasks,
            attachments: attachments.map((attachment) => ({
                id: attachment.id,
                filename: attachment.filename,
                file_url: attachment.file_url,
                mime_type: attachment.mime_type,
                size_bytes: attachment.size_bytes,
                created_at: attachment.created_at,
                uploader: {
                    id: attachment.uploader_id,
                    name: attachment.uploader_name,
                    surname: attachment.uploader_surname,
                    avatar_url: attachment.uploader_avatar,
                },
            })),
            column: {
                id: task.column_id,
                name: task.column_name,
                position: task.column_position,
                wip_limit: task.column_wip_limit,
            },
            comments: comments.map((comment) => ({
                id: comment.id,
                body: comment.body,
                created_at: comment.created_at,
                updated_at: comment.updated_at,
                member: {
                    id: comment.user_id,
                    name: comment.name,
                    surname: comment.surname,
                    avatar_url: comment.avatar_url,
                    color: comment.color,
                },
            })),
            subtasks_total: subtasksTotal,
            subtasks_done: subtasksDone,
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

        const [projects] = await pool.execute<
            (Pick<Project, "id" | "owner_id"> & RowDataPacket)[]
        >(
            `
                SELECT id, owner_id
                FROM projects
                WHERE id = ? AND (
                    id IN (
                        SELECT project_id FROM project_members WHERE user_id = ?
                    ) OR owner_id = ?
                )
            `,
            [validatedData.projectId, userId, userId],
        );

        if (!projects.length) {
            res.status(403).json({
                status: "error",
                message: "Access denied or project not found",
            });

            return;
        }

        const [columns] = await pool.execute<
            (Pick<Column, "id" | "name" | "wip_limit"> & {
                task_count: number;
            } & RowDataPacket)[]
        >(
            `
                SELECT
                    c.id,
                    c.name,
                    c.wip_limit,
                    COUNT(t.id) AS task_count
                FROM columns c
                JOIN projects p ON c.project_id = p.id
                LEFT JOIN tasks t ON t.column_id = c.id
                WHERE c.id = ?
                AND p.id = ?
                AND (
                    p.owner_id = ?
                    OR p.id IN (
                        SELECT project_id
                        FROM project_members
                        WHERE user_id = ?
                    )
                )
                GROUP BY c.id, c.name, c.wip_limit, p.id
            `,
            [validatedData.columnId, validatedData.projectId, userId, userId],
        );

        if (!columns.length) {
            res.status(403).json({
                status: "error",
                message: "Access denied or column not found",
            });

            return;
        }

        const column = columns[0];

        if (!column) {
            res.status(404).json({
                status: "error",
                message: "Column not found or access denied",
            });

            return;
        }

        if (
            column.wip_limit !== null &&
            column.task_count >= column.wip_limit
        ) {
            res.status(409).json({
                status: "error",
                message: "The column has reached its WIP limit.",
            });

            return;
        }

        const [rows] = await pool.execute<
            ({ max_pos: number } & RowDataPacket)[]
        >(
            `
                SELECT COALESCE(MAX(position), 0) AS max_pos
                FROM tasks
                WHERE column_id = ?
            `,
            [validatedData.columnId],
        );

        if (!rows.length) {
            res.status(404).json({
                status: "error",
                message: "Tasks not found or access denied",
            });

            return;
        }

        const INITIAL_GAP = 65536;
        const [firstRow] = rows as { max_pos: number }[];
        const maxPos = firstRow?.max_pos ?? 0;
        const position = maxPos + INITIAL_GAP;

        if (!position) {
            res.status(404).json({
                status: "error",
                message: "Tasks not found or access denied",
            });

            return;
        }

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
                validatedData.columnId,
                userId,
                validatedData.title,
                validatedData.description || null,
                position,
                validatedData.dueDate || null,
                validatedData.startDate || null,
                validatedData.priority,
                validatedData.showProgress ? 1 : 0,
            ],
        );

        const taskId = result.insertId;

        if (validatedData.newCategories && validatedData.newCategories.length) {
            await Promise.all(
                validatedData.newCategories.map(async (category) => {
                    const [categoriesResult] =
                        await pool.execute<ResultSetHeader>(
                            `
                            INSERT INTO categories (project_id, name, color)
                            VALUES (?, ?, ?)
                        `,
                            [
                                validatedData.projectId,
                                category.name,
                                category.color,
                            ],
                        );

                    await pool.execute<ResultSetHeader>(
                        `INSERT INTO task_categories (task_id, category_id) VALUES (?, ?)`,
                        [taskId, categoriesResult.insertId],
                    );
                }),
            );
        }

        if (validatedData.newLabels && validatedData.newLabels.length) {
            await Promise.all(
                validatedData.newLabels.map(async (label) => {
                    const [labelsResult] = await pool.execute<ResultSetHeader>(
                        `
                            INSERT INTO labels (project_id, name, color)
                            VALUES (?, ?, ?)
                        `,
                        [validatedData.projectId, label.name, label.color],
                    );

                    await pool.execute<ResultSetHeader>(
                        `INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)`,
                        [taskId, labelsResult.insertId],
                    );
                }),
            );
        }

        if (validatedData.subtasks && validatedData.subtasks.length) {
            await Promise.all(
                validatedData.subtasks.map(async (subtask) => {
                    await pool.execute<ResultSetHeader>(
                        `
                            INSERT INTO subtasks (task_id, title, position, is_done)
                            VALUES (?, ?, ?, ?)
                        `,
                        [
                            taskId,
                            subtask.title,
                            subtask.position,
                            subtask.is_done,
                        ],
                    );
                }),
            );
        }

        if (validatedData.categories && validatedData.categories.length) {
            await Promise.all(
                validatedData.categories.map(async (category) => {
                    if (category.id) {
                        await pool.execute<ResultSetHeader>(
                            `INSERT INTO task_categories (task_id, category_id) VALUES (?, ?)`,
                            [taskId, category.id],
                        );
                    }
                }),
            );
        }

        if (validatedData.members && validatedData.members.length) {
            await Promise.all(
                validatedData.members.map(async (member) => {
                    await pool.execute<ResultSetHeader>(
                        `INSERT INTO task_members (task_id, user_id) VALUES (?, ?)`,
                        [taskId, member.id],
                    );
                }),
            );
        }

        if (validatedData.labels && validatedData.labels.length) {
            await Promise.all(
                validatedData.labels.map(async (label) => {
                    if (label.id) {
                        await pool.execute<ResultSetHeader>(
                            `INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)`,
                            [taskId, label.id],
                        );
                    }
                }),
            );
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
            data: newTasks[0],
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
        validateIdSchema.parse(req.params);

        const { id } = req.params;
        const userId = req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        if (!id) {
            res.status(400).json({
                status: "error",
                message: "Invalid task ID",
            });

            return;
        }

        const validatedData = updateTaskSchema.parse(req.body);

        const [tasks] = await pool.execute<
            (Pick<Task, "id"> & Pick<Column, "project_id"> & RowDataPacket)[]
        >(
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

        if (validatedData.priority) {
            updateFields.push("priority = ?");
            updateValues.push(validatedData.priority);
        }

        if (typeof validatedData.showProgress === "boolean") {
            updateFields.push("show_progress = ?");
            updateValues.push(validatedData.showProgress ? 1 : 0);
        }

        if (validatedData.columnId) {
            updateFields.push("column_id = ?");
            updateValues.push(validatedData.columnId);
        }

        updateFields.push("due_date = ?");
        updateValues.push(
            typeof validatedData.dueDate === "undefined"
                ? null
                : validatedData.dueDate,
        );

        updateFields.push("start_date = ?");
        updateValues.push(
            typeof validatedData.startDate === "undefined"
                ? null
                : validatedData.startDate,
        );

        updateFields.push("description = ?");
        updateValues.push(validatedData.description);

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

        if (validatedData.categories && validatedData.categories.length) {
            await pool.execute<ResultSetHeader>(
                `DELETE FROM task_categories WHERE task_id = ?`,
                [id],
            );

            await Promise.all(
                validatedData.categories.map(async (category) => {
                    if (category.id) {
                        await pool.execute<ResultSetHeader>(
                            `INSERT INTO task_categories (task_id, category_id) VALUES (?, ?)`,
                            [id, category.id],
                        );
                    }
                }),
            );
        }

        if (validatedData.members && validatedData.members.length) {
            await pool.execute<ResultSetHeader>(
                `DELETE FROM task_members WHERE task_id = ?`,
                [id],
            );

            await Promise.all(
                validatedData.members.map(async (member) => {
                    await pool.execute<ResultSetHeader>(
                        `INSERT INTO task_members (task_id, user_id) VALUES (?, ?)`,
                        [id, member.id],
                    );
                }),
            );
        }

        if (validatedData.labels && validatedData.labels.length) {
            await pool.execute<ResultSetHeader>(
                `DELETE FROM task_labels WHERE task_id = ?`,
                [id],
            );

            await Promise.all(
                validatedData.labels.map(async (label) => {
                    if (label.id) {
                        await pool.execute<ResultSetHeader>(
                            `INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)`,
                            [id, label.id],
                        );
                    }
                }),
            );
        }

        if (validatedData.subtasks && validatedData.subtasks.length) {
            await pool.execute<ResultSetHeader>(
                `DELETE FROM subtasks WHERE task_id = ?`,
                [id],
            );

            await Promise.all(
                validatedData.subtasks.map(async (subtask) => {
                    await pool.execute<ResultSetHeader>(
                        `
                            INSERT INTO subtasks (task_id, title, position, is_done) 
                            VALUES (?, ?, ?, ?)
                        `,
                        [id, subtask.title, subtask.position, subtask.is_done],
                    );
                }),
            );
        }

        if (validatedData.subtasks && validatedData.subtasks.length) {
            await Promise.all(
                validatedData.newSubtasks.map(async (subtask) => {
                    await pool.execute<ResultSetHeader>(
                        `
                            INSERT INTO subtasks (task_id, title, position, is_done)
                            VALUES (?, ?, ?, ?)
                        `,
                        [id, subtask.title, subtask.position, subtask.is_done],
                    );
                }),
            );
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
            data: updatedTasks[0],
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
        validateIdSchema.parse(req.params);

        const { id } = req.params;
        const userId = req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        if (!id) {
            res.status(400).json({
                status: "error",
                message: "Invalid task ID",
            });

            return;
        }

        const [tasks] = await pool.execute<
            (Pick<Task, "id"> & Pick<Column, "project_id"> & RowDataPacket)[]
        >(
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
                message: "Task not found or access denied",
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

export const getTaskFilterOptions = async (
    req: IGetUserRequest,
    res: Response,
) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        const [statuses] = await pool.execute<
            (Pick<Column, "id" | "name"> & RowDataPacket)[]
        >(
            `
                SELECT
                    c.id,
                    c.name
                FROM columns c
                JOIN projects p ON c.project_id = p.id
                WHERE p.id IN (
                    SELECT project_id FROM project_members WHERE user_id = ?
                ) OR p.owner_id = ?
                GROUP BY c.name
                ORDER BY c.position ASC
            `,
            [userId, userId],
        );

        const [projects] = await pool.execute<
            (Pick<Project, "id" | "name" | "color" | "slug"> & RowDataPacket)[]
        >(
            `
                SELECT DISTINCT
                    p.id,
                    p.name,
                    p.color,
                    p.slug
                FROM projects p
                WHERE p.id IN (
                    SELECT project_id FROM project_members WHERE user_id = ?
                ) OR p.owner_id = ?
                ORDER BY p.name ASC
            `,
            [userId, userId],
        );

        const filterOptions: FilterOptions = {
            statuses: statuses.map((status) => ({
                id: status.id,
                name: status.name,
            })),
            projects: projects.map((project) => ({
                id: project.id,
                name: project.name,
                color: project.color,
                slug: project.slug,
            })),
        };

        res.status(200).json(filterOptions);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "Database error",
        });
    }
};

export const moveTask = async (req: IGetUserRequest, res: Response) => {
    try {
        validateIdSchema.parse(req.params);

        const { id } = req.params;
        const userId = req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        if (!id) {
            res.status(400).json({
                status: "error",
                message: "Invalid task ID",
            });

            return;
        }

        const validatedData = moveTaskSchema.parse(req.body);

        const [columns] = await pool.execute<
            (Pick<Column, "name" | "wip_limit"> & {
                task_count: number;
            } & RowDataPacket)[]
        >(
            `
                SELECT
                    c.name,
                    c.wip_limit,
                    COUNT(t.id) AS task_count
                FROM columns c
                LEFT JOIN tasks t ON t.column_id = c.id
                WHERE c.id = ?
                GROUP BY c.id, c.name, c.wip_limit;
            `,
            [validatedData.columnId],
        );

        if (!columns.length) {
            res.status(404).json({
                status: "error",
                message: "Column not found or access denied",
            });

            return;
        }

        const column = columns[0];

        if (!column) {
            res.status(404).json({
                status: "error",
                message: "Column not found or access denied",
            });

            return;
        }

        if (
            column.wip_limit !== null &&
            column.task_count >= column.wip_limit
        ) {
            res.status(409).json({
                status: "error",
                message: "The column has reached its WIP limit.",
            });

            return;
        }

        const [result] = await pool.execute<ResultSetHeader>(
            `
                UPDATE tasks
                    SET column_id = ?,
                        position  = ?,
                        updated_at = NOW()
                WHERE id = ?
            `,
            [
                validatedData.columnId,
                validatedData.position,
                validatedData.taskId,
            ],
        );

        if (result.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to move task",
            });

            return;
        }

        const [rows] = await pool.execute<
            (Pick<Task, "position"> & RowDataPacket)[]
        >(
            `
                (SELECT position FROM tasks
                WHERE column_id = ? AND id != ?
                    AND position < ?
                ORDER BY position DESC LIMIT 1)
                UNION ALL
                (SELECT position FROM tasks
                WHERE column_id = ? AND id != ?
                    AND position > ?
                ORDER BY position ASC  LIMIT 1)
            `,
            [
                validatedData.columnId,
                validatedData.taskId,
                validatedData.position,
                validatedData.columnId,
                validatedData.taskId,
                validatedData.position,
            ],
        );

        const neighbors = rows.map((row) => row.position);
        const EPSILON = 1e-9;
        const [prevPos, nextPos] = neighbors;

        if (
            neighbors.length === 2 &&
            prevPos !== undefined &&
            nextPos !== undefined &&
            Math.abs(nextPos - prevPos) < EPSILON * 2
        ) {
            const [rebalanceResult] = await pool.execute<ResultSetHeader>(
                `CALL sp_rebalance_column(?)`,
                [validatedData.columnId],
            );

            if (rebalanceResult.affectedRows === 0) {
                res.status(400).json({
                    status: "error",
                    message: "Failed to rebalance column",
                });

                return;
            }
        }

        res.status(200).json({
            status: "success",
            message: "Task moved successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Database error" });
    }
};

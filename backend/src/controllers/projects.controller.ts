import { pool } from "../db/pool";
import crypto from "crypto";
import type { Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { ZodError } from "zod";
import type {
    Attachment,
    Category,
    Column,
    Comment,
    IGetUserRequest,
    Label,
    Project,
    ProjectMember,
    ProjectSlugHistory,
    Subtask,
    Task,
    User,
} from "../types/types";
import {
    createProjectSchema,
    validateSlugSchema,
    updateProjectSchema,
    changeRoleSchema,
    deleteMemberSchema,
    validateIdSchema,
} from "../validation/validation";
import { transporter } from "../utils/email";
import { generateSlug, generateUniqueSlug } from "../utils/slugify";
import path from "path";
import { existsSync, unlinkSync } from "fs";

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
                    p.slug,
                    show_priority_emoji,
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

        if (!projects.length || !projects[0]) {
            res.status(404).json({
                status: "error",
                message: "Project not found or access denied",
            });

            return;
        }

        const enrichedProjects = await Promise.all(
            projects.map(async (project) => {
                const [owner] = await pool.execute<
                    (Pick<User, "id" | "name" | "avatar_url"> & RowDataPacket)[]
                >(
                    `
                        SELECT id, name, avatar_url
                        FROM users
                        WHERE id = ?
                    `,
                    [project.owner_id],
                );

                const [members] = await pool.execute<
                    (Pick<
                        User,
                        "id" | "name" | "surname" | "avatar_url" | "color"
                    > &
                        Pick<ProjectMember, "role" | "status" | "joined_at"> &
                        RowDataPacket)[]
                >(
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

                const [columns] = await pool.execute<
                    (Pick<
                        Column,
                        | "id"
                        | "name"
                        | "position"
                        | "wip_limit"
                        | "total_tasks"
                        | "created_at"
                        | "updated_at"
                    > &
                        RowDataPacket)[]
                >(
                    `
                        SELECT 
                            c.id,
                            c.name,
                            c.position,
                            c.wip_limit,
                            c.created_at,
                            c.updated_at,
                            COUNT(t.id) as total_tasks
                        FROM columns c
                        LEFT JOIN tasks t ON t.column_id = c.id
                        WHERE c.project_id = ?
                        GROUP BY c.id, c.name, c.position, c.wip_limit, c.created_at, c.updated_at
                        ORDER BY c.position ASC
                    `,
                    [project.id],
                );

                const [categories] = await pool.execute<
                    (Pick<
                        Category,
                        "id" | "name" | "color" | "created_at" | "updated_at"
                    > &
                        RowDataPacket)[]
                >(
                    `
                SELECT id, name, color, created_at, updated_at
                FROM categories
                WHERE project_id = ?
                ORDER BY name ASC
            `,
                    [project.id],
                );

                const [labels] = await pool.execute<
                    (Pick<Label, "id" | "name" | "color"> & RowDataPacket)[]
                >(
                    `
                SELECT id, name, color
                FROM labels
                WHERE project_id = ?
                ORDER BY name ASC
            `,
                    [project.id],
                );

                const [taskStats] = await pool.execute<
                    ({ total: number; done: number } & RowDataPacket)[]
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
                    slug: project.slug,
                    show_priority_emoji: project.show_priority_emoji,
                    created_at: project.created_at,
                    updated_at: project.updated_at,
                    owner:
                        owner.length && owner[0]
                            ? {
                                  name: owner[0].name,
                                  avatar_url:
                                      owner[0].avatar_url === null
                                          ? null
                                          : `${process.env.BACKEND_URL}${owner[0].avatar_url}`,
                              }
                            : null,
                    members: members.map((member) => ({
                        id: member.id,
                        name: member.name,
                        surname: member.surname,
                        avatar_url:
                            member.avatar_url === null
                                ? null
                                : `${process.env.BACKEND_URL}${member.avatar_url}`,
                        color: member.color,
                        role: member.role,
                        status: member.status,
                        joined_at: member.joined_at,
                    })),
                    categories,
                    labels,
                    columns,
                    tasks_total:
                        taskStats.length && taskStats[0] && taskStats[0].total
                            ? taskStats[0].total
                            : 0,
                    tasks_done:
                        taskStats.length && taskStats[0] && taskStats[0].done
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

export const getProject = async (req: IGetUserRequest, res: Response) => {
    try {
        validateSlugSchema.parse(req.params);

        const { slug } = req.params;
        const userId = req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        if (!slug) {
            res.status(400).json({
                status: "error",
                message: "Invalid project slug",
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
                    p.slug,
                    p.show_priority_emoji,
                    p.created_at,
                    p.updated_at
                FROM projects p
                WHERE p.slug = ? AND (
                    p.owner_id = ? OR p.id IN (
                        SELECT project_id FROM project_members WHERE user_id = ?
                    )
                )
            `,
            [slug, userId, userId],
        );

        if (!projects.length || !projects[0]) {
            const [history] = await pool.execute<
                (Pick<ProjectSlugHistory, "project_id"> & {
                    current_slug: string;
                } & RowDataPacket)[]
            >(
                `
                    SELECT 
                        h.project_id, 
                        p.slug AS current_slug
                    FROM project_slug_history h
                    JOIN projects p ON p.id = h.project_id
                    WHERE h.old_slug = ?
                    LIMIT 1
                `,
                [slug],
            );

            if (!history.length || !history[0]) {
                res.status(404).json({
                    status: "error",
                    message: "Project not found or access denied",
                });

                return;
            }

            res.redirect(301, `/projects/${history[0].current_slug}`);

            return;
        }

        const project = projects[0];

        const [columns] = await pool.execute<
            (Pick<
                Column,
                | "id"
                | "name"
                | "position"
                | "wip_limit"
                | "created_at"
                | "updated_at"
            > &
                RowDataPacket)[]
        >(
            `
                SELECT id, name, position, wip_limit, created_at, updated_at
                FROM columns
                WHERE project_id = ?
                ORDER BY position ASC
            `,
            [project.id],
        );

        const [categories] = await pool.execute<
            (Pick<
                Category,
                "id" | "name" | "color" | "created_at" | "updated_at"
            > &
                RowDataPacket)[]
        >(
            `
                SELECT id, name, color, created_at, updated_at
                FROM categories
                WHERE project_id = ?
                ORDER BY name ASC
            `,
            [project.id],
        );

        const [labels] = await pool.execute<
            (Pick<Label, "id" | "name" | "color"> & RowDataPacket)[]
        >(
            `
                SELECT id, name, color
                FROM labels
                WHERE project_id = ?
                ORDER BY name ASC
            `,
            [project.id],
        );

        const [members] = await pool.execute<
            (Pick<User, "id" | "name" | "surname" | "avatar_url" | "color"> &
                Pick<ProjectMember, "role" | "status" | "joined_at"> &
                RowDataPacket)[]
        >(
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

        const [owner] = await pool.execute<
            (Pick<
                User,
                "id" | "name" | "surname" | "email" | "avatar_url" | "color"
            > &
                RowDataPacket)[]
        >(
            `
                SELECT id, name, surname, email, avatar_url, color
                FROM users
                WHERE id = ?
            `,
            [project.owner_id],
        );

        const enrichedColumns = await Promise.all(
            columns.map(async (column) => {
                const [tasks] = await pool.execute<
                    (Task & { column_name: string })[]
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
                        const [members] = await pool.execute<
                            (Pick<
                                User,
                                | "id"
                                | "name"
                                | "surname"
                                | "avatar_url"
                                | "color"
                                | "email"
                            > &
                                Pick<
                                    ProjectMember,
                                    "role" | "status" | "joined_at"
                                > &
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

                        const [taskLabels] = await pool.execute<
                            (Pick<Label, "id" | "name" | "color"> &
                                RowDataPacket)[]
                        >(
                            `
                                SELECT l.id, l.name, l.color
                                FROM task_labels tl
                                JOIN labels l ON tl.label_id = l.id
                                WHERE tl.task_id = ?
                            `,
                            [task.id],
                        );

                        const [taskCategories] = await pool.execute<
                            (Pick<Category, "id" | "name" | "color"> &
                                RowDataPacket)[]
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
                                | "id"
                                | "title"
                                | "position"
                                | "is_done"
                                | "created_at"
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
                            title: task.title,
                            description: task.description,
                            position: task.position,
                            due_date: task.due_date,
                            start_date: task.start_date,
                            priority: task.priority,
                            show_progress: task.show_progress,
                            creator_id: task.creator_id,
                            created_at: task.created_at,
                            updated_at: task.updated_at,
                            column: {
                                id: task.column_id,
                                name: task.column_name,
                            },
                            members: members.map((member) => ({
                                ...member,
                                avatar_url:
                                    member.avatar_url === null
                                        ? null
                                        : `${process.env.BACKEND_URL}${member.avatar_url}`,
                            })),
                            labels: taskLabels,
                            categories: taskCategories,
                            subtasks,
                            comments: comments.map((comment) => ({
                                id: comment.id,
                                member: {
                                    id: comment.user_id,
                                    name: comment.name,
                                    surname: comment.surname,
                                    avatar_url:
                                        comment.avatar_url === null
                                            ? null
                                            : `${process.env.BACKEND_URL}${comment.avatar_url}`,
                                    color: comment.color,
                                },
                                body: comment.body,
                                created_at: comment.created_at,
                                updated_at: comment.updated_at,
                            })),
                            attachments: attachments.map((attachment) => ({
                                ...attachment,
                                file_url: `${process.env.BACKEND_URL}${attachment.file_url}`,
                            })),
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
            [project.id],
        );

        res.status(200).json({
            id: project.id,
            name: project.name,
            description: project.description,
            icon: project.icon,
            color: project.color,
            status: project.status,
            slug: project.slug,
            show_priority_emoji: project.show_priority_emoji,
            created_at: project.created_at,
            updated_at: project.updated_at,
            owner:
                owner.length && owner[0]
                    ? {
                          name: owner[0].name,
                          avatar_url:
                              owner[0].avatar_url === null
                                  ? null
                                  : `${process.env.BACKEND_URL}${owner[0].avatar_url}`,
                      }
                    : null,
            members: members.map((member) => ({
                id: member.id,
                name: member.name,
                surname: member.surname,
                avatar_url:
                    member.avatar_url === null
                        ? null
                        : `${process.env.BACKEND_URL}${member.avatar_url}`,
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

        const baseSlug = generateSlug(validatedData.name);

        if (!baseSlug) {
            res.status(400).json({
                status: "error",
                message:
                    "Project name must contain at least one letter or digit",
            });

            return;
        }

        validateSlugSchema.parse({ slug: baseSlug });

        const [slugRows] = await pool.execute<
            (Pick<Project, "slug"> & RowDataPacket)[]
        >(
            `
                SELECT slug
                FROM projects
                WHERE slug LIKE ?
            `,
            [`${baseSlug}%`],
        );

        const existingSlugs = new Set(slugRows.map((row) => row.slug));
        const slug = generateUniqueSlug(baseSlug, existingSlugs);

        const [result] = await pool.execute<ResultSetHeader>(
            `
                INSERT INTO projects (
                    owner_id, 
                    name, 
                    icon, 
                    color, 
                    description, 
                    status, 
                    slug, 
                    show_priority_emoji
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                userId,
                validatedData.name,
                validatedData.icon,
                validatedData.color,
                validatedData.description || null,
                validatedData.status,
                slug,
                validatedData.showPriorityEmoji,
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

        await Promise.all(
            validatedData.columns.map(async (column) => {
                await pool.execute<ResultSetHeader>(
                    `
                            INSERT INTO columns (project_id, name, position, wip_limit)
                            VALUES (?, ?, ?, ?)
                        `,
                    [projectId, column.name, column.position, column.wip_limit],
                );
            }),
        );

        await Promise.all(
            validatedData.labels.map(async (label) => {
                await pool.execute<ResultSetHeader>(
                    `
                    INSERT INTO labels (project_id, name, color)
                    VALUES (?, ?, ?)
                `,
                    [projectId, label.name, label.color],
                );
            }),
        );

        await Promise.all(
            validatedData.categories.map(async (category) => {
                await pool.execute<ResultSetHeader>(
                    `
                    INSERT INTO categories (project_id, name, color)
                    VALUES (?, ?, ?)
                `,
                    [projectId, category.name, category.color],
                );
            }),
        );

        if (validatedData.members.length > 0) {
            await Promise.all(
                validatedData.members.map(async (email) => {
                    const token = crypto.randomBytes(32).toString("hex");
                    const expiresAt = new Date(
                        Date.now() + 7 * 24 * 60 * 60 * 1000,
                    );

                    await pool.execute<ResultSetHeader>(
                        `
                            INSERT INTO project_invites
                                (project_id, token, created_by, expires_at)
                            VALUES (?, ?, ?, ?)
                        `,
                        [projectId, token, userId, expiresAt],
                    );

                    const inviteUrl = `${process.env.WEB_URL}/invite/${token}`;
                    const [username] = email.split("@");

                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: `Invitation to join ${validatedData.name}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                                <h2>You have been invited to a Kanban project</h2>
                                <p>Hello ${username},</p>
                                <p>
                                    You have been invited to join the project 
                                    <strong>${validatedData.name}</strong>.
                                </p>
                                <p>
                                    Open the platform to view tasks, collaborate with your team,
                                    and manage the workflow.
                                </p>
                                <a 
                                    href="${inviteUrl}"
                                    style="
                                        display: inline-block;
                                        padding: 12px 20px;
                                        background-color: #4f46e5;
                                        color: white;
                                        text-decoration: none;
                                        border-radius: 8px;
                                        margin-top: 10px;
                                    "
                                >
                                    Open Project
                                </a>
                                <p style="margin-top: 20px;">
                                    If you believe this invitation was sent by mistake,
                                    you can ignore this email.
                                </p>
                            </div>
                        `,
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error(error);
                            res.status(500).send({
                                status: "error",
                                message: "Error sending email",
                            });
                        } else {
                            console.log(`Email sent: ${info.response}`);
                        }
                    });
                }),
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
                    slug,
                    show_priority_emoji,
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
        validateSlugSchema.parse(req.params);

        const { slug } = req.params;
        const userId = +req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        if (!slug) {
            res.status(400).json({
                status: "error",
                message: "Invalid project slug",
            });

            return;
        }

        const [projects] = await pool.execute<
            (Pick<Project, "id" | "name" | "owner_id"> & RowDataPacket)[]
        >(
            `
                SELECT 
                    p.id, 
                    p.name, 
                    p.owner_id 
                FROM projects p
                WHERE p.slug = ? AND (
                    p.id IN (
                        SELECT 
                            project_id 
                        FROM project_members 
                        WHERE user_id = ? AND role IN ("owner", "admin")
                    ) OR p.owner_id = ?
                )
            `,
            [slug, userId, userId],
        );

        if (!projects.length) {
            res.status(404).json({
                status: "error",
                message: "Project not found or access denied",
            });

            return;
        }

        const project = projects[0];

        if (!project) {
            res.status(404).json({
                status: "error",
                message: "Project not found or access denied",
            });

            return;
        }

        const validatedData = updateProjectSchema.parse(req.body);

        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (validatedData.icon) {
            updateFields.push("icon = ?");
            updateValues.push(validatedData.icon);
        }

        if (validatedData.color) {
            updateFields.push("color = ?");
            updateValues.push(validatedData.color);
        }

        if (validatedData.name) {
            updateFields.push("name = ?");
            updateValues.push(validatedData.name);

            const baseSlug = generateSlug(validatedData.name);

            if (!baseSlug) {
                res.status(400).json({
                    status: "error",
                    message:
                        "Project name must contain at least one letter or digit",
                });

                return;
            }

            validateSlugSchema.parse({ slug: baseSlug });

            const [slugRows] = await pool.execute<
                (Pick<Project, "slug"> & RowDataPacket)[]
            >(
                `
                    SELECT slug
                    FROM projects
                    WHERE slug LIKE ?
                `,
                [`${baseSlug}%`],
            );

            const existingSlugs = new Set(slugRows.map((row) => row.slug));
            existingSlugs.delete(slug as string);

            const newSlug = generateUniqueSlug(baseSlug, existingSlugs);

            updateFields.push("slug = ?");
            updateValues.push(newSlug);

            if (newSlug && slug && newSlug !== slug) {
                const [result] = await pool.execute<ResultSetHeader>(
                    `
                            INSERT IGNORE INTO project_slug_history 
                            (project_id, old_slug)
                            VALUES (?, ?)
                        `,
                    [project.id, slug],
                );

                if (result.affectedRows === 0) {
                    res.status(400).json({
                        status: "error",
                        message: "Failed to update slug",
                    });

                    return;
                }
            }
        }

        if (validatedData.description) {
            updateFields.push("description = ?");
            updateValues.push(validatedData.description);
        }

        if (validatedData.status) {
            updateFields.push("status = ?");
            updateValues.push(validatedData.status);
        }

        if (typeof validatedData.showPriorityEmoji === "boolean") {
            updateFields.push("show_priority_emoji = ?");
            updateValues.push(validatedData.showPriorityEmoji);
        }

        if (!updateFields.length) {
            res.status(400).json({
                status: "error",
                message: "No fields to update",
            });

            return;
        }

        updateValues.push(project.id);

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

        if (validatedData.columns && validatedData.columns.length) {
            await Promise.all(
                validatedData.columns.map(async (column) => {
                    if (column.id) {
                        await pool.execute<ResultSetHeader>(
                            `
                                UPDATE columns 
                                SET name = ?, position = ?, wip_limit = ?, updated_at = CURRENT_TIMESTAMP
                                WHERE id = ?
                            `,
                            [
                                column.name,
                                column.position,
                                column.wip_limit,
                                column.id,
                            ],
                        );
                    }
                }),
            );
        }

        if (
            validatedData.deletedColumnIds &&
            validatedData.deletedColumnIds.length
        ) {
            await Promise.all(
                validatedData.deletedColumnIds.map(async (id) => {
                    await pool.execute<ResultSetHeader>(
                        `DELETE FROM columns WHERE id = ? AND project_id = ?`,
                        [id, project.id],
                    );
                }),
            );
        }

        if (validatedData.labels && validatedData.labels.length) {
            await Promise.all(
                validatedData.labels.map(async (label) => {
                    if (label.id) {
                        await pool.execute<ResultSetHeader>(
                            `
                                UPDATE labels 
                                SET name = ?, color = ?, updated_at = CURRENT_TIMESTAMP
                                WHERE id = ?
                            `,
                            [label.name, label.color, label.id],
                        );
                    }
                }),
            );
        }

        if (
            validatedData.deletedLabelIds &&
            validatedData.deletedLabelIds.length
        ) {
            await Promise.all(
                validatedData.deletedLabelIds.map(async (id) => {
                    await pool.execute<ResultSetHeader>(
                        `DELETE FROM labels WHERE id = ? AND project_id = ?`,
                        [id, project.id],
                    );
                }),
            );
        }

        if (validatedData.categories && validatedData.categories.length) {
            await Promise.all(
                validatedData.categories.map(async (category) => {
                    if (category.id) {
                        await pool.execute<ResultSetHeader>(
                            `
                                UPDATE categories 
                                SET name = ?, color = ?, updated_at = CURRENT_TIMESTAMP
                                WHERE id = ?
                            `,
                            [category.name, category.color, category.id],
                        );
                    }
                }),
            );
        }

        if (
            validatedData.deletedCategoryIds &&
            validatedData.deletedCategoryIds.length
        ) {
            await Promise.all(
                validatedData.deletedCategoryIds.map(async (id) => {
                    await pool.execute<ResultSetHeader>(
                        `DELETE FROM categories WHERE id = ? AND project_id = ?`,
                        [id, project.id],
                    );
                }),
            );
        }

        if (validatedData.members && validatedData.members.length) {
            await Promise.all(
                validatedData.members.map(async (member) => {
                    await pool.execute<ResultSetHeader>(
                        `
                            UPDATE project_members 
                            SET role = ?
                            WHERE user_id = ? AND project_id = ?
                        `,
                        [member.role, member.id, project.id],
                    );
                }),
            );
        }

        if (validatedData.newColumns && validatedData.newColumns.length) {
            await Promise.all(
                validatedData.newColumns.map(async (column) => {
                    await pool.execute<ResultSetHeader>(
                        `
                            INSERT INTO columns (project_id, name, position)
                            VALUES (?, ?, ?)
                        `,
                        [project.id, column.name, column.position],
                    );
                }),
            );
        }

        if (validatedData.newLabels && validatedData.newLabels.length) {
            await Promise.all(
                validatedData.newLabels.map(async (label) => {
                    await pool.execute<ResultSetHeader>(
                        `
                            INSERT INTO labels (project_id, name, color)
                            VALUES (?, ?, ?)
                        `,
                        [project.id, label.name, label.color],
                    );
                }),
            );
        }

        if (validatedData.newCategories && validatedData.newCategories.length) {
            await Promise.all(
                validatedData.newCategories.map(async (category) => {
                    await pool.execute<ResultSetHeader>(
                        `
                            INSERT INTO categories (project_id, name, color)
                            VALUES (?, ?, ?)
                        `,
                        [project.id, category.name, category.color],
                    );
                }),
            );
        }

        if (validatedData.emails && validatedData.emails.length) {
            await Promise.all(
                validatedData.emails.map(async (email) => {
                    const token = crypto.randomBytes(32).toString("hex");
                    const expiresAt = new Date(
                        Date.now() + 7 * 24 * 60 * 60 * 1000,
                    );

                    await pool.execute<ResultSetHeader>(
                        `
                            INSERT INTO project_invites
                                (project_id, token, created_by, expires_at)
                            VALUES (?, ?, ?, ?)
                        `,
                        [project.id, token, userId, expiresAt],
                    );

                    const inviteUrl = `${process.env.WEB_URL}/invite/${token}`;
                    const [username] = email.split("@");

                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: `Invitation to join ${validatedData.name}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                                <h2>You have been invited to a Kanban project</h2>
                                <p>Hello ${username},</p>
                                <p>
                                    You have been invited to join the project 
                                    <strong>${validatedData.name}</strong>.
                                </p>
                                <p>
                                    Open the platform to view tasks, collaborate with your team,
                                    and manage the workflow.
                                </p>
                                <a 
                                    href="${inviteUrl}"
                                    style="
                                        display: inline-block;
                                        padding: 12px 20px;
                                        background-color: #4f46e5;
                                        color: white;
                                        text-decoration: none;
                                        border-radius: 8px;
                                        margin-top: 10px;
                                    "
                                >
                                    Open Project
                                </a>
                                <p style="margin-top: 20px;">
                                    If you believe this invitation was sent by mistake,
                                    you can ignore this email.
                                </p>
                            </div>
                        `,
                    };

                    transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                            console.error(error);
                            res.status(500).send({
                                status: "error",
                                message: "Error sending email",
                            });
                        } else {
                            console.log(`Email sent: ${info.response}`);
                        }
                    });
                }),
            );
        }

        const [updatedProject] = await pool.execute<Project[]>(
            `
                SELECT 
                    id, 
                    owner_id,
                    icon, 
                    color, 
                    name, 
                    description, 
                    status,
                    slug,
                    show_priority_emoji,
                    created_at,
                    updated_at
                FROM projects
                WHERE id = ?
            `,
            [project.id],
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
        validateSlugSchema.parse(req.params);

        const { slug } = req.params;
        const userId = +req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        if (!slug) {
            res.status(400).json({
                status: "error",
                message: "Invalid project slug",
            });

            return;
        }

        const [projects] = await pool.execute<
            (Pick<Project, "id" | "owner_id"> & RowDataPacket)[]
        >(`SELECT id, owner_id FROM projects WHERE slug = ?`, [slug]);

        if (projects.length === 0) {
            res.status(404).json({
                status: "error",
                message: "Project not found or access denied",
            });

            return;
        }

        const project = projects[0];

        if (!project) {
            res.status(404).json({
                status: "error",
                message: "Project not found or access denied",
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

        const [attachments] = await pool.execute<
            (Pick<
                Attachment,
                | "id"
                | "task_id"
                | "uploader_id"
                | "filename"
                | "file_url"
                | "mime_type"
                | "size_bytes"
                | "created_at"
            > &
                RowDataPacket)[]
        >(
            `
                SELECT 
                    a.id, 
                    a.task_id, 
                    a.uploader_id, 
                    a.filename, 
                    a.file_url, 
                    a.mime_type, 
                    a.size_bytes, 
                    a.created_at
                FROM attachments a
                JOIN tasks t ON a.task_id = t.id
                JOIN columns c ON t.column_id = c.id
                WHERE c.project_id = ?
            `,
            [project.id],
        );

        if (attachments && attachments.length) {
            attachments.map(async (attachment) => {
                const __dirname = path.resolve(path.dirname(""));
                const fileUrl = attachment.file_url.replace(/^\/files/, "");
                const filePath = path.join(__dirname, "/src/uploads", fileUrl);

                if (existsSync(filePath)) {
                    unlinkSync(filePath);
                }

                const [rows] = await pool.execute<ResultSetHeader>(
                    "DELETE FROM attachments WHERE id = ?",
                    [attachment.id],
                );

                if (rows.affectedRows === 0) {
                    res.status(400).json({
                        status: "error",
                        message: "Failed to delete file",
                    });

                    throw Error("Failed to delete file");
                }
            });
        }

        const [result] = await pool.execute<ResultSetHeader>(
            `DELETE FROM projects WHERE id = ?`,
            [project.id],
        );

        if (result.affectedRows === 0) {
            res.status(404).json({
                status: "error",
                message: "Project not found or access denied",
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

export const changeRole = async (req: IGetUserRequest, res: Response) => {
    try {
        validateSlugSchema.parse(req.params);

        const { slug } = req.params;
        const userId = +req.user.id;

        if (!userId) {
            res.status(401).json({
                status: "error",
                message: "Unauthorized",
            });

            return;
        }

        if (!slug) {
            res.status(400).json({
                status: "error",
                message: "Invalid project slug",
            });

            return;
        }

        const validatedData = changeRoleSchema.parse(req.body);

        const [projects] = await pool.execute<
            (Pick<Project, "id"> & RowDataPacket)[]
        >(
            `
                SELECT 
                    p.id
                FROM projects p
                WHERE p.slug = ? AND (
                    p.id IN (
                        SELECT 
                            project_id 
                        FROM project_members 
                        WHERE user_id = ? AND role IN ("owner")
                    ) OR p.owner_id = ? 
                )
            `,
            [slug, userId, userId],
        );

        if (projects.length === 0) {
            res.status(404).json({
                status: "error",
                message: "Project not found or access denied",
            });

            return;
        }

        const project = projects[0];

        if (!project) {
            res.status(404).json({
                status: "error",
                message: "Project not found or access denied",
            });

            return;
        }

        const [members] = await pool.execute<(ProjectMember & RowDataPacket)[]>(
            `
                SELECT 
                    *
                FROM project_members
                WHERE project_id = ? AND user_id = ? AND role != "owner"
            `,
            [project.id, validatedData.memberId],
        );

        if (members.length === 0) {
            res.status(404).json({
                status: "error",
                message: "Member not found or access denied",
            });

            return;
        }

        const member = members[0];

        if (!member) {
            res.status(404).json({
                status: "error",
                message: "Member not found or access denied",
            });

            return;
        }

        const [result] = await pool.execute<ResultSetHeader>(
            `
                UPDATE project_members 
                SET role = ? 
                WHERE user_id = ? AND project_id = ?
            `,
            [validatedData.role, validatedData.memberId, project.id],
        );

        if (result.affectedRows === 0) {
            res.status(404).json({
                status: "error",
                message: "Role not changed",
            });

            return;
        }

        res.status(200).json({
            status: "success",
            message: "Role changed successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Database error" });
    }
};

export const deleteMember = async (
    req: IGetUserRequest,
    res: Response,
): Promise<void> => {
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
                message: "Invalid project ID",
            });

            return;
        }

        const validatedData = deleteMemberSchema.parse(req.body);

        const projectId = +id;

        const [userAccess] = await pool.execute<
            (Pick<ProjectMember, "role"> & RowDataPacket)[]
        >(
            `
                SELECT role
                FROM project_members
                WHERE project_id = ?
                AND user_id = ?
                AND role IN ("owner")
            `,
            [projectId, userId],
        );

        if (!userAccess.length || !userAccess[0]) {
            res.status(403).json({
                status: "error",
                message: "Forbidden",
            });

            return;
        }

        const [memberAccess] = await pool.execute<
            (Pick<ProjectMember, "role"> & RowDataPacket)[]
        >(
            `
                SELECT role
                FROM project_members
                WHERE project_id = ?
                AND user_id = ?
                AND role IN ("admin", "member", "viewer")
            `,
            [projectId, validatedData.memberId],
        );

        if (!memberAccess.length || !memberAccess[0]) {
            res.status(404).json({
                status: "error",
                message: "Member not found in the project",
            });

            return;
        }

        const [deleteFromTasksRows] = await pool.execute<ResultSetHeader>(
            `
                DELETE tm
                FROM task_members tm
                INNER JOIN tasks t ON tm.task_id = t.id
                INNER JOIN columns c ON t.column_id = c.id
                WHERE c.project_id = ? 
                AND tm.user_id = ?;
            `,
            [projectId, validatedData.memberId],
        );

        const [deleteFromProjectRows] = await pool.execute<ResultSetHeader>(
            "DELETE FROM project_members WHERE user_id = ? AND project_id = ?",
            [validatedData.memberId, projectId],
        );

        if (deleteFromProjectRows.affectedRows === 0) {
            res.status(400).json({
                status: "error",
                message: "Failed to delete member from project",
            });

            return;
        }

        res.status(201).json({
            status: "success",
            message: "Member has been deleted",
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

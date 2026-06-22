import type { RowDataPacket } from "mysql2";
import type { Request } from "express";

export type Priority = "low" | "medium" | "high" | "critical";

export interface PriorityConfig {
    id: number;
    label: string;
    order?: number;
    color?: string;
}

export type Status = "active" | "paused" | "completed" | "archived";
export type Columns = "todo" | "in_progress" | "in_review" | "done";

export interface ColumnConfig {
    id: number;
    label: string;
    order?: number;
    color?: string;
}

export type Role = "owner" | "admin" | "member" | "viewer";

export interface Base extends RowDataPacket {
    id: number;
    created_at: string | Date;
}

export interface ExtendedBase extends Base {
    updated_at: string | Date | null;
}

export interface SimpleBase extends RowDataPacket {
    id: number;
}

export interface User extends SimpleBase {
    name: string;
    surname: string;
    email: string;
    avatar_url: string;
    role: Role;
    joined_at: string | Date;
    color: string;
    status: "active" | "pending";
    reset_token: string;
    reset_token_expires_at: Date | string;
}

export interface Project extends ExtendedBase {
    name: string;
    description: string;
    owner: Pick<User, "name" | "avatar_url">;
    members: Omit<User, "email">[];
    status: Status;
    categories: Category[];
    labels: Label[];
    tasks_total?: number;
    tasks_done?: number;
    icon: string;
    color: string;
    columns?: (ColumnConfig & Column)[];
    slug: string;
}

export interface Subtask extends Base {
    title: string;
    position: number;
    is_done: boolean;
}

export interface Attachment extends Base {
    uploader_id: number;
    task_id: number;
    filename: string;
    file_url: string;
    mime_type: string;
    size_bytes: number;
}

export interface Comment extends ExtendedBase {
    member: Omit<User, "email">;
    body: string;
}

export interface Category extends ExtendedBase {
    name: string;
    description: string;
    color: string;
}

export interface Label extends ExtendedBase {
    name: string;
    color: string;
}

export interface Task extends ExtendedBase {
    title: string;
    description: string;
    position: number;
    due_date: string | Date;
    start_date: string | Date;
    priority: Priority;
    column: Columns;
    labels: string[];
    categories: Category[];
    members: Omit<User, "email">[];
    subtasks: Subtask[];
    subtasks_done?: number;
    subtasks_total?: number;
    show_progress: boolean;
    attachments: Attachment[];
    comments: Comment[];
    project: Pick<Project, "id" | "name" | "color" | "icon">;
}

export interface Column extends ExtendedBase {
    name: string;
    position: number;
    wip_limit: number;
    tasks: Task[];
}

export interface IGetUserRequest extends Request {
    user?: any;
}

export interface FilterOptions {
    statuses: Pick<Column, "id" | "name">[];
    projects: Pick<Project, "id" | "name" | "color">[];
}

export interface ProjectInvite extends RowDataPacket {
    id: number;
    project_id: number;
    token: string;
    created_by: number;
    expires_at: string;
    used: number;
    created_at: string;
}

export interface ProjectMember extends RowDataPacket {
    id: number;
    project_id: number;
    user_id: number;
}

export interface ProjectSlugHistory extends RowDataPacket {
    id: number;
    project_id: number;
    old_slug: string;
    created_at: string;
}

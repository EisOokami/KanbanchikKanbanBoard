import type { RowDataPacket } from "mysql2";
import type { Request } from "express";

export type Priority = "low" | "medium" | "high" | "critical";
export type Status = "active" | "paused" | "completed" | "archived";
export type Role = "owner" | "admin" | "member" | "viewer";

export interface User extends RowDataPacket {
    id: number;
    name: string;
    surname: string;
    email: string;
    password: string | null;
    avatar_url: string | null;
    color: string;
    google_id: string | null;
    auth_provider: "local" | "google";
    created_at: string;
    updated_at: string;
    reset_token: string | null;
    reset_token_expires_at: string | null;
    mfa_enabled: boolean;
    mfa_secret: Buffer | null;
    mfa_enabled_at: string | null;
    is_verified: boolean;
    verification_token: string | null;
    verification_token_expires: string | null;
    terms_accepted_at: string;
    terms_version: string;
    privacy_accepted_at: string;
    privacy_version: string;
}

export interface Project extends RowDataPacket {
    id: number;
    owner_id: number;
    name: string;
    slug: string;
    icon: string;
    color: string;
    description: string | null;
    status: Status;
    show_priority_emoji: number;
    created_at: string;
    updated_at: string;
}

export interface Subtask extends RowDataPacket {
    id: number;
    task_id: number;
    title: string;
    position: number;
    created_at: string;
    is_done: number | null;
}

export interface Attachment extends RowDataPacket {
    id: number;
    task_id: number | null;
    uploader_id: number;
    filename: string;
    file_url: string;
    mime_type: string | null;
    size_bytes: number | null;
    created_at: number;
}

export interface Comment extends RowDataPacket {
    id: number;
    task_id: number;
    user_id: number | null;
    body: string;
    created_at: string;
    updated_at: string | null;
}

export interface Category extends RowDataPacket {
    id: number;
    project_id: number;
    name: string;
    color: string;
    created_at: string;
    updated_at: string;
}

export interface Label extends RowDataPacket {
    id: number;
    project_id: number;
    name: string;
    color: string;
    created_at: string;
    updated_at: string;
}

export interface Task extends RowDataPacket {
    id: number;
    column_id: number;
    creator_id: number;
    title: string;
    description: string | null;
    position: number;
    due_date: string | null;
    start_date: string | null;
    priority: Priority;
    show_progress: number;
    created_at: string;
    updated_at: string;
}

export interface Column extends RowDataPacket {
    id: number;
    project_id: number;
    name: string;
    position: number;
    wip_limit: number | null;
    total_tasks?: number;
    created_at: string;
    updated_at: string;
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
    project_id: number;
    user_id: number;
    role: Role;
    status: "active" | "pending";
    joined_at: string;
}

export interface ProjectSlugHistory extends RowDataPacket {
    id: number;
    project_id: number;
    old_slug: string;
    created_at: string;
}

export interface TaskMembers extends RowDataPacket {
    task_id: number;
    user_id: number;
}

export interface RefreshSession extends RowDataPacket {
    id: string;
    user_id: number;
    refresh_token_hash: string;
    revoked: boolean;
    expires_at: string;
    replaced_by: string | null;
    replaced_at: string | null;
}

export interface GoogleProfile {
    googleId: string;
    email: string;
    emailVerified: boolean;
    name: string;
    surname: string;
    avatarUrl: string | null;
}

export interface MfaLoginSession extends RowDataPacket {
    id: string;
    token_hash: string;
    user_id: number;
    ip_address: string | null;
    user_agent: string | null;
    attempts: number;
    expires_at: string;
    created_at: string;
}

export interface MfaBackupCode extends RowDataPacket {
    id: string;
    user_id: number;
    code_hash: string;
    used_at: string | null;
    created_at: string;
}

export interface LoginEmailCodes extends RowDataPacket {
    id: number;
    token_hash: string;
    user_id: number;
    code_hash: string;
    attempts: number;
    ip_address: string;
    user_agent: string;
    last_sent_at: string | null;
    expires_at: string;
    created_at: string;
}

export type AuditReason =
    | "suspicious_query"
    | "suspicious_body"
    | "suspicious_path"
    | "suspicious_user_agent"
    | "rate_limit_exceeded"
    | "not_found";

export interface RequestWithAuditFlag extends Request {
    flaggedSuspicious?: boolean;
}

export interface AccountDeletionSession extends RowDataPacket {
    id: number;
    token_hash: string;
    user_id: number;
    method: "totp" | "email";
    code_hash: string;
    attempts: number;
    last_sent_at: string;
    expires_at: string;
    created_at: string;
}

export interface OwnershipTransferSession extends RowDataPacket {
    id: number;
    token_hash: string;
    user_id: number;
    project_id: number;
    target_member_id: number;
    method: "totp" | "email";
    code_hash: string;
    attempts: number;
    last_sent_at: string;
    expires_at: string;
    created_at: string;
}

import { LucideProps } from "lucide-react";
import { FC } from "react";
import { DateRange } from "react-day-picker";

export type Priority = "low" | "medium" | "high" | "critical";

export interface PriorityConfig {
    id: number;
    label: string;
    pill: string;
    dot?: string;
    order?: number;
    icon?: FC<LucideProps>;
    color?: string;
}

export type Status = "active" | "paused" | "completed" | "archived";
export type Columns = "todo" | "in_progress" | "in_review" | "done";

export interface ColumnConfig {
    id: number;
    label: string;
    pill: string;
    dot?: string;
    order?: number;
    icon?: FC<LucideProps>;
    color?: string;
}

export type Role = "owner" | "admin" | "member" | "viewer";

export interface Base {
    id: number;
    created_at: string | Date;
}

export interface ExtendedBase extends Base {
    updated_at: string | Date | null;
}

export interface Member extends Omit<Base, "created_at"> {
    name: string;
    surname: string;
    email: string;
    avatar_url: string;
    role: Role;
    joined_at: string | Date;
    color: string;
    // status: "active" | "pending"
}

export interface Project extends ExtendedBase {
    name: string;
    description: string;
    owner: Pick<Member, "name" | "avatar_url">;
    members: Omit<Member, "email">[];
    status: Status;
    tasksTotal?: number;
    tasksDone?: number;
    icon: string;
    color: string;
    columns: (ColumnConfig & Column)[];
}

export interface Subtask extends Base {
    text: string;
    position: number;
    is_done: boolean;
}

export interface Attachment extends Base {
    uploader_id: number;
    filename: string;
    file_url: string;
    mime_type: string;
    size_bytes: number;
}

export interface Comment extends ExtendedBase {
    assignee: Omit<Member, "email">;
    body: string;
}

export interface Category extends ExtendedBase {
    name: string;
    description: string;
    color: string;
    pill: string;
}

export interface Label extends Omit<Base, "created_at"> {
    name: string;
    color: string;
}

export interface Task extends ExtendedBase {
    title: string;
    description: string;
    position: number;
    due_date: string | Date;
    priority: Priority;
    column: Columns;
    labels: string[];
    categories: Category[];
    assignees: Omit<Member, "email">[];
    subtasks: Subtask[];
    subtasksDone?: number;
    subtasksTotal?: number;
    attachments: Attachment[];
    comments: Comment[];
}

export interface Column extends ExtendedBase {
    name: string;
    position: number;
    wip_limit: number;
    tasks: Task[];
}

export type SortField =
    | "title"
    | "status"
    | "priority"
    | "dueDate"
    | "progress"
    | "assignees"
    | "category"
    | "project";
export type SortDir = "asc" | "desc";

export interface FilterState {
    search: string;
    columns: Columns[];
    priorities: Priority[];
    projects?: Pick<Project, "name">[];
    assignees?: Omit<Member, "email">[];
    categories?: Category[];
    overdue: boolean;
    progress?: [number, number];
    hasAttachment?: boolean;
    hasChecklist?: boolean;
    dueSoon?: boolean;
    dateRange?: DateRange | undefined;
}

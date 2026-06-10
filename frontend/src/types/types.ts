import { DateRange } from "react-day-picker";

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

export interface Base {
    id: number;
    created_at: string | Date;
}

export interface ExtendedBase extends Base {
    updated_at: string | Date | null;
}

export interface User extends Omit<Base, "created_at"> {
    name: string;
    surname: string;
    email: string;
    avatar_url: string;
    role: Role;
    joined_at: string | Date;
    color: string;
    status: "active" | "pending";
}

export interface Project extends ExtendedBase {
    name: string;
    description: string;
    owner: Pick<User, "name" | "avatar_url">;
    members: Omit<User, "email">[];
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
    assignee: Omit<User, "email">;
    body: string;
}

export interface Category extends ExtendedBase {
    name: string;
    description: string;
    color: string;
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
    start_date: string | Date;
    priority: Priority;
    column: Columns;
    labels: string[];
    categories: Category[];
    assignees: Omit<User, "email">[];
    subtasks: Subtask[];
    subtasksDone?: number;
    subtasksTotal?: number;
    showProgress: boolean;
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
    columns: string[];
    priorities: Priority[];
    projects?: Pick<Project, "name">[];
    assignees?: Omit<User, "email">[];
    categories?: string[];
    overdue: boolean;
    progress?: [number, number];
    hasAttachment?: boolean;
    hasSubtasks?: boolean;
    dueSoon?: boolean;
    dateRange?: DateRange | undefined;
}

import { DateRange } from "react-day-picker";

export type Priority = "low" | "medium" | "high" | "critical";
export interface PriorityConfig {
    id: number;
    label: string;
    order?: number;
    color?: string;
    emoji: string;
}
export type Status = "active" | "paused" | "completed" | "archived";
export type Columns = "todo" | "in_progress" | "in_review" | "done";
export type Role = "owner" | "admin" | "member" | "viewer";
export type SortField =
    | "title"
    | "status"
    | "priority"
    | "dueDate"
    | "progress"
    | "members"
    | "category"
    | "project";
export type TaskSortField =
    | "title"
    | "priority"
    | "due_date"
    | "created_at"
    | "progress";
export type SortDirection = "asc" | "desc";
export type NavSection =
    | "general"
    | "columns"
    | "categories"
    | "labels"
    | "members"
    | "danger";

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
    categories: Category[];
    labels: Label[];
    status: Status;
    tasks_total?: number;
    tasks_done?: number;
    icon: string;
    color: string;
    columns: Column[];
    slug: string;
    show_priority_emoji: boolean;
}

export interface Subtask extends Base {
    title: string;
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
    member: Omit<User, "email">;
    body: string;
}

export interface Category extends ExtendedBase {
    name: string;
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
    column: Column;
    labels: Label[];
    categories: Category[];
    members: Omit<User, "email">[];
    subtasks: Subtask[];
    subtasks_done?: number;
    subtasks_total?: number;
    show_progress: boolean;
    attachments: Attachment[];
    comments: Comment[];
    project: Pick<Project, "id" | "name" | "color" | "icon" | "slug">;
}

export interface Column extends ExtendedBase {
    name: string;
    position: number;
    wip_limit: number | null;
    total_tasks?: number;
    tasks: Task[];
}

export interface FilterState {
    search: string;
    columns: string[];
    priorities: Priority[];
    projects?: Pick<Project, "name">[];
    members?: Omit<User, "email">[];
    categories?: string[];
    overdue: boolean;
    progress?: [number, number];
    has_attachment?: boolean;
    has_subtasks?: boolean;
    due_soon?: boolean;
    date_range?: DateRange | undefined;
    start_date_range?: DateRange | undefined;
    sortField?: TaskSortField;
    sortDirection?: SortDirection;
}

export interface FilterOptions {
    statuses: Pick<Column, "id" | "name">[];
    projects: Pick<Project, "id" | "name" | "color">[];
}

export interface UserData {
    status: "success" | "error";
    message: string;
    data: User | null;
}

export interface NewProjectFormData {
    members: string[];
    categories: Omit<Category, "updated_at" | "created_at">[];
    columns: Omit<Column, "tasks" | "updated_at" | "created_at">[];
    labels: Omit<Label, "created_at" | "updated_at">[];
}

export interface ProjectSettingsFormData {
    categories: Category[];
    newCategories: Omit<Category, "created_at" | "updated_at">[];
    deletedCategoryIds: number[];
    columns: Column[];
    newColumns: Omit<Column, "created_at" | "updated_at" | "tasks">[];
    deletedColumnIds: number[];
    labels: Label[];
    newLabels: Omit<Label, "created_at" | "updated_at">[];
    deletedLabelIds: number[];
    members: Omit<User, "email">[];
    emails: string[];
}

export interface CreateTaskFormData {
    categories: Category[];
    newCategories: Omit<Category, "created_at" | "updated_at">[];
    members: Omit<User, "email">[];
    subtasks: Omit<Subtask, "created_at">[];
    attachments: { id: number | string; file: File }[];
    labels: Label[];
    newLabels: Omit<Label, "created_at" | "updated_at">[];
}

export interface UpdateTaskFormData {
    categories: Category[];
    members: Omit<User, "email">[];
    subtasks: Omit<Subtask, "created_at">[];
    newSubtasks: Omit<Subtask, "created_at">[];
    attachments: Attachment[];
    newAttachments: Attachment[];
    labels: Label[];
    comments: Comment[];
    newComments: Omit<Comment, "created_at" | "updated_at">[];
}

export interface GridCell {
    day: number;
    dateStr: string;
    isOtherMonth: boolean;
}

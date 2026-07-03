import { FilterState, TaskSortField } from "@/types/types";

export const DEFAULT_FILTER: FilterState = {
    search: "",
    columns: [],
    priorities: [],
    projects: [],
    members: [],
    categories: [],
    overdue: false,
    date_range: undefined,
    due_soon: false,
    start_date_range: undefined,
    has_attachment: false,
    has_subtasks: false,
    progress: [0, 100],
    sortField: undefined,
    sortDirection: undefined,
};

export const SORT_FIELDS: { value: TaskSortField; label: string }[] = [
    { value: "created_at", label: "Date created" },
    { value: "due_date", label: "Due date" },
    { value: "priority", label: "Priority" },
    { value: "title", label: "Title" },
    { value: "progress", label: "Progress" },
];

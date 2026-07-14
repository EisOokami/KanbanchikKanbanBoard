import { SortField } from "@/types/projectsOverview";
import { Status } from "@/types/types";

export const SORT_FIELDS: { value: SortField; label: string }[] = [
    { value: "name", label: "Name" },
    { value: "progress", label: "Progress" },
    { value: "members", label: "Members" },
    { value: "created_at", label: "Date created" },
];

export const STATUS_LABELS: Record<Status, string> = {
    active: "Active",
    paused: "Paused",
    completed: "Completed",
    archived: "Archived",
};

export const STATUS_COLORS: Record<Status, string> = {
    active: "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300 hover:bg-emerald-100 hover:text-emerald-700 hover:dark:bg-emerald-950/30 hover:dark:text-emerald-300",
    paused: "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300 hover:bg-amber-100 hover:text-amber-700 hover:dark:bg-amber-950/30 hover:dark:text-amber-300",
    completed:
        "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300 hover:bg-blue-100 hover:text-blue-700 hover:dark:bg-blue-950/30 hover:dark:text-blue-300",
    archived:
        "border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 hover:dark:bg-zinc-900 hover:dark:text-zinc-400",
};

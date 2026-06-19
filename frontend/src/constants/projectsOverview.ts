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
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    paused: "bg-amber-100 text-amber-700 border-amber-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
    archived: "bg-gray-100 text-gray-500 border-gray-200",
};

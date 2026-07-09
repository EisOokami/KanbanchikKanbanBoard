import { PRIORITY_ORDER } from "@/constants/tasks";
import {
    SortDirection,
    Task,
    TasksFilterState,
    TasksSortField,
} from "@/types/types";
import { isOverdue } from "./utils";

export const dt = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split("T")[0];
};

export function applyTasksFilter(
    tasks: Task[],
    filter: TasksFilterState,
): Task[] {
    return tasks.filter((task) => {
        if (filter.search.trim()) {
            const q = filter.search.toLowerCase();
            if (!task.title.toLowerCase().includes(q)) return false;
        }

        if (filter.columns.length > 0) {
            if (!filter.columns.includes(task.column.name)) return false;
        }

        if (filter.priorities.length > 0) {
            if (!filter.priorities.includes(task.priority)) return false;
        }

        if (filter.projects.length > 0) {
            if (!filter.projects.includes(task.project.name)) return false;
        }

        if (filter.overdue) {
            if (!isOverdue(task.due_date, task.column.name)) return false;
        }

        return true;
    });
}

export function sortTasks(
    tasks: Task[],
    field: TasksSortField,
    dir: SortDirection,
): Task[] {
    const sorted = [...tasks].sort((a, b) => {
        let cmp = 0;

        switch (field) {
            case "title":
                cmp = a.title.localeCompare(b.title);
                break;

            case "status":
                cmp = a.column.name.localeCompare(b.column.name);
                break;

            case "priority":
                cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
                break;

            case "project":
                cmp = a.project.name.localeCompare(b.project.name);
                break;

            case "members":
                cmp = a.members.length - b.members.length;
                break;

            case "dueDate": {
                const da = a.due_date
                    ? new Date(a.due_date).getTime()
                    : Infinity;
                const db = b.due_date
                    ? new Date(b.due_date).getTime()
                    : Infinity;
                cmp = da - db;
                break;
            }

            case "progress": {
                const pa = a.subtasks_total
                    ? (a.subtasks_done ?? 0) / a.subtasks_total
                    : 0;
                const pb = b.subtasks_total
                    ? (b.subtasks_done ?? 0) / b.subtasks_total
                    : 0;
                cmp = pa - pb;
                break;
            }
        }

        return dir === "asc" ? cmp : -cmp;
    });

    return sorted;
}

export function countActiveFilters(filter: TasksFilterState): number {
    return (
        filter.columns.length +
        filter.priorities.length +
        filter.projects.length +
        (filter.overdue ? 1 : 0)
    );
}

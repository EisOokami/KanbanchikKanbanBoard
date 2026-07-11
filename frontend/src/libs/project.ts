import { PRIORITY_ORDER } from "@/constants/constants";
import { SortDirection, SortField, Task } from "@/types/types";

const EPSILON = 1e-9;
const INITIAL_GAP = 65536;

export function midpoint(prev: number | null, next: number | null): number {
    if (prev === null && next === null) {
        return INITIAL_GAP;
    }

    if (prev === null) {
        return (next as number) / 2;
    }

    if (next === null) {
        return prev + INITIAL_GAP;
    }

    return (prev + next) / 2;
}

export function needsRebalance(
    prev: number | null,
    next: number | null,
): boolean {
    if (prev === null || next === null) {
        return false;
    }

    return next - prev < EPSILON * 2;
}

export function rebalanceTasks(tasks: Task[]): Task[] {
    return tasks.map((task, i) => ({
        ...task,
        position: (i + 1) * INITIAL_GAP,
    }));
}

export function getSurroundingPositions(
    tasks: Task[],
    insertIndex: number,
): { prev: number | null; next: number | null } {
    const sorted = [...tasks].sort((a, b) => a.position - b.position);
    const clampedIndex = Math.min(insertIndex, sorted.length);
    const prev = clampedIndex > 0 ? sorted[clampedIndex - 1].position : null;
    const next =
        clampedIndex < sorted.length ? sorted[clampedIndex].position : null;

    return { prev, next };
}

export const getSortedTasks = (
    tasks: Task[],
    sortField: SortField,
    sortDir: SortDirection,
): Task[] => {
    return [...tasks].sort((a, b) => {
        let cmp = 0;

        switch (sortField) {
            case "title":
                cmp = a.title.localeCompare(b.title);
                break;
            case "category":
                cmp = (a.categories[0]?.name ?? "").localeCompare(
                    b.categories[0]?.name ?? "",
                );
                break;
            case "status":
                cmp = a.column.name.localeCompare(b.column.name);
                break;
            case "priority":
                cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
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
            case "members":
                cmp = a.members.length - b.members.length;
                break;
            default:
                cmp = a.position - b.position;
        }

        return sortDir === "asc" ? cmp : -cmp;
    });
};

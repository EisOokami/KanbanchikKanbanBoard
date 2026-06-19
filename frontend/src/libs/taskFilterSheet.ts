import { Column, FilterState } from "@/types/types";
import { isAfter, isBefore, addDays, startOfDay } from "date-fns";

export function applyTaskFilters(
    columns: Column[],
    filters: FilterState,
): Column[] {
    return columns.map((column) => {
        if (
            filters.columns.length > 0 &&
            !filters.columns.includes(column.name)
        ) {
            return { ...column, tasks: [] };
        }

        let tasks = [...column.tasks];

        if (filters.search.trim()) {
            const value = filters.search.toLowerCase();

            tasks = tasks.filter(
                (task) =>
                    task.title.toLowerCase().includes(value) ||
                    task.description?.toLowerCase().includes(value),
            );
        }

        if (filters.priorities.length > 0) {
            tasks = tasks.filter((task) =>
                filters.priorities.some(
                    (priority) => priority.toLowerCase() === task.priority,
                ),
            );
        }

        if (filters.members && filters.members.length > 0) {
            const ids = filters.members.map((member) => member.id);

            tasks = tasks.filter((task) =>
                task.members.some((member) => ids.includes(member.id)),
            );
        }

        if (filters.categories && filters.categories.length > 0) {
            tasks = tasks.filter((task) =>
                task.categories.some((category) =>
                    filters.categories!.includes(category.name),
                ),
            );
        }

        if (filters.overdue) {
            tasks = tasks.filter(isOverdue);
        }

        if (filters.due_soon) {
            tasks = tasks.filter(isDueSoon);
        }

        if (filters.date_range?.from) {
            tasks = tasks.filter((task) => {
                if (!task.due_date) {
                    return false;
                }

                const due = new Date(task.due_date);
                const from = filters.date_range!.from!;
                const to = filters.date_range!.to ?? from;

                return (
                    !isBefore(due, startOfDay(from)) &&
                    !isAfter(due, startOfDay(addDays(to, 1)))
                );
            });
        }

        if (
            filters.progress &&
            (filters.progress[0] > 0 || filters.progress[1] < 100)
        ) {
            tasks = tasks.filter((task) => {
                const progress = getProgress(task);
                return (
                    progress >= filters.progress![0] &&
                    progress <= filters.progress![1]
                );
            });
        }

        if (filters.has_attachment) {
            tasks = tasks.filter((task) => task.attachments?.length > 0);
        }

        if (filters.has_subtasks) {
            tasks = tasks.filter((task) => (task.subtasks_total ?? 0) > 0);
        }

        tasks = sortTasks(tasks, filters);

        return { ...column, tasks };
    });
}

export function countActive(filters: FilterState): number {
    let n = 0;

    if (filters.search) n++;
    if (filters.priorities.length) n += filters.priorities.length;
    if (filters.columns.length) n += filters.columns.length;
    if (filters.members?.length) n += filters.members.length;
    if (filters.categories?.length) n += filters.categories.length;
    if (filters.date_range?.from) n++;
    if (filters.due_soon) n++;
    if (filters.overdue) n++;
    if (filters.has_attachment) n++;
    if (filters.has_subtasks) n++;
    if (
        filters.progress &&
        (filters.progress[0] > 0 || filters.progress[1] < 100)
    )
        n++;

    return n;
}

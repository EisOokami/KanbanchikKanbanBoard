import { FilterState } from "@/types/types";

export function countActive(filters: FilterState): number {
    let n = 0;
    if (filters.search) n++;
    if (filters.priorities.length) n += filters.priorities.length;
    if (filters.columns.length) n += filters.columns.length;
    if (filters.assignees && filters.assignees.length)
        n += filters.assignees.length;
    if (filters.categories && filters.categories.length)
        n += filters.categories.length;
    if (filters.dateRange?.from) n++;
    if (filters.dueSoon) n++;
    if (filters.overdue) n++;
    if (filters.hasAttachment) n++;
    if (filters.hasChecklist) n++;
    if (
        filters.progress &&
        (filters.progress[0] > 0 || filters.progress[1] < 100)
    )
        n++;
    return n;
}

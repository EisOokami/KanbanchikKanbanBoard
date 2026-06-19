import { FilterSortOptions } from "@/types/projectsOverview";
import { Project } from "@/types/types";

export function applyFiltersAndSort(
    projects: Project[],
    search: string,
    opts: FilterSortOptions,
): Project[] {
    let result = [...projects];

    if (search.trim()) {
        const q = search.toLowerCase();
        result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (opts.statuses.length > 0) {
        result = result.filter((p) => opts.statuses.includes(p.status));
    }

    if (opts.memberIds.length > 0) {
        result = result.filter((p) =>
            p.members.some((m) => opts.memberIds.includes(m.id)),
        );
    }

    if (opts.categoryIds.length > 0) {
        result = result.filter((p) =>
            p.categories.some((c) => opts.categoryIds.includes(c.id)),
        );
    }

    result.sort((a, b) => {
        let cmp = 0;
        switch (opts.sortField) {
            case "name":
                cmp = a.name.localeCompare(b.name);
                break;
            case "progress": {
                const pa = a.tasks_total
                    ? (a.tasks_done ?? 0) / a.tasks_total
                    : 0;
                const pb = b.tasks_total
                    ? (b.tasks_done ?? 0) / b.tasks_total
                    : 0;
                cmp = pa - pb;
                break;
            }
            case "members":
                cmp = a.members.length - b.members.length;
                break;
            case "created_at":
                cmp =
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime();
                break;
        }
        return opts.sortDirection === "asc" ? cmp : -cmp;
    });

    return result;
}

export function countActiveFilters(opts: FilterSortOptions): number {
    return (
        opts.statuses.length + opts.memberIds.length + opts.categoryIds.length
    );
}
